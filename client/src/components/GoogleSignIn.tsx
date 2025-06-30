import React from 'react';

interface GoogleSignInProps {
  onSignIn: (user: any) => void;
}

declare global {
  interface Window {
    google: any;
  }
}

const GoogleSignIn: React.FC<GoogleSignInProps> = ({ onSignIn }) => {
  const handleGoogleSignIn = () => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    
    // Check if we have a valid Google Client ID and Google SDK is loaded
    if (window.google && clientId && clientId !== "your-google-client-id") {
      try {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: handleCredentialResponse,
          auto_select: false,
          cancel_on_tap_outside: true,
        });

        // Use renderButton instead of prompt to avoid CORS issues
        window.google.accounts.id.renderButton(
          document.getElementById("google-signin-button"),
          {
            theme: "outline",
            size: "large",
            width: 250,
            text: "continue_with"
          }
        );
        
        // If renderButton fails, fall back to prompt
        setTimeout(() => {
          try {
            window.google.accounts.id.prompt((notification: any) => {
              if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
                // Fallback to demo mode if Google Sign-In fails
                console.log('Google Sign-In not available, using demo mode');
                handleDemoSignIn();
              }
            });
          } catch (error) {
            console.log('Google Sign-In prompt failed, using demo mode');
            handleDemoSignIn();
          }
        }, 100);
        
      } catch (error) {
        console.error('Google Sign-In initialization failed:', error);
        handleDemoSignIn();
      }
    } else {
      // Fallback for demo - simulate Google sign-in
      console.log('Using demo mode - Google Client ID not configured or Google SDK not loaded');
      handleDemoSignIn();
    }
  };

  const handleDemoSignIn = () => {
    const mockUser = {
      sub: "demo-user-123",
      email: "demo@example.com",
      name: "Demo User",
      picture: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"
    };
    onSignIn(mockUser);
  };

  const handleCredentialResponse = async (response: any) => {
    try {
      // Decode the JWT token from Google
      const payload = JSON.parse(atob(response.credential.split('.')[1]));
      
      // Send to backend for verification and user creation
      const authResponse = await fetch('http://localhost:3001/api/auth/google', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: response.credential,
          user: payload
        }),
      });

      const result = await authResponse.json();
      
      if (result.success) {
        localStorage.setItem('authToken', result.token);
        onSignIn(payload);
      }
    } catch (error) {
      console.error('Sign-in error:', error);
      // Fallback for demo
      handleDemoSignIn();
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      {/* Hidden div for Google Sign-In button rendering */}
      <div id="google-signin-button" className="hidden"></div>
      
      <button
        onClick={handleGoogleSignIn}
        className="flex items-center justify-center space-x-3 bg-white text-gray-900 px-6 py-3 rounded-full font-medium hover:bg-gray-100 transition-all transform hover:scale-105 shadow-lg"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        <span>Continue with Google</span>
      </button>
      
      <p className="text-xs text-gray-400 text-center max-w-sm">
        Note: For demo purposes, this will use a mock user if Google Sign-In is not properly configured.
      </p>
    </div>
  );
};

export default GoogleSignIn;