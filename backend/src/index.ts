// src/index.ts

import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { spawn } from "child_process";
import path from "path";
import fs from "fs";
import { createClient } from "@supabase/supabase-js";

dotenv.config();

// --- Supabase setup ---
const supabaseUrl = process.env.SUPABASE_URL as string;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY as string;
const bucketName = process.env.SUPABASE_BUCKET || 'videos';
if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Supabase credentials are not set in environment variables');
}
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false }
});

const app = express();
const port = process.env.PORT || 3001;

const allowedOrigin = process.env.NODE_ENV === "production" 
  ? "http://localhost:5173" // Replace with your production frontend URL
  : "http://localhost:5173";

const corsOptions: cors.CorsOptions = {
  origin: allowedOrigin,
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());

const uploadsDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// --- Helper Functions ---

function createJobId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function timeToSeconds(timeStr: string): number {
  const parts = timeStr.split(':');
  return parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + parseFloat(parts[2]);
}

function secondsToTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.max(0, seconds % 60); // Ensure seconds are not negative
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toFixed(3).padStart(6, '0')}`;
}

async function adjustSubtitleTimestamps(inputPath: string, outputPath: string, startTime: string): Promise<void> {
  const startSeconds = timeToSeconds(startTime);
  const content = await fs.promises.readFile(inputPath, 'utf-8');
  const timestampRegex = /(\d{2}:\d{2}:\d{2}\.\d{3}) --> (\d{2}:\d{2}:\d{2}\.\d{3})/g;
  
  const adjustedContent = content.replace(timestampRegex, (match, start, end) => {
    const startSec = timeToSeconds(start) - startSeconds;
    const endSec = timeToSeconds(end) - startSeconds;
    if (endSec < 0) return ''; // Remove subtitles that end before the clip starts
    return `${secondsToTime(startSec)} --> ${secondsToTime(endSec)}`;
  });
  
  await fs.promises.writeFile(outputPath, adjustedContent.replace(/^WEBVTT\n\n/, 'WEBVTT\n\n'), 'utf-8');
}

async function getVideoDimensions(filePath: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const ffprobe = spawn('ffprobe', [
      '-v', 'error',
      '-select_streams', 'v:0',
      '-show_entries', 'stream=width,height',
      '-of', 'json',
      filePath
    ]);

    let jsonData = '';
    ffprobe.stdout.on('data', (data) => { jsonData += data.toString(); });
    ffprobe.stderr.on('data', (data) => { console.error(`ffprobe stderr: ${data}`); });
    ffprobe.on('close', (code) => {
      if (code === 0) {
        try {
          const info = JSON.parse(jsonData);
          resolve({
            width: info.streams[0].width,
            height: info.streams[0].height,
          });
        } catch (e) { reject(new Error('Failed to parse ffprobe output')); }
      } else { reject(new Error(`ffprobe exited with code ${code}`)); }
    });
    ffprobe.on('error', reject);
  });
}


app.post("/api/clip", async (req, res) => {
  const { url, startTime, endTime, subtitles, formatId, aspectRatio = 'original', userId } = req.body || {};
  if (!url || !startTime || !endTime || !userId) {
    return res.status(400).json({ error: "url, startTime, endTime and userId are required" });
  }

  const id = createJobId();
  const outputPath = path.join(uploadsDir, `clip-${id}.mp4`);
  
  await supabase.from('jobs').insert([{ id, user_id: userId, status: 'processing' }]);

  res.status(202).json({ id });

  // Process video in the background
  (async () => {
    let finalJobStatus: { [key: string]: any } = {};
    const fastPath = path.join(uploadsDir, `clip-${id}-fast.mp4`);
    const subPath = outputPath.replace(/\.mp4$/, ".en.vtt");
    const adjustedSubPath = path.join(uploadsDir, `clip-${id}-adjusted.vtt`);

    try {
      // --- 1. Download Clip with yt-dlp ---
      console.log(`[job ${id}] Starting download with yt-dlp...`);
      const ytArgs = [ url, "-f", formatId || "bv[ext=mp4]+ba[ext=m4a]/best[ext=mp4]", "--download-sections", `*${startTime}-${endTime}`, "-o", outputPath, "--merge-output-format", "mp4", "--no-warnings" ];
      if (subtitles) ytArgs.push("--write-subs", "--write-auto-subs", "--sub-lang", "en", "--sub-format", "vtt");
      spawn('which', ['yt-dlp']).stdout.on('data', data => {
        console.log(`yt-dlp found at: ${data}`);
      });
      const yt = spawn('yt-dlp', ytArgs);
      await new Promise<void>((resolve, reject) => {
        let errorOutput = '';
        yt.stderr.on('data', (data) => { errorOutput += data.toString(); });
        yt.on('close', code => code === 0 ? resolve() : reject(new Error(`yt-dlp exited with code ${code}. Details: ${errorOutput}`)));
        yt.on('error', reject);
      });

      if (!fs.existsSync(outputPath) || fs.statSync(outputPath).size < 1024) {
          throw new Error('yt-dlp failed to download a valid video file. The time range or format might be invalid.');
      }
      console.log(`[job ${id}] Download complete. Starting ffmpeg processing...`);

      // --- 2. Process with FFmpeg (Crop, Subtitles, Re-encode) ---
      await new Promise<void>(async (resolve, reject) => {
        const ffmpegArgs = ['-y', '-i', outputPath];
        const videoFilters: string[] = [];
        const subtitlesExist = fs.existsSync(subPath);

        if (aspectRatio !== 'original') {
          try {
            const { width, height } = await getVideoDimensions(outputPath);
            if (aspectRatio === 'vertical' && width / height > 9 / 16) videoFilters.push('crop=ih*9/16:ih');
            else if (aspectRatio === 'square') videoFilters.push(width > height ? 'crop=ih:ih' : 'crop=iw:iw');
          } catch (err) { console.error(`[job ${id}] Could not get dimensions, skipping crop.`, err); }
        }

        // --- THE FIX FOR SUBTITLE PATHS ON WINDOWS ---
        if (subtitles && subtitlesExist) {
          await adjustSubtitleTimestamps(subPath, adjustedSubPath, startTime);
          let safeSubPath = adjustedSubPath.replace(/\\/g, '/').replace(/:/g, '\\:');
          videoFilters.push(`subtitles=filename='${safeSubPath}'`);
        }
        // --- END OF FIX ---

        if (videoFilters.length > 0) {
          ffmpegArgs.push('-vf', videoFilters.join(','));
          ffmpegArgs.push('-c:v', 'libx264', '-preset', 'veryfast', '-crf', '23', '-c:a', 'aac', '-b:a', '128k');
        } else {
          ffmpegArgs.push('-c:v', 'copy', '-c:a', 'aac', '-b:a', '128k');
        }
        
        ffmpegArgs.push('-movflags', '+faststart', fastPath);

        console.log(`[job ${id}] Running command: ffmpeg ${ffmpegArgs.join(' ')}`);
        const ff = spawn('ffmpeg', ffmpegArgs);
        
        let ffmpegErrorOutput = '';
        ff.stderr.on('data', (data) => {
          console.error(`[job ${id}] ffmpeg stderr: ${data.toString()}`);
          ffmpegErrorOutput += data.toString();
        });

        ff.on('close', (code) => {
          if (code === 0) resolve();
          else reject(new Error(`ffmpeg exited with code ${code}. Details: ${ffmpegErrorOutput}`));
        });

        ff.on('error', reject);
      });

      // --- 3. Upload to Supabase & Cleanup ---
      console.log(`[job ${id}] FFmpeg finished. Uploading to storage...`);
      await fs.promises.rename(fastPath, outputPath);
      
      const objectPath = `clips/clip-${id}.mp4`;
      const fileBuffer = await fs.promises.readFile(outputPath);
      const { error: uploadError } = await supabase.storage.from(bucketName).upload(objectPath, fileBuffer, { contentType: 'video/mp4', upsert: true });
      if (uploadError) throw uploadError;

      const { data: pub } = supabase.storage.from(bucketName).getPublicUrl(objectPath);
      
      finalJobStatus = { status: 'ready', public_url: pub.publicUrl, storage_path: objectPath };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(`[job ${id}] failed`, err);
      finalJobStatus = { status: 'error', error: message };
    } finally {
      // --- 4. Final Cleanup and Job Status Update ---
      await fs.promises.unlink(outputPath).catch(()=>{});
      await fs.promises.unlink(fastPath).catch(()=>{});
      if (fs.existsSync(subPath)) await fs.promises.unlink(subPath).catch(()=>{});
      if (fs.existsSync(adjustedSubPath)) await fs.promises.unlink(adjustedSubPath).catch(()=>{});

      await supabase.from('jobs').update(finalJobStatus).eq('id', id);
      console.log(`[job ${id}] Job status updated to: ${finalJobStatus.status}`);
    }
  })();
});

app.get('/api/clip/:id', async (req, res) => {
  const { id } = req.params;
  
  const { data: job, error } = await supabase
    .from('jobs')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !job) {
    console.log(`[job ${id}] not found in database. Error:`, error?.message);
    return res.status(404).json({ error: 'job not found'});
  }
  
  return res.json({ 
    status: job.status, 
    error: job.error, 
    url: job.public_url,
    storagePath: job.storage_path 
  });
});

app.delete('/api/clip/:id/cleanup', async (req, res) => {
  const { id } = req.params;

  const { error } = await supabase
    .from('jobs')
    .delete()
    .eq('id', id);

  if (error) {
    console.error(`[job ${id}] job cleanup error:`, error);
    return res.status(500).json({ error: 'Job cleanup failed' });
  }

  console.log(`[job ${id}] job metadata cleaned up successfully from database`);
  return res.json({ success: true });
});

app.get("/api/formats", async (req, res) => {
  const { url } = req.query;
  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: "url is required" });
  }

  try {
    const ytDlpPath = path.resolve(__dirname, '../bin/yt-dlp');
    const ytArgs = ['-j', '--no-warnings', url as string];
    
    const yt = spawn(ytDlpPath, ytArgs);
    
    let jsonData = '';
    yt.stdout.on('data', (data) => { jsonData += data.toString(); });

    yt.on('close', (code) => {
      if (code !== 0) return res.status(500).json({ error: `yt-dlp exited with code ${code}` });
      try {
        const info = JSON.parse(jsonData);
        const videoFormats = info.formats
          .filter((f: any) => f.vcodec !== 'none' && f.height && (f.ext === 'mp4' || f.ext === 'webm'))
          .map((f: any) => ({
            format_id: f.format_id,
            label: `${f.height}p${f.fps > 30 ? f.fps : ''}`,
            height: f.height,
            hasAudio: f.acodec !== 'none',
          }))
          .sort((a: any, b: any) => b.height - a.height);
        
        const uniqueFormats = videoFormats.reduce((acc: any[], current: any) => {
          if (!acc.some((item) => item.label === current.label)) acc.push(current);
          return acc;
        }, []);
        
        const formatsForUser = uniqueFormats.map((f: any) => ({
          format_id: f.hasAudio ? f.format_id : `${f.format_id}+bestaudio[ext=m4a]`,
          label: f.label
        }));
        
        return res.json({ 
          formats: formatsForUser,
          thumbnail: info.thumbnail,
          title: info.title
        });

      } catch (e) {
          return res.status(500).json({ error: 'Failed to parse yt-dlp output'});
      }
    });

    yt.on('error', (err) => res.status(500).json({ error: 'Failed to start yt-dlp process' }));

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return res.status(500).json({ error: message });
  }
});


app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});