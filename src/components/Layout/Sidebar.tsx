import React from 'react';
import { Heart, Home, MessageCircle, User, Settings, LogOut } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { SignOutButton, useUser } from '@clerk/clerk-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  currentView: string;
  userState: string | null;
}

const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  userState,
}) => {

  const {user} = useUser();
  const email = user?.emailAddresses?.[0]?.emailAddress
  const location = useLocation()


  // console.log("user is loaded at sidebar",users)

  const navigate = useNavigate();
  const navItems = [
    { id: 'dashboard', icon: Home, label: 'Home', link: "/", enabled: true },
    { id: 'chat', icon: MessageCircle, label: 'Chat', link: "/chat", enabled: userState === 'chatting' || userState === 'matched' },
    { id: 'profile', icon: User, label: 'Profile', link: "/profile", enabled: true },
    { id: 'settings', icon: Settings, label: 'Settings', link: "/settings", enabled: true },
  ];

  const handleNavClick = (viewId: string) => {
    navigate(`/${viewId === 'dashboard' ? '' : viewId}`);
    onClose();
  };


  return (
    <>
    
      {/* Sidebar */}
      <div className={`fixed top-0 left-0 h-full w-80 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 lg:shadow-none lg:border-r lg:border-gray-200 ${isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center">
                <Heart className="text-white" size={20} />
              </div>
              <div>
                <h2 className="font-bold text-gray-900">Lone Town</h2>
                <p className="text-sm text-gray-600">Mindful Dating</p>
              </div>
            </div>
          </div>
        </div>

        {/* User Status */}
        <div className="p-4 bg-gradient-to-r from-primary-50 to-secondary-50 border-b border-gray-200">
          <div className="flex items-center gap-3">
            {/* profile image */}
            <img
              src={user?.imageUrl}
              alt="Profile"
              className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
            />
            <div>
              <h3 className="font-medium text-gray-900">{user?.username}</h3>
              <h2 className='font-medium text-gray-900'>{email}</h2>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${userState === 'matched' ? 'bg-primary-500' :
                  userState === 'chatting' ? 'bg-secondary-500' :
                    userState === 'frozen' ? 'bg-accent-500' :
                      'bg-warm-500'
                  } animate-pulse`}></div>
                <span className="text-sm text-gray-600 capitalize">{userState}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <div className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.link;
              const isEnabled = item.enabled;

              return (
                <button
                  key={item.id}
                  onClick={() => isEnabled && handleNavClick(item.id)}
                  disabled={!isEnabled}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200 ${isActive
                    ? 'bg-primary-600 text-white shadow-lg'
                    : isEnabled
                      ? 'text-gray-700 hover:bg-gray-100 hover:text-primary-600'
                      : 'text-gray-300 cursor-not-allowed'
                    }`}
                >
                  <Icon size={20} />
                  <span className="font-medium">{item.label}</span>
                  {!isEnabled && (
                    <span className="ml-auto text-xs bg-gray-200 text-gray-500 px-2 py-1 rounded-full">
                      Locked
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200">
          <SignOutButton redirectUrl='/login'>
          <button
            className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200"
          >
            <LogOut size={20} />
            <span className="font-medium">Sign Out</span>
          </button>
      </SignOutButton>

        </div>
      </div>
    </>
  );
};

export default Sidebar;