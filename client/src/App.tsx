import React, { useState, useEffect } from 'react';
import { Play, Download, Clock, Scissors, Github, ArrowLeft } from 'lucide-react';
import GoogleSignIn from './components/GoogleSignIn';
import Dashboard from './components/Dashboard';

function App() {
  const [showTerms, setShowTerms] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already signed in
    const token = localStorage.getItem('authToken');
    if (token) {
      // In a real app, verify the token with the backend
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
    }
    setIsLoading(false);

    // Load Google Sign-In script
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  const handleSignIn = (userData: any) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const handleSignOut = () => {
    setUser(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
      </div>
    );
  }

  if (user) {
    return <Dashboard user={user} onSignOut={handleSignOut} />;
  }

  if (showTerms) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.1),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_35%,rgba(255,255,255,0.02)_50%,transparent_65%)]"></div>
        
        {/* Header */}
        <header className="relative z-10 flex justify-between items-center p-6 max-w-7xl mx-auto">
          <button 
            onClick={() => setShowTerms(false)}
            className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>
          
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg flex items-center justify-center">
              <Scissors className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-semibold">ClipForge</span>
          </div>
          
          <div className="w-16"></div>
        </header>

        {/* Terms Content */}
        <main className="relative z-10 max-w-4xl mx-auto px-6 py-12">
          <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-3xl p-12 border border-white/10">
            <h1 className="text-4xl font-bold mb-12 bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
              Terms & Conditions
            </h1>
            
            <div className="space-y-8 text-gray-300 leading-relaxed">
              <div>
                <h2 className="text-xl font-semibold text-white mb-3">1. Subscription Terms</h2>
                <p>Your subscription will continue until terminated.</p>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-white mb-3">2. Payment Terms</h2>
                <p>Payments are processed securely through our payment provider. Subscriptions auto-renew unless canceled.</p>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-white mb-3">3. Usage Rights</h2>
                <p>This service is for personal use only.</p>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-white mb-3">4. Refund Policy</h2>
                <p>Refunds are handled on a case-by-case basis. Contact support on <a href="mailto:iamamrit27@gmail.com" className="text-blue-400 hover:text-blue-300 transition-colors">iamamrit27@gmail.com</a> within 14 days of purchase for refund requests.</p>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-white mb-3">5. Service Availability</h2>
                <p>We strive for 99.9% uptime but do not guarantee uninterrupted service. We reserve the right to modify or discontinue features.</p>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-white mb-3">6. Limitation of Liability</h2>
                <p>Our service is provided "as is" without warranties. We are not liable for any damages arising from service use.</p>
              </div>

              <div className="pt-8 border-t border-white/10">
                <p className="text-gray-400 text-sm">Last updated: 6/28/2025</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.1),transparent_50%)]"></div>
      <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_35%,rgba(255,255,255,0.02)_50%,transparent_65%)]"></div>
      
      {/* Header */}
      <header className="relative z-10 flex justify-between items-center p-6 max-w-7xl mx-auto">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg flex items-center justify-center">
            <Scissors className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-semibold">ClipForge</span>
        </div>
        
        <div className="flex items-center space-x-6">
          <a href="#" className="text-gray-300 hover:text-white transition-colors">Pricing</a>
          <a href="#" className="text-gray-300 hover:text-white transition-colors">Docs</a>
          <a href="#" className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors">
            <Github className="w-4 h-4" />
            <span>GitHub</span>
          </a>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-200px)] px-6">
        {/* Hero Text */}
        <div className="text-center mb-16 max-w-4xl">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
            Snip Clips. Make Bangers.
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
            Clippa is your platform for YT clips. Create bangers from your favorite moments from videos.
          </p>
          <GoogleSignIn onSignIn={handleSignIn} />
        </div>

        {/* Product Demo */}
        <div className="relative max-w-5xl w-full">
          {/* Gradient Border */}
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-3xl blur opacity-75"></div>
          
          {/* Main Container */}
          <div className="relative bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-3xl p-8 border border-white/10">
            {/* Browser Window */}
            <div className="bg-black/50 rounded-2xl overflow-hidden border border-white/10">
              {/* Browser Header */}
              <div className="flex items-center justify-between px-6 py-4 bg-black/30 border-b border-white/10">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
                <div className="text-sm text-gray-400">Clippa • Snip & Roll</div>
                <div className="w-6"></div>
              </div>

              {/* App Interface */}
              <div className="p-8 space-y-6">
                {/* Video Preview */}
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-16 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center">
                    <Play className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="text-white font-medium">Rick Astley - Never Gonna Give You Up (Official Video) (4K Remaster)</div>
                    <div className="text-gray-400 text-sm">https://www.youtube.com/watch?v=dQw4w9WgXcQ</div>
                  </div>
                </div>

                {/* URL Input */}
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <input 
                    type="text" 
                    placeholder="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                    className="w-full bg-transparent text-white placeholder-gray-400 outline-none"
                    value="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                    readOnly
                  />
                  <button className="absolute right-6 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center hover:bg-white/20 transition-colors">
                    <Download className="w-4 h-4 text-white" />
                  </button>
                </div>

                {/* Time Controls */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <label className="text-gray-400 text-sm block mb-2">Start At</label>
                    <div className="text-white font-mono">00:00:15</div>
                  </div>
                  <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <label className="text-gray-400 text-sm block mb-2">End At</label>
                    <div className="text-white font-mono">00:00:30</div>
                  </div>
                  <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <label className="text-gray-400 text-sm block mb-2">Quality</label>
                    <div className="text-white">Original</div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-orange-500 rounded-full animate-pulse"></div>
                  <div className="text-orange-400 text-sm">Clip in Progress</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 text-center py-8 text-gray-400 text-sm">
        <div className="flex items-center justify-center space-x-6">
          <span>© 2025 Clippa. All rights reserved.</span>
          <button 
            onClick={() => setShowTerms(true)}
            className="hover:text-white transition-colors"
          >
            Terms & Conditions
          </button>
        </div>
      </footer>
    </div>
  );
}

export default App;