import React, { useState } from 'react';
import { 
  Play, 
  Scissors, 
  Download, 
  Zap, 
  Monitor, 
  Smartphone, 
  Square,
  Clock,
  Star,
  ArrowRight,
  LogIn
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import AuthModal from './AuthModal';
import UserProfile from './UserProfile';

interface LandingPageProps {
  onGetStarted: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
  const { isAuthenticated } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const handleGetStarted = () => {
    if (isAuthenticated) {
      onGetStarted();
    } else {
      setIsAuthModalOpen(true);
    }
  };

  const handleAuthSuccess = () => {
    onGetStarted();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 left-1/2 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 p-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <Scissors className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">Clippa</span>
          </div>
          
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <UserProfile />
            ) : (
              <button 
                onClick={() => setIsAuthModalOpen(true)}
                className="flex items-center gap-2 px-6 py-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white rounded-xl font-medium hover:bg-white/20 transition-all duration-300"
              >
                <LogIn className="w-4 h-4" />
                Sign In
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 pt-20 pb-32">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h1 className="text-6xl md:text-7xl font-light text-white mb-6 leading-tight">
              Clip anything,
              <br />
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent font-medium">
                anywhere
              </span>
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-12 leading-relaxed">
              Transform any YouTube video into perfect clips for social media. 
              Choose your aspect ratio, timing, and quality—all in seconds.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={handleGetStarted}
                className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 flex items-center justify-center gap-3 shadow-lg shadow-purple-500/25 group"
              >
                <Play className="w-5 h-5 group-hover:scale-110 transition-transform" />
                {isAuthenticated ? 'Start Clipping' : 'Sign In & Start Clipping'}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="px-8 py-4 bg-white/10 backdrop-blur-sm border border-white/20 text-white rounded-xl font-medium hover:bg-white/20 transition-all duration-300">
                Watch Demo
              </button>
            </div>
          </div>

          {/* Feature Preview */}
          <div className="relative max-w-4xl mx-auto">
            <div className="bg-gray-800/50 backdrop-blur-xl rounded-3xl p-8 border border-gray-700/60 shadow-2xl shadow-purple-900/20">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gray-900/50 rounded-2xl p-6 text-center group hover:bg-gray-900/70 transition-all duration-300">
                  <Monitor className="w-12 h-12 text-purple-400 mx-auto mb-4 group-hover:scale-110 transition-transform" />
                  <h3 className="text-white font-semibold mb-2">Any Format</h3>
                  <p className="text-gray-400 text-sm">Original, vertical, or square—perfect for any platform</p>
                </div>
                <div className="bg-gray-900/50 rounded-2xl p-6 text-center group hover:bg-gray-900/70 transition-all duration-300">
                  <Clock className="w-12 h-12 text-pink-400 mx-auto mb-4 group-hover:scale-110 transition-transform" />
                  <h3 className="text-white font-semibold mb-2">Precise Timing</h3>
                  <p className="text-gray-400 text-sm">Set exact start and end times down to the second</p>
                </div>
                <div className="bg-gray-900/50 rounded-2xl p-6 text-center group hover:bg-gray-900/70 transition-all duration-300">
                  <Zap className="w-12 h-12 text-blue-400 mx-auto mb-4 group-hover:scale-110 transition-transform" />
                  <h3 className="text-white font-semibold mb-2">Lightning Fast</h3>
                  <p className="text-gray-400 text-sm">Process and download your clips in seconds</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Features Section */}
      <section className="relative z-10 py-24 bg-gray-900/30 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-light text-white mb-6">
              Everything you need to create
              <br />
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                viral clips
              </span>
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Professional-grade video clipping tools that make content creation effortless
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature Cards */}
            <div className="bg-gray-800/30 backdrop-blur-xl rounded-2xl p-8 border border-gray-700/40 hover:border-purple-500/50 transition-all duration-300 group">
              <div className="w-14 h-14 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Smartphone className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">Mobile-First</h3>
              <p className="text-gray-400 leading-relaxed">
                Optimized for vertical video formats. Perfect for TikTok, Instagram Stories, and YouTube Shorts.
              </p>
            </div>

            <div className="bg-gray-800/30 backdrop-blur-xl rounded-2xl p-8 border border-gray-700/40 hover:border-purple-500/50 transition-all duration-300 group">
              <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Download className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">High Quality</h3>
              <p className="text-gray-400 leading-relaxed">
                Choose from multiple quality options or let us select the best available format automatically.
              </p>
            </div>

            <div className="bg-gray-800/30 backdrop-blur-xl rounded-2xl p-8 border border-gray-700/40 hover:border-purple-500/50 transition-all duration-300 group">
              <div className="w-14 h-14 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Star className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">Subtitles</h3>
              <p className="text-gray-400 leading-relaxed">
                Automatically include subtitles in your clips to increase engagement and accessibility.
              </p>
            </div>

            <div className="bg-gray-800/30 backdrop-blur-xl rounded-2xl p-8 border border-gray-700/40 hover:border-purple-500/50 transition-all duration-300 group">
              <div className="w-14 h-14 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Square className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">Any Aspect Ratio</h3>
              <p className="text-gray-400 leading-relaxed">
                Original landscape, vertical portrait, or perfect square—we've got every platform covered.
              </p>
            </div>

            <div className="bg-gray-800/30 backdrop-blur-xl rounded-2xl p-8 border border-gray-700/40 hover:border-purple-500/50 transition-all duration-300 group">
              <div className="w-14 h-14 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Clock className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">Precise Control</h3>
              <p className="text-gray-400 leading-relaxed">
                Frame-perfect timing controls let you capture exactly the moment you want to share.
              </p>
            </div>

            <div className="bg-gray-800/30 backdrop-blur-xl rounded-2xl p-8 border border-gray-700/40 hover:border-purple-500/50 transition-all duration-300 group">
              <div className="w-14 h-14 bg-gradient-to-r from-pink-500 to-rose-500 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Zap className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">Lightning Fast</h3>
              <p className="text-gray-400 leading-relaxed">
                Our optimized processing pipeline delivers your clips in seconds, not minutes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-24">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-light text-white mb-6">
            Ready to create your first clip?
          </h2>
          <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto">
            Join thousands of creators who use Clippa to turn their favorite videos into shareable content.
          </p>
          <button 
            onClick={handleGetStarted}
            className="px-12 py-5 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-lg rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-lg shadow-purple-500/25 group"
          >
            <span className="flex items-center gap-3">
              {isAuthenticated ? 'Get Started Now' : 'Sign In & Get Started'}
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </span>
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-12 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <Scissors className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">Clippa</span>
            </div>
            <p className="text-gray-400 text-sm">
              © 2025 Clippa. Made with ❤️ for creators everywhere.
            </p>
          </div>
        </div>
      </footer>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
      />
    </div>
  );
};

export default LandingPage;