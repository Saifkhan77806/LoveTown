// src/components/ChatList.tsx
import React, { useEffect, useState } from 'react';

import './ChatList.css';
import { userType } from '../../types';
import { useAppDispatch, useAppSelector } from '../../store/hook';
import { fetchRoomsAsync } from '../../slice/chatSlice';
import { setSelectedUser } from '../../slice/userSlice';

interface ChatListProps {
  onSelectChat?: (user: userType) => void;
}

const ChatList: React.FC<ChatListProps> = ({ onSelectChat }) => {
  const dispatch = useAppDispatch();
  
  const currentUser = useAppSelector((state) => state.user.user);
  const rooms = useAppSelector((state) => state.chat.rooms);
  const onlineUsers = useAppSelector((state) => state.chat.onlineUsers);
  const selectedUser = useAppSelector((state) => state.user.selectedUser);
  const loading = useAppSelector((state) => state.chat.loading);
  const error = useAppSelector((state) => state.chat.error);
  const unreadCount = useAppSelector((state) => state.chat.unreadCount);

  const [searchQuery, setSearchQuery] = useState<string>('');

  // Fetch chat rooms
  useEffect(() => {
    if (currentUser?._id) {
      dispatch(fetchRoomsAsync(currentUser._id));
    }
  }, [currentUser?._id, dispatch]);

  const handleSelectChat = (room: any) => {
    const otherUser = room.participants.find(
      (p: any) => p._id !== currentUser?._id
    );
    
    if (otherUser) {
      const user: userType = {
        _id: otherUser._id,
        name: otherUser.name,
        email: otherUser.email,
        photos: otherUser.photos || [],
        interests: otherUser.interests || [],
        values: otherUser.values || [],
        status: otherUser.status,
        createdAt: new Date(otherUser.createdAt || Date.now()),
        updatedAt: new Date(otherUser.updatedAt || Date.now()),
        age: otherUser.age || 0,
        bio: otherUser.bio || '',
        communicationStyle: otherUser.communicationStyle || '',
        gender: otherUser.gender || '',
        location: otherUser.location || '',
        mood: otherUser.mood || '',
        personalityType: otherUser.personalityType || '',
        relationshipGoals: otherUser.relationshipGoals || '',
      };
      
      dispatch(setSelectedUser(user));
      onSelectChat?.(user);
    }
  };

  const formatLastMessageTime = (time: Date): string => {
    const date = new Date(time);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
      return diffInMinutes < 1 ? 'Just now' : `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } else if (diffInHours < 168) { // Less than a week
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  const getDisplayPhoto = (photos: string[]): string => {
    if (photos && photos.length > 0) {
      return photos[0];
    }
    return '/default-avatar.png';
  };

  const filteredRooms = rooms.filter(room => {
    const otherUser = room.participants.find(p => p._id !== currentUser?._id);
    return otherUser?.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  if (loading && rooms.length === 0) {
    return (
      <div className="chat-list">
        <div className="chat-list-header">
          <h2>Messages</h2>
          {unreadCount > 0 && (
            <span className="unread-badge">{unreadCount}</span>
          )}
        </div>
        <div className="chat-list-loading">
          <div className="spinner"></div>
          <p>Loading chats...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="chat-list">
        <div className="chat-list-header">
          <h2>Messages</h2>
        </div>
        <div className="chat-list-error">
          <p>{error}</p>
          <button onClick={() => currentUser?._id && dispatch(fetchRoomsAsync(currentUser._id))}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-list">
      <div className="chat-list-header">
        <div className="header-top">
          <h2>Messages</h2>
          {unreadCount > 0 && (
            <span className="unread-badge">{unreadCount}</span>
          )}
        </div>
        
        {rooms.length > 0 && (
          <div className="search-container">
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>
        )}
      </div>

      <div className="chat-list-container">
        {filteredRooms.length === 0 ? (
          <div className="no-chats">
            {searchQuery ? (
              <>
                <p>No matches found</p>
                <p className="no-chats-subtitle">Try a different search term</p>
              </>
            ) : (
              <>
                <p>No conversations yet</p>
                <p className="no-chats-subtitle">
                  {currentUser?.status === 'matched' 
                    ? 'Get matched to start chatting!' 
                    : 'Match with someone to begin!'}
                </p>
              </>
            )}
          </div>
        ) : (
          filteredRooms.map((room) => {
            const otherUser = room.participants.find(
              (p: any) => p._id !== currentUser?._id
            );
            
            if (!otherUser) return null;
            
            const isOnline = onlineUsers.has(otherUser._id);
            const isSelected = selectedUser?._id === otherUser._id;
            
            return (
              <div
                key={room._id}
                className={`chat-item ${isSelected ? 'selected' : ''}`}
                onClick={() => handleSelectChat(room)}
              >
                <div className="chat-item-avatar-container">
                  <img
                    src={getDisplayPhoto(otherUser.photos)}
                    alt={otherUser.name}
                    className="chat-item-avatar"
                  />
                  {isOnline && <span className="online-dot"></span>}
                </div>

                <div className="chat-item-content">
                  <div className="chat-item-header">
                    <div className="chat-item-name-container">
                      <h4>{otherUser.name}</h4>
                      {otherUser.age && (
                        <span className="chat-item-age">, {otherUser.age}</span>
                      )}
                    </div>
                    <span className="chat-item-time">
                      {formatLastMessageTime(room.lastMessageTime)}
                    </span>
                  </div>
                  
                  {otherUser.mood && (
                    <p className="chat-item-mood">{otherUser.mood}</p>
                  )}
                  
                  <p className="chat-item-last-message">
                    {room.lastMessage || 'No messages yet'}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ChatList;