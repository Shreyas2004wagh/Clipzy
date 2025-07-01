import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Download, 
  ChevronDown, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  Monitor,
  Smartphone,
  Square,
  Trash2
} from 'lucide-react';

// --- Configuration ---
const API_BASE_URL = 'http://localhost:3001/api';

// --- Type Definitions ---
interface Format {
  format_id: string;
  label: string;
}

interface JobStatus {
  status: 'processing' | 'ready' | 'error' | 'idle';
  url?: string | null;
  error?: string | null;
  storagePath?: string | null;
}

// --- NEW TYPE DEFINITION ---
interface VideoPreview {
  thumbnail: string;
  title: string;
}

type AspectRatio = 'original' | 'vertical' | 'square';

function App() {
  // --- State Management ---
  const [url, setUrl] = useState('https://youtu.be/w5h4QLDkPw4');
  const [startTime, setStartTime] = useState('00:00:05');
  const [endTime, setEndTime] = useState('00:00:20');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('vertical');
  const [subtitles, setSubtitles] = useState(true);
  
  const [formats, setFormats] = useState<Format[]>([]);
  const [selectedFormat, setSelectedFormat] = useState<string>('');
  const [isLoadingFormats, setIsLoadingFormats] = useState(false);
  
  const [jobId, setJobId] = useState<string | null>(null);
  const [jobStatus, setJobStatus] = useState<JobStatus>({ status: 'idle' });
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // --- NEW STATE FOR PREVIEW ---
  const [videoPreview, setVideoPreview] = useState<VideoPreview | null>(null);

  const pollIntervalRef = useRef<number | null>(null);

  // --- API Functions ---
  const fetchFormats = async () => {
    if (!url) {
      setError('Please enter a video URL first.');
      return;
    }
    setIsLoadingFormats(true);
    setError(null);
    setFormats([]);
    setSelectedFormat('');
    setVideoPreview(null); // --- MODIFICATION: Clear previous preview on new fetch ---
    try {
      const response = await fetch(`${API_BASE_URL}/formats?url=${encodeURIComponent(url)}`);
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || `HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setFormats(data.formats);
      
      // --- MODIFICATION START: Set video preview data if available ---
      if (data.thumbnail && data.title) {
        setVideoPreview({ thumbnail: data.thumbnail, title: data.title });
      }
      // --- MODIFICATION END ---

      // Set default to 'Best Available' which has an empty string value
      setSelectedFormat('');
    } catch (err: any) {
      setError(`Failed to fetch formats: ${err.message}`);
      setVideoPreview(null); // --- MODIFICATION: Ensure preview is cleared on error ---
    } finally {
      setIsLoadingFormats(false);
    }
  };

  const createClip = async () => {
    if (!url || !startTime || !endTime) {
      setError('URL, Start Time, and End Time are required.');
      return;
    }
    setJobId(null);
    setJobStatus({ status: 'idle' });
    setError(null);
    setIsProcessing(true);
    try {
      const response = await fetch(`${API_BASE_URL}/clip`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url,
          startTime: `${startTime}.000`,
          endTime: `${endTime}.000`,
          subtitles,
          formatId: selectedFormat || undefined,
          aspectRatio, // Pass the selected aspect ratio
          userId: `frontend-user-${Date.now()}`,
        }),
      });
      if (response.status !== 202) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to start clipping job.');
      }
      const data = await response.json();
      setJobId(data.id);
      setJobStatus({ status: 'processing' });
    } catch (err: any) {
      setError(`Error creating clip: ${err.message}`);
      setIsProcessing(false);
    }
  };

  const checkJobStatus = async (id: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/clip/${id}`);
      if (!response.ok) {
        if (response.status === 404) {
          stopPolling();
          setError(`Job ${id} not found. It may have been cleaned up.`);
          setIsProcessing(false);
          setJobStatus({ status: 'idle' });
        }
        return;
      }
      const data: JobStatus = await response.json();
      setJobStatus(data);
      if (data.status === 'ready' || data.status === 'error') {
        stopPolling();
        setIsProcessing(false);
      }
    } catch (err: any) {
      setError(`Polling error: ${err.message}`);
      stopPolling();
      setIsProcessing(false);
    }
  };

  const cleanupJob = async () => {
    if (!jobId) return;
    try {
      await fetch(`${API_BASE_URL}/clip/${jobId}/cleanup`, { method: 'DELETE' });
      setJobId(null);
      setJobStatus({ status: 'idle' });
      setFormats([]);
    } catch (err: any) {
      setError(`Cleanup failed: ${err.message}`);
    }
  };
  
  const stopPolling = () => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
  };
  
  const handleDownload = async (fileUrl: string, fileName: string) => {
    try {
      const response = await fetch(fileUrl);
      if (!response.ok) throw new Error('Network response was not ok');
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error("Download failed:", err);
      setError("Failed to download clip. Check console for CORS errors.");
    }
  };

  // --- MODIFICATION: Replaced useEffect with a more robust version ---
  useEffect(() => {
    const handler = setTimeout(() => {
      // Check for a valid-looking YouTube URL before fetching
      if (url && (url.includes('youtube.com/') || url.includes('youtu.be/'))) {
        fetchFormats();
      } else {
        // Clear state if the URL is empty or invalid
        setFormats([]);
        setSelectedFormat('');
        setVideoPreview(null);
      }
    }, 500); // Debounce API calls by 500ms

    return () => {
      clearTimeout(handler);
    };
  }, [url]);

  useEffect(() => {
    if (jobId && jobStatus.status === 'processing') {
      pollIntervalRef.current = window.setInterval(() => {
        checkJobStatus(jobId);
      }, 3000); 
    }
    return () => {
      stopPolling();
    };
  }, [jobId, jobStatus.status]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-4xl font-light text-white tracking-wide">
            What do you wanna clip?
          </h1>
        </div>

        {/* --- NEW: Video Preview Section --- */}
        <div className="h-24 flex items-end justify-center pb-4">
          {videoPreview && (
            <div className="transition-all duration-500 ease-out">
              <img 
                src={videoPreview.thumbnail} 
                alt={videoPreview.title} 
                className="h-16 w-auto rounded-lg shadow-2xl shadow-purple-900/40 border-2 border-gray-700"
              />
            </div>
          )}
        </div>

        {/* Main Form Card */}
        <div className="bg-gray-800/50 backdrop-blur-xl rounded-3xl p-8 border border-gray-700/60 shadow-2xl shadow-purple-900/10">
          {/* URL Input */}
          <div className="mb-4">
            <div className="relative">
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full px-4 py-3 bg-gray-900/70 border border-gray-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all pr-10"
                placeholder="Enter video URL"
              />
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
            </div>
          </div>

          {/* Time Inputs */}
          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1">
              <input
                type="text"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                placeholder="00:00:00"
                className="w-full px-3 py-3 bg-gray-900/70 border border-gray-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all text-center"
              />
            </div>
            <span className="text-gray-400 text-xs font-medium">to</span>
            <div className="flex-1">
              <input
                type="text"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                placeholder="00:00:00"
                className="w-full px-3 py-3 bg-gray-900/70 border border-gray-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all text-center"
              />
            </div>
          </div>

          {/* Aspect Ratio Buttons */}
          <div className="grid grid-cols-3 gap-2 mb-6">
            <button
              onClick={() => setAspectRatio('original')}
              className={`px-4 py-3 rounded-xl transition-all flex items-center justify-center gap-2 text-sm font-medium border ${
                aspectRatio === 'original'
                  ? 'bg-white text-black border-white'
                  : 'bg-transparent text-gray-300 border-gray-600 hover:border-gray-500 hover:bg-gray-700/50'
              }`}
            >
              <Monitor className="w-4 h-4" />
              Original
            </button>
            <button
              onClick={() => setAspectRatio('vertical')}
              className={`px-4 py-3 rounded-xl transition-all flex items-center justify-center gap-2 text-sm font-medium border ${
                aspectRatio === 'vertical'
                  ? 'bg-white text-black border-white'
                  : 'bg-transparent text-gray-300 border-gray-600 hover:border-gray-500 hover:bg-gray-700/50'
              }`}
            >
              <Smartphone className="w-4 h-4" />
              Vertical
            </button>
            <button
              onClick={() => setAspectRatio('square')}
              className={`px-4 py-3 rounded-xl transition-all flex items-center justify-center gap-2 text-sm font-medium border ${
                aspectRatio === 'square'
                  ? 'bg-white text-black border-white'
                  : 'bg-transparent text-gray-300 border-gray-600 hover:border-gray-500 hover:bg-gray-700/50'
              }`}
            >
              <Square className="w-4 h-4" />
              Square
            </button>
          </div>

          {/* Quality and Subtitles Row */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-gray-300 text-xs font-medium mb-2">Quality</label>
              <div className="relative">
                <select
                  value={selectedFormat}
                  onChange={(e) => setSelectedFormat(e.target.value)}
                  disabled={isLoadingFormats}
                  className="w-full px-4 py-3 bg-gray-900/70 border border-gray-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all appearance-none pr-10"
                >
                  {isLoadingFormats ? (
                    <option>Loading...</option>
                  ) : formats.length > 0 ? (
                    <>
                      <option value="">Best Available</option>
                      {formats.map((f) => (
                        <option key={f.format_id} value={f.format_id}>
                          {f.label}
                        </option>
                      ))}
                    </>
                  ) : (
                    <option>Best Available</option>
                  )}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none" />
              </div>
            </div>
            <div>
              <label className="block text-gray-300 text-xs font-medium mb-2">Subtitles</label>
              <div className="flex items-center h-[46px]">
                <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="subtitles"
                      checked={subtitles}
                      onChange={() => setSubtitles(true)}
                      className="hidden"
                    />
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center border-2 transition-colors ${subtitles ? 'border-white bg-white': 'border-gray-500'}`}>
                      {subtitles && <span className="w-2 h-2 rounded-full bg-black"></span>}
                    </span>
                  <span className="text-gray-300 text-sm">English only</span>
                </label>
              </div>
            </div>
          </div>

          {/* Create Clip Button */}
          <button
            onClick={createClip}
            disabled={isProcessing || !url || !startTime || !endTime}
            className="w-full px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-purple-500/20"
          >
            {isProcessing ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Play className="w-5 h-5" />
            )}
            {isProcessing ? 'Creating Clip...' : 'Create Clip'}
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mt-4 p-4 bg-red-900/30 border border-red-500/30 rounded-xl backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Job Status */}
        {jobId && (
          <div className="mt-6 bg-gray-800/50 backdrop-blur-xl rounded-3xl p-6 border border-gray-700/60">
            <div className="flex items-center gap-3 mb-4">
              {jobStatus.status === 'ready' ? (
                <CheckCircle className="w-6 h-6 text-green-400" />
              ) : jobStatus.status === 'error' ? (
                <AlertCircle className="w-6 h-6 text-red-400" />
              ) : (
                <Loader2 className="w-6 h-6 text-purple-400 animate-spin" />
              )}
              <h3 className="text-white font-medium">
                {jobStatus.status === 'ready' ? 'Clip Ready!' : 
                 jobStatus.status === 'error' ? 'Error' : 'Processing...'}
              </h3>
            </div>

            {jobStatus.status === 'processing' && (
              <p className="text-gray-300 text-sm mb-4">Your clip is being generated. This might take a moment.</p>
            )}

            {jobStatus.status === 'error' && (
              <p className="text-red-300 text-sm mb-4">{jobStatus.error}</p>
            )}

            {jobStatus.status === 'ready' && jobStatus.url && (
              <div className="space-y-4">
                <video 
                  src={jobStatus.url} 
                  controls 
                  className="w-full rounded-2xl"
                  style={{ maxHeight: '300px' }}
                />
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => handleDownload(jobStatus.url!, `clippa-${jobId}.mp4`)}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-medium hover:from-green-600 hover:to-emerald-600 transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </button>
                  <button 
                    onClick={cleanupJob}
                    className="px-4 py-3 bg-white/10 border border-white/20 text-gray-300 rounded-xl font-medium hover:bg-white/20 transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;