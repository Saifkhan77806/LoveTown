import React from 'react';
import { Heart, User, MessageCircle, Settings } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

interface NavigationProps {
  userState: string;
}

const Navigation: React.FC<NavigationProps> = ({ userState }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const locationPath = location.pathname;

  const navItems = [
    { id: '/', icon: Heart, label: 'Home', enabled: true },
    { id: '/chat', icon: MessageCircle, label: 'Chat', enabled: userState === 'chatting' || userState === 'matched' },
    { id: '/profile', icon: User, label: 'Profile', enabled: true },
    { id: '/settings', icon: Settings, label: 'Settings', enabled: true },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 z-50">
      <div className="max-w-md mx-auto">
        <div className="flex justify-around">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = locationPath === item.id;
            const isEnabled = item.enabled;

            return (
              <button
                key={item.id}
                onClick={() => navigate(item.id)}
                disabled={!isEnabled}
                className={`flex flex-col items-center py-2 px-3 rounded-lg transition-all duration-200 ${isActive
                    ? 'text-primary-600 bg-primary-50'
                    : isEnabled
                      ? 'text-gray-600 hover:text-primary-500 hover:bg-gray-50'
                      : 'text-gray-300 cursor-not-allowed'
                  }`}
              >
                <Icon size={20} className={isActive ? 'animate-bounce-soft' : ''} />
                <span className="text-xs mt-1 font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;