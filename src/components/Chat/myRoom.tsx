// src/App.tsx
import React, { useEffect } from "react";
import { Provider } from "react-redux";
import "./myRoom.css";
import { useAppDispatch, useAppSelector } from "../../store/hook";
import { fetchUserAsync } from "../../slice/userSlice";
import ChatList from "./ChatList";
import ChatRoom from "./ChatRoom";
import { store } from "../../store/store";
import { useUser } from "@clerk/clerk-react";

const ChatApp: React.FC = () => {
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector((state) => state.user.user);
  const selectedUser = useAppSelector((state) => state.user.selectedUser);
  const loading = useAppSelector((state) => state.user.loading);
  const error = useAppSelector((state) => state.user.error);

  const { user } = useUser();
  const email = user?.emailAddresses[0].emailAddress;

  useEffect(() => {
    // TODO: Replace with actual auth logic
    // For now, get email from localStorage or your auth system
    const userEmail = email;

    dispatch(fetchUserAsync({ email: userEmail, isEmbedding: false }));
  }, [dispatch, email]);

  // Show loading state
  if (loading && !currentUser) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading your profile...</p>
      </div>
    );
  }

  // Show error state
  if (error && !currentUser) {
    return (
      <div className="error-container">
        <div className="error-content">
          <h2>Oops! Something went wrong</h2>
          <p>{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="retry-button"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Show authentication required
  if (!currentUser) {
    return (
      <div className="auth-required">
        <div className="auth-content">
          <h2>Welcome to Lovetown Chat</h2>
          <p>Please log in to start chatting</p>
          <button
            onClick={() => {
              // TODO: Redirect to login page
              window.location.href = "/login";
            }}
            className="login-button"
          >
            Log In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <ChatList />
      {selectedUser ? (
        <ChatRoom />
      ) : (
        <div className="no-chat-selected">
          <div className="no-chat-content">
            <div className="no-chat-icon">💬</div>
            <h2>Welcome to Lovetown Chat!</h2>
            <p>Select a conversation to start messaging</p>

            {currentUser.status === "available" && (
              <div className="status-info">
                <p className="status-text">
                  You're <span className="status-badge">Available</span>
                </p>
                <p className="status-subtitle">
                  Get matched to start chatting!
                </p>
              </div>
            )}

            {currentUser.status === "matched" && (
              <div className="status-info">
                <p className="status-text">
                  You're <span className="status-badge matched">Matched</span>
                </p>
                <p className="status-subtitle">
                  Start a conversation with your match!
                </p>
              </div>
            )}

            {currentUser.status === "chatting" && (
              <div className="status-info">
                <p className="status-text">
                  You're <span className="status-badge chatting">Chatting</span>
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const MyRoom: React.FC = () => {
  return (
    <Provider store={store}>
      <ChatApp />
    </Provider>
  );
};

export default MyRoom;
