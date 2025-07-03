import React, { useState } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider } from './contexts/AuthContext';
import LandingPage from './components/LandingPage';
import Dashboard from './components/Dashboard';

type AppView = 'landing' | 'dashboard';

function App() {
  const [currentView, setCurrentView] = useState<AppView>('landing');

  const handleGetStarted = () => {
    setCurrentView('dashboard');
  };

  const handleBackToLanding = () => {
    setCurrentView('landing');
  };

  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || "your-google-client-id"}>
      <AuthProvider>
        {currentView === 'landing' ? (
          <LandingPage onGetStarted={handleGetStarted} />
        ) : (
          <Dashboard onBackToLanding={handleBackToLanding} />
        )}
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}

export default App;