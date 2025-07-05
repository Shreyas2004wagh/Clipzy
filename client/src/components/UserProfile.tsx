import React, { useState } from 'react';
import { LogOut, User, Settings, Crown } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const UserProfile: React.FC = () => {
  const { user, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  if (!user) return null;

  const handleSignOut = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="flex items-center gap-2 p-2 rounded-xl bg-gray-800/50 border border-gray-700/60 hover:bg-gray-700/50 transition-all"
      >
        {user.picture ? (
          <img
            src={user.picture}
            alt={user.name}
            className="w-8 h-8 rounded-full object-cover"
          />
        ) : (
          <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-white" />
          </div>
        )}
        <span className="text-white text-sm font-medium hidden sm:block max-w-20 truncate">
          {user.given_name || user.name}
        </span>
      </button>

      {isDropdownOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsDropdownOpen(false)}
          />
          <div className="absolute right-0 top-full mt-2 w-72 bg-gray-800/95 backdrop-blur-xl rounded-2xl border border-gray-700/60 shadow-2xl z-20 overflow-hidden">
            {/* User Info Header */}
            <div className="p-4 border-b border-gray-700/50 bg-gray-900/30">
              <div className="flex items-center gap-3">
                {user.picture ? (
                  <img
                    src={user.picture}
                    alt={user.name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-gray-600"
                  />
                ) : (
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center border-2 border-gray-600">
                    <User className="w-6 h-6 text-white" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium truncate">{user.name}</p>
                  <p className="text-gray-400 text-sm truncate">{user.email}</p>
                </div>
              </div>
            </div>

            {/* Menu Items */}
            <div className="p-2">
              <button className="w-full flex items-center gap-3 px-3 py-3 text-gray-300 hover:text-white hover:bg-gray-700/50 rounded-xl transition-all group">
                <div className="w-5 h-5 flex items-center justify-center">
                  <Crown className="w-4 h-4 group-hover:text-yellow-400 transition-colors" />
                </div>
                <span className="text-sm font-medium">Upgrade to Pro</span>
              </button>
              
              <button className="w-full flex items-center gap-3 px-3 py-3 text-gray-300 hover:text-white hover:bg-gray-700/50 rounded-xl transition-all group">
                <div className="w-5 h-5 flex items-center justify-center">
                  <Settings className="w-4 h-4 group-hover:text-blue-400 transition-colors" />
                </div>
                <span className="text-sm font-medium">Settings</span>
              </button>
              
              <div className="my-2 border-t border-gray-700/50"></div>
              
              <button
                onClick={() => {
                  handleSignOut();
                  setIsDropdownOpen(false);
                }}
                className="w-full flex items-center gap-3 px-3 py-3 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-xl transition-all group"
              >
                <div className="w-5 h-5 flex items-center justify-center">
                  <LogOut className="w-4 h-4" />
                </div>
                <span className="text-sm font-medium">Sign out</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default UserProfile;