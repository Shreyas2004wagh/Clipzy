import React from 'react';
import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';
import { X, Scissors } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { login } = useAuth();

  const handleGoogleSuccess = (credentialResponse: any) => {
    login(credentialResponse);
    onSuccess();
    onClose();
  };

  const handleGoogleError = () => {
    console.error('Google login failed');
  };

  if (!isOpen) return null;

  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || "your-google-client-id"}>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-gray-800/90 backdrop-blur-xl rounded-3xl p-8 border border-gray-700/60 shadow-2xl max-w-md w-full relative">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                <Scissors className="w-7 h-7 text-white" />
              </div>
              <span className="text-2xl font-bold text-white">Clippa</span>
            </div>
            <h2 className="text-2xl font-light text-white mb-2">Welcome back!</h2>
            <p className="text-gray-300 text-sm">Sign in to save your clips and access premium features</p>
          </div>

          {/* Google Login */}
          <div className="space-y-4">
            <div className="flex justify-center">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                theme="filled_black"
                size="large"
                text="signin_with"
                shape="rectangular"
                width="280"
              />
            </div>

            <div className="text-center">
              <p className="text-gray-400 text-xs">
                By signing in, you agree to our Terms of Service and Privacy Policy
              </p>
            </div>
          </div>

          {/* Features Preview */}
          <div className="mt-8 pt-6 border-t border-gray-700/50">
            <h3 className="text-white font-medium mb-4 text-center">What you'll get:</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm text-gray-300">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span>Save and organize your clips</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-300">
                <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
                <span>Higher quality downloads</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-300">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>Priority processing</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </GoogleOAuthProvider>
  );
};

export default AuthModal;