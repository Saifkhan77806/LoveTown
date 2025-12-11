// src/services/socketService.ts
import { io, Socket } from "socket.io-client";
import { store } from "../store/store";
import {
  setSocket,
  addOnlineUser,
  removeOnlineUser,
  addMessage,
  setMessages,
  setCurrentRoom,
  addTypingUser,
  removeTypingUser,
  markMessagesAsRead,
  Message,
} from "../slice/chatSlice";

const SOCKET_URL = "http://localhost:5000";

class SocketService {
  private socket: Socket | null = null;

  connect(userId: string): void {
    if (this.socket?.connected) {
      console.log("Socket already connected");
      return;
    }

    this.socket = io(SOCKET_URL, {
      transports: ["websocket"],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    store.dispatch(setSocket(this.socket));

    // Setup event listeners
    this.setupEventListeners(userId);

    // Emit user online status
    this.socket.emit("user-online", userId);
  }

  private setupEventListeners(userId: string): void {
    if (!this.socket) return;

    // Connection events
    this.socket.on("connect", () => {
      console.log("Socket connected:", this.socket?.id);
      this.socket?.emit("user-online", userId);
    });

    this.socket.on("disconnect", () => {
      console.log("Socket disconnected");
    });

    this.socket.on("connect_error", (error) => {
      console.error("Connection error:", error);
    });

    // User status changes
    this.socket.on(
      "user-status-change",
      ({ userId: changedUserId, status }) => {
        if (status === "online") {
          store.dispatch(addOnlineUser(changedUserId));
        } else {
          store.dispatch(removeOnlineUser(changedUserId));
        }
      }
    );

    // Room events
    this.socket.on("room-joined", ({ roomId, messages, otherUserStatus }) => {
      store.dispatch(setCurrentRoom(roomId));
      store.dispatch(setMessages(messages));

      if (otherUserStatus === "online") {
        const state = store.getState();
        const otherUserId = state.user.selectedUser?._id;
        if (otherUserId) {
          store.dispatch(addOnlineUser(otherUserId));
        }
      }
    });

    // Message events
    this.socket.on("receive-message", (message: Message) => {
      store.dispatch(addMessage(message));
    });

    this.socket.on("messages-read", ({ roomId, userId: readByUserId }) => {
      store.dispatch(markMessagesAsRead({ roomId, userId: readByUserId }));
    });

    // Typing events
    this.socket.on("user-typing", ({ userId: typingUserId }) => {
      store.dispatch(addTypingUser(typingUserId));
    });

    this.socket.on("user-stop-typing", ({ userId: typingUserId }) => {
      store.dispatch(removeTypingUser(typingUserId));
    });

    // Error handling
    this.socket.on("error", (error) => {
      console.error("Socket error:", error);
    });
  }

  joinRoom(userId: string, otherUserId: string): void {
    if (!this.socket?.connected) {
      console.error("Socket not connected");
      return;
    }
    this.socket.emit("join-room", { userId, otherUserId });
  }

  sendMessage(
    roomId: string,
    senderId: string,
    receiverId: string,
    message: string
  ): void {
    if (!this.socket?.connected) {
      console.error("Socket not connected");
      return;
    }
    this.socket.emit("send-message", { roomId, senderId, receiverId, message });
  }

  markAsRead(roomId: string, userId: string): void {
    if (!this.socket?.connected) {
      console.error("Socket not connected");
      return;
    }
    this.socket.emit("mark-as-read", { roomId, userId });
  }

  startTyping(roomId: string, userId: string): void {
    if (!this.socket?.connected) return;
    this.socket.emit("typing", { roomId, userId });
  }

  stopTyping(roomId: string, userId: string): void {
    if (!this.socket?.connected) return;
    this.socket.emit("stop-typing", { roomId, userId });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      store.dispatch(setSocket(null));
    }
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

export const socketService = new SocketService();
