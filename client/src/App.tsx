import React, { useState, useEffect, useRef } from 'react';
import './App.css'; // We'll add some basic styles below

// --- Configuration ---
// Make sure this points to your running backend server
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

function App() {
  // --- State Management ---
  const [url, setUrl] = useState('https://www.youtube.com/watch?v=LXb3EKWsInQ');
  const [startTime, setStartTime] = useState('00:00:15');
  const [endTime, setEndTime] = useState('00:00:25');
  const [subtitles, setSubtitles] = useState(false);
  
  const [formats, setFormats] = useState<Format[]>([]);
  const [selectedFormat, setSelectedFormat] = useState<string>('');
  
  const [jobId, setJobId] = useState<string | null>(null);
  const [jobStatus, setJobStatus] = useState<JobStatus>({ status: 'idle' });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Ref to hold the polling interval ID
  const pollIntervalRef = useRef<number | null>(null);

  // --- API Functions ---
  const fetchFormats = async () => {
    if (!url) {
      setError('Please enter a video URL first.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setFormats([]);
    setSelectedFormat('');

    try {
      const response = await fetch(`${API_BASE_URL}/formats?url=${encodeURIComponent(url)}`);
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || `HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setFormats(data.formats);
    } catch (err: any) {
      setError(`Failed to fetch formats: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const createClip = async () => {
    if (!url || !startTime || !endTime) {
      setError('URL, Start Time, and End Time are required.');
      return;
    }
    
    // Reset previous job state
    setJobId(null);
    setJobStatus({ status: 'idle' });
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/clip`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url,
          startTime: `${startTime}.000`, // Ensure milliseconds format
          endTime: `${endTime}.000`,   // Ensure milliseconds format
          subtitles,
          formatId: selectedFormat || undefined, // Send undefined if empty
          userId: `frontend-user-${Date.now()}`, // Simple unique user ID for testing
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
      setIsLoading(false);
    }
  };

  const checkJobStatus = async (id: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/clip/${id}`);
      if (!response.ok) {
        // Stop polling if the job is not found (e.g., after cleanup)
        if (response.status === 404) {
          stopPolling();
          setError(`Job ${id} not found. It may have been cleaned up.`);
          setIsLoading(false);
          setJobStatus({ status: 'idle' });
        }
        return;
      }
      const data: JobStatus = await response.json();
      setJobStatus(data);

      // Stop polling if the job is finished (ready or error)
      if (data.status === 'ready' || data.status === 'error') {
        stopPolling();
        setIsLoading(false);
      }
    } catch (err: any) {
      setError(`Polling error: ${err.message}`);
      stopPolling();
      setIsLoading(false);
    }
  };

  const cleanupJob = async () => {
    if (!jobId) return;
    try {
        await fetch(`${API_BASE_URL}/clip/${jobId}/cleanup`, { method: 'DELETE' });
        // Reset state after successful cleanup
        setJobId(null);
        setJobStatus({ status: 'idle'});
        setFormats([]);
    } catch (err: any) {
        setError(`Cleanup failed: ${err.message}`);
    }
  };
  
  // --- Effects and Polling Logic ---
  const stopPolling = () => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
  };

  useEffect(() => {
    if (jobId && jobStatus.status === 'processing') {
      // Start polling
      pollIntervalRef.current = window.setInterval(() => {
        checkJobStatus(jobId);
      }, 3000); // Poll every 3 seconds
    }
    
    // Cleanup function to stop polling when the component unmounts or dependencies change
    return () => {
      stopPolling();
    };
  }, [jobId, jobStatus.status]);


  return (
    <div className="App">
      <header>
        <h1>Clippa API Tester</h1>
      </header>
      <main>
        <div className="card">
          <h2>1. Configure Clip</h2>
          <div className="form-group">
            <label htmlFor="url">Video URL</label>
            <input
              id="url"
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="e.g., https://www.youtube.com/watch?v=..."
            />
          </div>

          <div className="form-group-inline">
            <div className="form-group">
              <label htmlFor="startTime">Start Time (HH:MM:SS)</label>
              <input
                id="startTime"
                type="text"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                placeholder="00:00:15"
              />
            </div>
            <div className="form-group">
              <label htmlFor="endTime">End Time (HH:MM:SS)</label>
              <input
                id="endTime"
                type="text"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                placeholder="00:00:25"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={subtitles}
                onChange={(e) => setSubtitles(e.target.checked)}
              />
              Burn Subtitles (if available)
            </label>
          </div>
        </div>

        <div className="card">
          <h2>2. Fetch Formats (Optional)</h2>
          <button onClick={fetchFormats} disabled={isLoading || !url}>
            Fetch Available Formats
          </button>
          {formats.length > 0 && (
            <div className="form-group">
              <label htmlFor="format">Select Format</label>
              <select 
                id="format"
                value={selectedFormat} 
                onChange={e => setSelectedFormat(e.target.value)}
              >
                <option value="">Default (Best Available)</option>
                {formats.map((f) => (
                  <option key={f.format_id} value={f.format_id}>
                    {f.label} ({f.format_id})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div className="card">
          <h2>3. Create Clip</h2>
          <button onClick={createClip} disabled={isLoading}>
            {isLoading ? 'Processing...' : 'Start Clipping Job'}
          </button>
        </div>

        {/* --- Status & Results Section --- */}
        {(jobId || error) && (
          <div className="card results">
            <h2>4. Job Status & Results</h2>
            {error && <p className="error-message">Error: {error}</p>}
            {jobId && <p>Job ID: <strong>{jobId}</strong></p>}
            
            <p>Status: <strong className={`status-${jobStatus.status}`}>{jobStatus.status}</strong></p>

            {jobStatus.status === 'processing' && (
              <div className="spinner"></div>
            )}

            {jobStatus.status === 'error' && (
              <p className="error-message">Job failed: {jobStatus.error}</p>
            )}

// This is the OLD code
{jobStatus.status === 'ready' && jobStatus.url && (
  <div className="results-success">
    <h3>Clip is Ready!</h3>
    <video src={jobStatus.url} controls width="100%"></video>
    <a href={jobStatus.url} target="_blank" rel="noopener noreferrer">
      Download Clip
    </a>
    <button onClick={cleanupJob} className="cleanup-button">
      Clean Up Job on Server
    </button>
  </div>
)}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;