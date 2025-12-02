import React from 'react';
import { Bell } from 'lucide-react';

interface TopHeaderProps {
  currentView: string;
  userState: string;
  showNotifications?: boolean;
}

const TopHeader: React.FC<TopHeaderProps> = ({
  currentView,
  showNotifications = true
}) => {

  let status = "matched"

  const getPageTitle = () => {
    switch (currentView) {
      case 'dashboard':
        return status === 'matched' ? 'Your Match' :
          status === 'chatting' ? 'Chatting' :
            status === 'frozen' ? 'Reflection Time' : 'Lone Town';
      case 'chat':
        return 'Conversation';
      case 'profile':
        return 'Your Profile';
      case 'settings':
        return 'Settings';
      default:
        return 'Lone Town';
    }
  };

  const getStatusIndicator = () => {
    switch (status) {
      case 'matched':
        return (
          <div className="flex items-center gap-2 bg-primary-100 px-3 py-1 rounded-full">
            <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse"></div>
            <span className="text-primary-700 text-sm font-medium">Matched</span>
          </div>
        );
      case 'chatting':
        return (
          <div className="flex items-center gap-2 bg-secondary-100 px-3 py-1 rounded-full">
            <div className="w-2 h-2 bg-secondary-500 rounded-full animate-pulse"></div>
            <span className="text-secondary-700 text-sm font-medium">Chatting</span>
          </div>
        );
      case 'frozen':
        return (
          <div className="flex items-center gap-2 bg-accent-100 px-3 py-1 rounded-full">
            <div className="w-2 h-2 bg-accent-500 rounded-full"></div>
            <span className="text-accent-700 text-sm font-medium">Reflecting</span>
          </div>
        );
      case 'available':
        return (
          <div className="flex items-center gap-2 bg-warm-100 px-3 py-1 rounded-full">
            <div className="w-2 h-2 bg-warm-500 rounded-full animate-pulse"></div>
            <span className="text-warm-700 text-sm font-medium">Available</span>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-b border-gray-200 z-40">
      <div className="max-w-md mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Left side - Logo/Menu */}
          <div className="flex items-center gap-3">

            <div>
              <h1 className="font-semibold text-gray-900">{getPageTitle()}</h1>
              {currentView === 'dashboard' && (
                <p className="text-xs text-gray-500">Mindful dating, one connection at a time</p>
              )}
            </div>
          </div>

          {/* Right side - Status & Notifications */}
          <div className="flex items-center gap-3">
            {getStatusIndicator()}
            {showNotifications && (
              <button className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all duration-200">
                <Bell size={18} />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopHeader;