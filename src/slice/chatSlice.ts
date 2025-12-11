// src/store/slices/chatSlice.ts
import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import { Socket } from "socket.io-client";
import { api } from "../api";
// import { api } from "../../api";

export interface Message {
  _id: string;
  roomId: string;
  senderId: string;
  receiverId: string;
  message: string;
  timestamp: Date;
  read: boolean;
  type?: "text" | "voice" | "system";
}

export interface Room {
  _id: string;
  participants: Array<{
    _id: string;
    name: string;
    email: string;
    photos: string[];
    status: string;
    mood?: string;
    age?: number;
  }>;
  lastMessage: string;
  lastMessageTime: Date;
  otherUserOnline?: boolean;
  createdAt: Date;
}

interface ChatState {
  socket: Socket | null;
  onlineUsers: Set<string>;
  currentRoom: string | null;
  messages: Message[];
  rooms: Room[];
  isTyping: boolean;
  typingUsers: Set<string>;
  loading: boolean;
  error: string | null;
  unreadCount: number;
}

const initialState: ChatState = {
  socket: null,
  onlineUsers: new Set(),
  currentRoom: null,
  messages: [],
  rooms: [],
  isTyping: false,
  typingUsers: new Set(),
  loading: false,
  error: null,
  unreadCount: 0,
};

// Async thunk to fetch rooms
export const fetchRoomsAsync = createAsyncThunk<
  Room[],
  string,
  { rejectValue: string }
>("chat/fetchRooms", async (userId: string, { rejectWithValue }) => {
  try {
    const response = await api.get(`/api/rooms/${userId}`);
    return response.data;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || "Failed to fetch rooms"
    );
  }
});

// Async thunk to fetch messages
export const fetchMessagesAsync = createAsyncThunk<
  Message[],
  { roomId: string; skip?: number; limit?: number },
  { rejectValue: string }
>(
  "chat/fetchMessages",
  async ({ roomId, skip = 0, limit = 50 }, { rejectWithValue }) => {
    try {
      const response = await api.get(`/api/messages/${roomId}`, {
        params: { skip, limit },
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch messages"
      );
    }
  }
);

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    setSocket: (state, action: PayloadAction<Socket | null>) => {
      state.socket = action.payload;
    },

    setOnlineUsers: (state, action: PayloadAction<Set<string>>) => {
      state.onlineUsers = action.payload;
    },

    addOnlineUser: (state, action: PayloadAction<string>) => {
      const newSet = new Set(state.onlineUsers);
      newSet.add(action.payload);
      state.onlineUsers = newSet;
    },

    removeOnlineUser: (state, action: PayloadAction<string>) => {
      const newSet = new Set(state.onlineUsers);
      newSet.delete(action.payload);
      state.onlineUsers = newSet;
    },

    setCurrentRoom: (state, action: PayloadAction<string | null>) => {
      state.currentRoom = action.payload;
    },

    setMessages: (state, action: PayloadAction<Message[]>) => {
      state.messages = action.payload;
    },

    addMessage: (state, action: PayloadAction<Message>) => {
      state.messages.push(action.payload);

      // Update room last message
      const room = state.rooms.find((r) => r._id === action.payload.roomId);
      if (room) {
        room.lastMessage = action.payload.message;
        room.lastMessageTime = action.payload.timestamp;
      }

      // Increment unread count if message is not from current user
      if (action.payload.roomId !== state.currentRoom && !action.payload.read) {
        state.unreadCount++;
      }
    },

    updateMessage: (
      state,
      action: PayloadAction<{ id: string; updates: Partial<Message> }>
    ) => {
      const index = state.messages.findIndex(
        (msg) => msg._id === action.payload.id
      );
      if (index !== -1) {
        state.messages[index] = {
          ...state.messages[index],
          ...action.payload.updates,
        };
      }
    },

    markMessagesAsRead: (
      state,
      action: PayloadAction<{ roomId: string; userId: string }>
    ) => {
      const unreadMessages = state.messages.filter(
        (msg) =>
          msg.roomId === action.payload.roomId &&
          msg.receiverId === action.payload.userId &&
          !msg.read
      );

      state.messages = state.messages.map((msg) =>
        msg.roomId === action.payload.roomId &&
        msg.receiverId === action.payload.userId &&
        !msg.read
          ? { ...msg, read: true }
          : msg
      );

      state.unreadCount = Math.max(
        0,
        state.unreadCount - unreadMessages.length
      );
    },

    setRooms: (state, action: PayloadAction<Room[]>) => {
      state.rooms = action.payload;
      // Calculate unread count
      state.unreadCount = action.payload.reduce((acc, room) => {
        // You can add logic here to count unread messages per room
        return acc;
      }, 0);
    },

    addRoom: (state, action: PayloadAction<Room>) => {
      const exists = state.rooms.find(
        (room) => room._id === action.payload._id
      );
      if (!exists) {
        state.rooms.unshift(action.payload);
      }
    },

    updateRoomLastMessage: (
      state,
      action: PayloadAction<{ roomId: string; message: string; time: Date }>
    ) => {
      const roomIndex = state.rooms.findIndex(
        (r) => r._id === action.payload.roomId
      );
      if (roomIndex !== -1) {
        const room = state.rooms[roomIndex];
        room.lastMessage = action.payload.message;
        room.lastMessageTime = action.payload.time;

        // Move room to top
        state.rooms.splice(roomIndex, 1);
        state.rooms.unshift(room);
      }
    },

    setTyping: (state, action: PayloadAction<boolean>) => {
      state.isTyping = action.payload;
    },

    addTypingUser: (state, action: PayloadAction<string>) => {
      const newSet = new Set(state.typingUsers);
      newSet.add(action.payload);
      state.typingUsers = newSet;
    },

    removeTypingUser: (state, action: PayloadAction<string>) => {
      const newSet = new Set(state.typingUsers);
      newSet.delete(action.payload);
      state.typingUsers = newSet;
    },

    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },

    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },

    clearMessages: (state) => {
      state.messages = [];
    },

    clearError: (state) => {
      state.error = null;
    },

    resetChatState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      // Fetch rooms
      .addCase(fetchRoomsAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRoomsAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.rooms = action.payload;
      })
      .addCase(fetchRoomsAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch rooms";
      })
      // Fetch messages
      .addCase(fetchMessagesAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMessagesAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.messages = action.payload;
      })
      .addCase(fetchMessagesAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch messages";
      });
  },
});

export const {
  setSocket,
  setOnlineUsers,
  addOnlineUser,
  removeOnlineUser,
  setCurrentRoom,
  setMessages,
  addMessage,
  updateMessage,
  markMessagesAsRead,
  setRooms,
  addRoom,
  updateRoomLastMessage,
  setTyping,
  addTypingUser,
  removeTypingUser,
  setLoading,
  setError,
  clearMessages,
  clearError,
  resetChatState,
} = chatSlice.actions;

export default chatSlice.reducer;
