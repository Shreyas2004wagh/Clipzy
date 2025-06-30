import React, { useState } from 'react';
import { Play, Download, Clock, Scissors, Settings, LogOut, Upload, History, Zap, CheckCircle, AlertCircle } from 'lucide-react';

interface DashboardProps {
  user: any;
  onSignOut: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, onSignOut }) => {
  const [activeTab, setActiveTab] = useState('extract');
  const [videoUrl, setVideoUrl] = useState('');
  const [startTime, setStartTime] = useState('00:00:00');
  const [endTime, setEndTime] = useState('00:00:15');
  const [quality, setQuality] = useState('720p');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState('');
  const [downloadUrl, setDownloadUrl] = useState('');
  const [error, setError] = useState('');

  const handleExtractClip = async () => {
    if (!videoUrl) {
      setError('Please enter a YouTube URL');
      return;
    }
    
    setIsProcessing(true);
    setError('');
    setProcessingStatus('Starting video extraction...');
    setDownloadUrl('');

    try {
      const token = localStorage.getItem('authToken');
      
      const response = await fetch('http://localhost:3001/api/extract-clip', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          videoUrl,
          startTime,
          endTime,
          quality
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        setProcessingStatus('Video processing started. Please wait...');
        
        // Poll for completion
        const filename = result.filename;
        const pollInterval = setInterval(async () => {
          try {
            const statusResponse = await fetch(`http://localhost:3001/api/status/${filename}`, {
              headers: {
                'Authorization': `Bearer ${token}`
              }
            });
            
            const statusResult = await statusResponse.json();
            
            if (statusResult.ready) {
              clearInterval(pollInterval);
              setProcessingStatus('Video ready for download!');
              setDownloadUrl(`http://localhost:3001${result.downloadUrl}`);
              setIsProcessing(false);
            }
          } catch (pollError) {
            console.error('Status check error:', pollError);
          }
        }, 2000);

        // Stop polling after 5 minutes
        setTimeout(() => {
          clearInterval(pollInterval);
          if (isProcessing) {
            setProcessingStatus('Processing is taking longer than expected. Please try again.');
            setIsProcessing(false);
          }
        }, 300000);

      } else {
        setError(result.error || 'Failed to process video');
        setIsProcessing(false);
      }
    } catch (error) {
      console.error('Extract clip error:', error);
      setError('Network error. Please check if the server is running.');
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (downloadUrl) {
      const token = localStorage.getItem('authToken');
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = '';
      // Add authorization header for download
      fetch(downloadUrl, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }).then(response => response.blob())
        .then(blob => {
          const url = window.URL.createObjectURL(blob);
          link.href = url;
          link.click();
          window.URL.revokeObjectURL(url);
        });
    }
  };

  const recentClips = [
    {
      id: 1,
      title: "Rick Astley - Never Gonna Give You Up",
      duration: "0:15",
      quality: "1080p",
      date: "2 hours ago",
      thumbnail: "https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg"
    },
    {
      id: 2,
      title: "Best Coding Practices 2025",
      duration: "0:30",
      quality: "720p",
      date: "1 day ago",
      thumbnail: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=320&h=180&fit=crop"
    },
    {
      id: 3,
      title: "React Tutorial - Advanced Hooks",
      duration: "1:20",
      quality: "1080p",
      date: "3 days ago",
      thumbnail: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=320&h=180&fit=crop"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.1),transparent_50%)]"></div>
      <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_35%,rgba(255,255,255,0.02)_50%,transparent_65%)]"></div>
      
      {/* Header */}
      <header className="relative z-10 border-b border-white/10 bg-black/20 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-xl flex items-center justify-center">
                <Scissors className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">ClipForge</h1>
                <p className="text-sm text-gray-400">Dashboard</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <img 
                  src={user.picture} 
                  alt={user.name}
                  className="w-8 h-8 rounded-full"
                />
                <span className="text-sm font-medium">{user.name}</span>
              </div>
              <button
                onClick={onSignOut}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <nav className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
              <div className="space-y-2">
                <button
                  onClick={() => setActiveTab('extract')}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors ${
                    activeTab === 'extract' 
                      ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' 
                      : 'hover:bg-white/10 text-gray-300'
                  }`}
                >
                  <Scissors className="w-5 h-5" />
                  <span>Extract Clip</span>
                </button>
                
                <button
                  onClick={() => setActiveTab('history')}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors ${
                    activeTab === 'history' 
                      ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' 
                      : 'hover:bg-white/10 text-gray-300'
                  }`}
                >
                  <History className="w-5 h-5" />
                  <span>Recent Clips</span>
                </button>
                
                <button
                  onClick={() => setActiveTab('settings')}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors ${
                    activeTab === 'settings' 
                      ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' 
                      : 'hover:bg-white/10 text-gray-300'
                  }`}
                >
                  <Settings className="w-5 h-5" />
                  <span>Settings</span>
                </button>
              </div>
            </nav>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {activeTab === 'extract' && (
              <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10">
                <h2 className="text-2xl font-bold mb-6 flex items-center space-x-3">
                  <Scissors className="w-6 h-6 text-blue-400" />
                  <span>Extract YouTube Clip</span>
                </h2>
                
                <div className="space-y-6">
                  {/* URL Input */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      YouTube URL
                    </label>
                    <div className="relative">
                      <input
                        type="url"
                        value={videoUrl}
                        onChange={(e) => setVideoUrl(e.target.value)}
                        placeholder="https://www.youtube.com/watch?v=..."
                        className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20"
                        disabled={isProcessing}
                      />
                      <Upload className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    </div>
                  </div>

                  {/* Time Controls */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Start Time
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={startTime}
                          onChange={(e) => setStartTime(e.target.value)}
                          placeholder="00:00:00"
                          className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 font-mono"
                          disabled={isProcessing}
                        />
                        <Clock className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        End Time
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={endTime}
                          onChange={(e) => setEndTime(e.target.value)}
                          placeholder="00:00:15"
                          className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 font-mono"
                          disabled={isProcessing}
                        />
                        <Clock className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Quality
                      </label>
                      <select
                        value={quality}
                        onChange={(e) => setQuality(e.target.value)}
                        className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20"
                        disabled={isProcessing}
                      >
                        <option value="480p" className="bg-slate-800">480p</option>
                        <option value="720p" className="bg-slate-800">720p</option>
                        <option value="1080p" className="bg-slate-800">1080p</option>
                        <option value="original" className="bg-slate-800">Original</option>
                      </select>
                    </div>
                  </div>

                  {/* Error Display */}
                  {error && (
                    <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-center space-x-3">
                      <AlertCircle className="w-5 h-5 text-red-400" />
                      <span className="text-red-400">{error}</span>
                    </div>
                  )}

                  {/* Processing Status */}
                  {processingStatus && (
                    <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 flex items-center space-x-3">
                      <div className="w-5 h-5 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin"></div>
                      <span className="text-blue-400">{processingStatus}</span>
                    </div>
                  )}

                  {/* Download Ready */}
                  {downloadUrl && (
                    <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <CheckCircle className="w-5 h-5 text-green-400" />
                        <span className="text-green-400">Your clip is ready for download!</span>
                      </div>
                      <button
                        onClick={handleDownload}
                        className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
                      >
                        <Download className="w-4 h-4" />
                        <span>Download</span>
                      </button>
                    </div>
                  )}

                  {/* Extract Button */}
                  <button
                    onClick={handleExtractClip}
                    disabled={!videoUrl || isProcessing}
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-semibold py-4 px-6 rounded-xl transition-all transform hover:scale-105 disabled:transform-none flex items-center justify-center space-x-3"
                  >
                    {isProcessing ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        <Zap className="w-5 h-5" />
                        <span>Extract Clip</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'history' && (
              <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10">
                <h2 className="text-2xl font-bold mb-6 flex items-center space-x-3">
                  <History className="w-6 h-6 text-blue-400" />
                  <span>Recent Clips</span>
                </h2>
                
                <div className="space-y-4">
                  {recentClips.map((clip) => (
                    <div key={clip.id} className="bg-white/5 rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-colors">
                      <div className="flex items-center space-x-4">
                        <img 
                          src={clip.thumbnail} 
                          alt={clip.title}
                          className="w-20 h-12 rounded-lg object-cover"
                        />
                        <div className="flex-1">
                          <h3 className="font-medium text-white mb-1">{clip.title}</h3>
                          <div className="flex items-center space-x-4 text-sm text-gray-400">
                            <span>{clip.duration}</span>
                            <span>{clip.quality}</span>
                            <span>{clip.date}</span>
                          </div>
                        </div>
                        <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                          <Download className="w-5 h-5 text-gray-400" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10">
                <h2 className="text-2xl font-bold mb-6 flex items-center space-x-3">
                  <Settings className="w-6 h-6 text-blue-400" />
                  <span>Settings</span>
                </h2>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4">Account</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
                        <div>
                          <p className="font-medium text-white">Email</p>
                          <p className="text-sm text-gray-400">{user.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
                        <div>
                          <p className="font-medium text-white">Name</p>
                          <p className="text-sm text-gray-400">{user.name}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4">Preferences</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
                        <div>
                          <p className="font-medium text-white">Default Quality</p>
                          <p className="text-sm text-gray-400">Choose your preferred video quality</p>
                        </div>
                        <select className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm">
                          <option value="720p" className="bg-slate-800">720p</option>
                          <option value="1080p" className="bg-slate-800">1080p</option>
                          <option value="original" className="bg-slate-800">Original</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;