import { useEffect, useState } from "react";
import { useAppState } from "./hooks/useAppState";
import Navigation from "./components/Layout/Navigation";
import TopHeader from "./components/Layout/TopHeader";
import Sidebar from "./components/Layout/Sidebar";
import Dashboard from "./components/Dashboard/Dashboard";
import ChatInterface from "./components/Chat/ChatInterface";
import Profile from "./components/Profile/Profile";
import Onboarding from "./components/Onboarding/Onboarding";
import LoginForm from "./components/Auth/LoginForm";
import RegisterForm from "./components/Auth/RegisterForm";
import ForgotPasswordForm from "./components/Auth/ForgotPasswordForm";
import { userType } from "./types";
import { Route, Routes, useNavigate } from "react-router-dom";
import TestChat from "./components/Chat/TestChatBox";
import { useUser } from "@clerk/clerk-react";
import { useDispatch, useSelector } from "react-redux";
import { setStatus } from "./slice/statusSlice";
import { AppDispatch, RootState } from "./store/store";
import { fetchUserAsync } from "./slice/userSlice";
import { api } from "./api";

function App() {
  const dispatch = useDispatch<AppDispatch>();
  const { appState, updateUserState, unpinMatch } = useAppState();
  const { user } = useUser();
  const { status } = useSelector((state: RootState) => state.status);
  const { user: myUser } = useSelector((state: RootState) => state.user);

  const navigate = useNavigate();
  const [currentView, setCurrentView] = useState("dashboard");
  const [showOnboarding, setShowOnboarding] = useState(false);

  const email = user?.emailAddresses?.[0]?.emailAddress;

  // console.log("status:- ", status, "myUser:-", myUser);

  useEffect(() => {
    if (email && !myUser) dispatch(fetchUserAsync({ email }));
  }, [email]);

  useEffect(() => {
    if (!status) dispatch(setStatus(myUser?.status));
  }, [myUser]);

  const handleOnboardingComplete = async (data: userType | null) => {
    console.log("Onboarding completed with data:", data);
    //TODO:-  update data here for onboarding !

    if (!data) return;

    const {
      communicationStyle,
      interests,
      personalityType,
      relationshipGoals,
      values,
    } = data;
    const { age, bio, email, location, mood, gender } = data;

    api
      .put("/api/onboard-user", {
        communicationStyle,
        interests,
        personalityType,
        relationshipGoals,
        values,
        age,
        bio,
        email,
        gender,
        location,
        photos: user?.imageUrl,
        mood,
      })
      .then((res) => {
        console.log("onboarding Data", res.data);
        dispatch(fetchUserAsync({ email }));
        dispatch(setStatus(myUser?.status));
      })
      .catch((error) => {
        console.log("During onBoarding setUp:-", error);
      });

    await user?.update({
      unsafeMetadata: {
        communicationStyle,
        interests,
        personalityType,
        relationshipGoals,
        values,
        age,
        bio,
        location,
      },
    });

    navigate("/dashboard");

    setShowOnboarding(false);
    updateUserState("available");
  };

  const handleStartChat = () => {};

  const handleBackToDashboard = () => {
    setCurrentView("dashboard");
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
          onClose={() => {}}
          currentView={currentView}
          userState={status}
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
      <div className="flex-1 flex-col lg:flex lg:flex-col">
        {/* Top Header */}
        <TopHeader currentView={currentView} userState={status} />

        {/* Content Area */}
        <main className="flex-1 pt-16 lg:pt-0">
          {/* {renderCurrentView()} */}
          <Routes>
            {/* Register 
            In this route after register you will not redirected to this page until and unless after doing logout
            */}
            <Route path="/register" element={<RegisterForm />} />

            {/* Login
            In this route after login you will you redirected to this page until and unless after doing logout
            */}
            <Route path="/login" element={<LoginForm />} />

            {/* Forgot-password
            In this route after login or register you will you redirected to this page until and unless after doing logout
            */}
            <Route path="/forgot-password" element={<ForgotPasswordForm />} />

            {/* dashboard 
            In this route you only can access after doing login or register
            */}
            <Route
              path="/dashboard"
              element={
                <Dashboard
                  appState={appState}
                  status={status}
                  onStartChat={handleStartChat}
                  onUnpinMatch={unpinMatch}
                />
              }
            />

            {/* Chat
            In this route you only can access after doing login or register 
            */}
            <Route
              path="/chat"
              element={
                appState.currentMatch ? (
                  <ChatInterface
                    match={appState.currentMatch}
                    onBack={handleBackToDashboard}
                  />
                ) : (
                  <div className="p-6 text-center">
                    <p className="text-gray-600">No active conversation</p>
                  </div>
                )
              }
            />

            {/* profile 
            In this route you only can access after doing login or register
            */}
            <Route
              path="/profile"
              element={
                appState.currentUser ? (
                  <Profile user={appState.currentUser} />
                ) : null
              }
            />

            {/* Settings
            In this route you only can access after doing login or register
            */}
            <Route
              path="/settings"
              element={
                <div className="p-6 pt-20 pb-24">
                  <h1 className="text-2xl font-bold text-gray-900 mb-6">
                    Settings
                  </h1>
                  <div className="space-y-4">
                    <button
                      onClick={() => navigate("/onboarding-user")}
                      className="w-full p-4 bg-white rounded-xl shadow-sm text-left hover:bg-gray-50 transition-all duration-200"
                    >
                      <h3 className="font-medium text-gray-900">
                        Retake Compatibility Assessment
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Update your preferences and matching criteria
                      </p>
                    </button>
                    <button className="w-full p-4 bg-white rounded-xl shadow-sm text-left hover:bg-gray-50 transition-all duration-200">
                      <h3 className="font-medium text-gray-900">
                        Notification Settings
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Manage how and when you receive notifications
                      </p>
                    </button>
                    <button className="w-full p-4 bg-white rounded-xl shadow-sm text-left hover:bg-gray-50 transition-all duration-200">
                      <h3 className="font-medium text-gray-900">
                        Privacy & Safety
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Control your privacy and safety settings
                      </p>
                    </button>
                    <button className="w-full p-4 bg-white rounded-xl shadow-sm text-left hover:bg-gray-50 transition-all duration-200">
                      <h3 className="font-medium text-gray-900">
                        Help & Support
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Get help and contact support
                      </p>
                    </button>
                    <button className="w-full p-4 bg-red-50 border border-red-200 rounded-xl text-left hover:bg-red-100 transition-all duration-200">
                      <h3 className="font-medium text-red-900">Sign Out</h3>
                      <p className="text-sm text-red-600 mt-1">
                        Sign out of your account
                      </p>
                    </button>
                  </div>
                </div>
              }
            />

            {/* In this routes you can access without doing login or register and then not you will rediected to previous page */}
            <Route
              path="/"
              element={
                <Dashboard
                  appState={appState}
                  onStartChat={handleStartChat}
                  onUnpinMatch={unpinMatch}
                  status={status}
                />
              }
            />

            <Route path="/testchat/:user1/:user2" element={<TestChat />} />

            <Route
              path="/onboarding-user"
              element={<Onboarding onComplete={handleOnboardingComplete} />}
            />
          </Routes>
        </main>

        {/* Mobile Bottom Navigation */}
        <div className="lg:hidden">
          <Navigation userState={appState.userState} />
        </div>
      </div>
    </div>
  );
}

export default App;
