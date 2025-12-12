// src/components/ChatRoom.tsx
import React, {
  useState,
  useEffect,
  useRef,
  FormEvent,
  ChangeEvent,
} from "react";
import { useAppDispatch, useAppSelector } from "../../store/hook";
import { socketService } from "../../service/socketService";
import { clearMessages, fetchMessagesAsync } from "../../slice/chatSlice";
// import { userType } from "../types";
import "./ChatRoom.css";
import { userType } from "../../types";

interface ChatRoomProps {
  className?: string;
}

const ChatRoom: React.FC<ChatRoomProps> = ({ className }) => {
  const dispatch = useAppDispatch();

  const currentUser = useAppSelector((state) => state.user.user);
  const selectedUser = useAppSelector((state) => state.user.selectedUser);
  const messages = useAppSelector((state) => state.chat.messages);
  const currentRoom = useAppSelector((state) => state.chat.currentRoom);
  const onlineUsers = useAppSelector((state) => state.chat.onlineUsers);
  const typingUsers = useAppSelector((state) => state.chat.typingUsers);
  const loading = useAppSelector((state) => state.chat.loading);

  const [inputMessage, setInputMessage] = useState<string>("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize socket connection
  useEffect(() => {
    if (currentUser?._id && !socketService.isConnected()) {
      socketService.connect(currentUser._id);
    }

    return () => {
      // Clean up typing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [currentUser?._id]);

  // Join room when selected user changes
  useEffect(() => {
    if (currentUser?._id && selectedUser?._id) {
      dispatch(clearMessages());
      socketService.joinRoom(currentUser._id, selectedUser._id);
    }
  }, [currentUser?._id, selectedUser?._id, dispatch]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Mark messages as read
  useEffect(() => {
    if (currentRoom && currentUser?._id && messages.length > 0) {
      const timer = setTimeout(() => {
        socketService.markAsRead(currentRoom, currentUser._id);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [currentRoom, messages.length, currentUser?._id]);

  const handleSendMessage = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();

    if (
      inputMessage.trim() &&
      currentRoom &&
      currentUser?._id &&
      selectedUser?._id
    ) {
      socketService.sendMessage(
        currentRoom,
        currentUser._id,
        selectedUser._id,
        inputMessage.trim()
      );
      setInputMessage("");

      // Stop typing indicator
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      socketService.stopTyping(currentRoom, currentUser._id);
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setInputMessage(e.target.value);

    if (!currentRoom || !currentUser?._id) return;

    // Start typing indicator
    socketService.startTyping(currentRoom, currentUser._id);

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Stop typing after 1 second of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      socketService.stopTyping(currentRoom, currentUser._id);
    }, 1000);
  };

  const formatTime = (timestamp: Date): string => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getDisplayPhoto = (user: userType): string => {
    if (user.photos && user.photos.length > 0) {
      return user.photos[0];
    }
    return "/default-avatar.png";
  };

  const isUserOnline = selectedUser?._id
    ? onlineUsers.has(selectedUser._id)
    : false;
  const isOtherUserTyping = selectedUser?._id
    ? typingUsers.has(selectedUser._id)
    : false;

  if (!currentUser || !selectedUser) {
    return (
      <div className="chat-room-empty">
        <div className="empty-state">
          <p className="empty-title">No chat selected</p>
          <p className="empty-subtitle">
            Select a conversation to start messaging
          </p>
        </div>
      </div>
    );
  }

  // Check if user status allows chatting
  const canChat = ["matched", "chatting"].includes(currentUser.status);

  return (
    <div className={`chat-room ${className || ""}`}>
      {/* Chat Header */}
      <div className="chat-header">
        <div className="user-info">
          <img
            src={getDisplayPhoto(selectedUser)}
            alt={selectedUser.name}
            className="user-avatar"
          />
          <div className="user-details">
            <h3>{selectedUser.name}</h3>
            <div className="user-meta">
              <span className={`status ${isUserOnline ? "online" : "offline"}`}>
                {isUserOnline ? "Online" : "Offline"}
              </span>
              {selectedUser.age && (
                <span className="age">• {selectedUser.age}</span>
              )}
              {selectedUser.location && (
                <span className="location">• {selectedUser.location}</span>
              )}
            </div>
            {selectedUser.mood && <p className="mood">{selectedUser.mood}</p>}
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div className="messages-container">
        {loading ? (
          <div className="loading-messages">
            <p>Loading messages...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="no-messages">
            <p>No messages yet. Start the conversation! 👋</p>
            {selectedUser.bio && (
              <div className="user-bio">
                <p>
                  <strong>About {selectedUser.name}:</strong>
                </p>
                <p>{selectedUser.bio}</p>
              </div>
            )}
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg._id}
              className={`message ${
                msg.senderId === currentUser._id ? "sent" : "received"
              }`}
            >
              <div className="message-content">
                <p>{msg.message}</p>
                <span className="message-time">
                  {formatTime(msg.timestamp)}
                  {msg.senderId === currentUser._id && (
                    <span className="read-indicator">
                      {msg.read ? " ✓✓" : " ✓"}
                    </span>
                  )}
                </span>
              </div>
            </div>
          ))
        )}

        {isOtherUserTyping && (
          <div className="typing-indicator">
            <span>{selectedUser.name} is typing</span>
            <div className="typing-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <form className="message-input-form" onSubmit={handleSendMessage}>
        {!canChat && (
          <div className="chat-disabled-notice">
            <p>⚠️ Chat is only available when matched</p>
          </div>
        )}
        <input
          type="text"
          value={inputMessage}
          onChange={handleInputChange}
          placeholder={
            canChat
              ? "Type a message..."
              : "Match with someone to start chatting"
          }
          className="message-input"
          autoFocus
          disabled={!canChat}
        />
        <button
          type="submit"
          className="send-button"
          disabled={!inputMessage.trim() || !canChat}
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default ChatRoom;
