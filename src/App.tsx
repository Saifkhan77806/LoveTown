import { useState } from 'react';
import { useAppState } from './hooks/useAppState';
import Navigation from './components/Layout/Navigation';
import TopHeader from './components/Layout/TopHeader';
import Sidebar from './components/Layout/Sidebar';
import Dashboard from './components/Dashboard/Dashboard';
import ChatInterface from './components/Chat/ChatInterface';
import Profile from './components/Profile/Profile';
import Onboarding from './components/Onboarding/Onboarding';
import LoginForm from './components/Auth/LoginForm';
import RegisterForm from './components/Auth/RegisterForm';
import ForgotPasswordForm from './components/Auth/ForgotPasswordForm';
import { OnboardingData, Conversation } from './types';
import { Route, Routes } from 'react-router-dom';
import TestChat from './components/Chat/TestChatBox';

type AuthView = 'login' | 'register' | 'forgot-password';

function App() {
  const { appState, updateUserState, unpinMatch, startConversation } = useAppState();
  const [currentView, setCurrentView] = useState('dashboard');
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [authView, setAuthView] = useState<AuthView>('login');

  const handleLogin = (email: string, password: string) => {
    console.log('Login attempt:', { email, password });
    // Simulate successful login
    setIsAuthenticated(true);
  };

  const handleRegister = (email: string, password: string, name: string) => {
    console.log('Registration attempt:', { email, password, name });
    // Simulate successful registration and show onboarding
    setIsAuthenticated(true);
    setShowOnboarding(true);
  };

  const handleForgotPassword = () => {
    setAuthView('forgot-password');
  };

  const handleResetSent = (email: string) => {
    console.log('Password reset sent to:', email);
    // After showing success, redirect back to login
    setTimeout(() => {
      setAuthView('login');
    }, 3000);
  };

  const handleOnboardingComplete = (data: OnboardingData) => {
    console.log('Onboarding completed with data:', data);
    setShowOnboarding(false);
    updateUserState('available');
  };

  const handleStartChat = () => {
    // Create a mock conversation
    const conversation: Conversation = {
      id: '1',
      matchId: appState.currentMatch!.id,
      messages: [],
      messageCount: 34,
      createdAt: new Date(),
      lastActivity: new Date(),
      milestoneReached: false,
      videoCallUnlocked: false,
    };

    startConversation(conversation);
    setCurrentView('chat');
  };

  const handleBackToDashboard = () => {
    setCurrentView('dashboard');
  };


  const handleSignOut = () => {
    setIsAuthenticated(false);
    setCurrentView('dashboard');
  };

  // Show authentication forms if not authenticated

  if (showOnboarding) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }



  return (

    <div className="min-h-screen bg-gray-50 lg:flex">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block lg:w-80 lg:flex-shrink-0">
        <Sidebar
          isOpen={true}
          onClose={() => { }}
          currentView={currentView}
          userState={appState.userState}
          onSignOut={handleSignOut}
        />
      </div>

      {/* Mobile Sidebar */}
      {/* <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          currentView={currentView}
          onViewChange={setCurrentView}
          userState={appState.userState}
          onSignOut={handleSignOut}
        /> */}

      {/* Main Content */}
      <div className="flex-1 lg:flex lg:flex-col">
        {/* Top Header */}
        <TopHeader
          currentView={currentView}
          userState={appState.userState}
        />

        {/* Content Area */}
        <main className="flex-1 pt-16 lg:pt-0">
          {/* {renderCurrentView()} */}
          <Routes>

            {/* Register */}
            <Route path='/register' element={
              <RegisterForm
          />
            } />

            {/* Login */}
            <Route path='/login' element={
              <LoginForm />
            } />

            {/* Forgot-password */}
            <Route path='/forgot-password' element={
              <ForgotPasswordForm
            
          />
            } />

            {/* dashboard */}
            <Route path='/dashboard' element={<Dashboard
              appState={appState}
              onStartChat={handleStartChat}
              onUnpinMatch={unpinMatch}
            />} />

            {/* Chat */}
            <Route path='/chat/:user1/:user2' element={appState.currentMatch ? (
              <ChatInterface
                match={appState.currentMatch}
                onBack={handleBackToDashboard}
              />
            ) : (
              <div className="p-6 text-center">
                <p className="text-gray-600">No active conversation</p>
              </div>
            )} />

            {/* profile */}
            <Route path='/profile' element={appState.currentUser ? (
              <Profile user={appState.currentUser} />
            ) : null} />

            {/* Settings */}
            <Route path='/settings' element={<div className="p-6 pt-20 pb-24">
              <h1 className="text-2xl font-bold text-gray-900 mb-6">Settings</h1>
              <div className="space-y-4">
                <button
                  onClick={() => setShowOnboarding(true)}
                  className="w-full p-4 bg-white rounded-xl shadow-sm text-left hover:bg-gray-50 transition-all duration-200"
                >
                  <h3 className="font-medium text-gray-900">Retake Compatibility Assessment</h3>
                  <p className="text-sm text-gray-600 mt-1">Update your preferences and matching criteria</p>
                </button>
                <button className="w-full p-4 bg-white rounded-xl shadow-sm text-left hover:bg-gray-50 transition-all duration-200">
                  <h3 className="font-medium text-gray-900">Notification Settings</h3>
                  <p className="text-sm text-gray-600 mt-1">Manage how and when you receive notifications</p>
                </button>
                <button className="w-full p-4 bg-white rounded-xl shadow-sm text-left hover:bg-gray-50 transition-all duration-200">
                  <h3 className="font-medium text-gray-900">Privacy & Safety</h3>
                  <p className="text-sm text-gray-600 mt-1">Control your privacy and safety settings</p>
                </button>
                <button className="w-full p-4 bg-white rounded-xl shadow-sm text-left hover:bg-gray-50 transition-all duration-200">
                  <h3 className="font-medium text-gray-900">Help & Support</h3>
                  <p className="text-sm text-gray-600 mt-1">Get help and contact support</p>
                </button>
                <button
                  onClick={handleSignOut}
                  className="w-full p-4 bg-red-50 border border-red-200 rounded-xl text-left hover:bg-red-100 transition-all duration-200"
                >
                  <h3 className="font-medium text-red-900">Sign Out</h3>
                  <p className="text-sm text-red-600 mt-1">Sign out of your account</p>
                </button>
              </div>
            </div>} />

            <Route path='/' element={<Dashboard
              appState={appState}
              onStartChat={handleStartChat}
              onUnpinMatch={unpinMatch}
            />} />

            <Route path='/testchat/:user1/:user2' element={<TestChat />} />
          </Routes>
        </main>

        {/* Mobile Bottom Navigation */}
        <div className="lg:hidden">
          <Navigation
            userState={appState.userState}
          />
        </div>
      </div>
    </div>
  );
}

export default App;