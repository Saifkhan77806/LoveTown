import React, { useState, useRef, useEffect } from "react";
import { Send } from "lucide-react";
import { Match, Message } from "../../types";
import { io } from "socket.io-client";
import VedioInterface from "./VedioInterface";
import { useAppDispatch, useAppSelector } from "../../store/hook";
import { useSocket } from "../../constant";
import { useToast } from "../ui/toaster";
import { setToast } from "../../slice/toastSlice";

interface ChatInterfaceProps {
  match: Match;
  onBack: () => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ onBack }) => {
  const socketRef = useSocket();
  const dispatch = useAppDispatch();
  const toast = useToast();
  const { user } = useAppSelector((state) => state.user);
  const { matchedUser } = useAppSelector((state) => state.matched);

  const [messageCount, setMessageCount] = useState(0);
  const [isLoadingMessages, setIsLoadingMessages] = useState(true);
  const user1 = user?.email;
  const user2 = matchedUser?.email;
  const [isOnline, setIsOnline] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const progress = (messageCount / 100) * 100;

  const sendMessage = () => {
    if (!message.trim()) return;
    const newMessage: Message = {
      id: Date.now().toString(), // Temporary ID, will be replaced by DB ID
      from: user1,
      to: user2,
      content: message,
      timestamp: new Date(),
      type: "text",
    };
    socketRef.emit("send-message", newMessage);
    setMessage("");
  };

  useEffect(() => {
    if (!user1 || !user2) return;

    const socket = socketRef;

    // Register this user with their email
    socket.emit("register", user1);

    // Join the chat room
    socket.emit("join-room", { from: user1, to: user2 });

    const handleGetOnline = (online: boolean) => {
      console.log("Other user online status:", online);
      setIsOnline(online);
    };

    const handleMessageHistory = (history: Message[]) => {
      console.log("Received message history:", history.length, "messages");
      setMessages(
        history.map((msg) => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
        }))
      );
      setIsLoadingMessages(false);
    };

    const handleMessageCount = (count: number) => {
      console.log("Message count updated:", count);
      setMessageCount(count);
    };

    const handleReceiveMessage = (msg: Message) => {
      console.log("Received new message:", msg);
      // toast.success(msg.content);
      dispatch(setToast(msg.content));
      setMessages((prev) => {
        // Check if message already exists (avoid duplicates)
        const exists = prev.some((m) => m.id === msg.id);
        if (exists) return prev;

        return [...prev, { ...msg, timestamp: new Date(msg.timestamp) }];
      });
    };

    const handleError = (error: { message: string }) => {
      console.error("Socket error:", error);
      alert(error.message);
    };

    socket.on("getonline", handleGetOnline);
    socket.on("message-history", handleMessageHistory);
    socket.on("message-count", handleMessageCount);
    socket.on("receive-message", handleReceiveMessage);
    socket.on("error", handleError);

    // Cleanup function
    return () => {
      console.log("Component unmounting, leaving room");
      socket.off("getonline", handleGetOnline);
      socket.off("message-history", handleMessageHistory);
      socket.off("message-count", handleMessageCount);
      socket.off("receive-message", handleReceiveMessage);
      socket.off("error", handleError);
    };
  }, [user1, user2]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex flex-col h-screen max-lg:h-[76vh] lg:pt-14 bg-white">
      {/* Header */}
      <div className="bg-white border-b p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="text-gray-600 hover:text-gray-900"
          >
            ←
          </button>
          <div className="size-9 overflow-hidden rounded-full"><img src={matchedUser?.photos} alt="" /></div>
          <div>
            <h2 className="font-semibold text-gray-900">
              {matchedUser?.name || ""}
            </h2>
            <p
              className={`text-sm ${
                isOnline ? "text-green-600" : "text-red-600"
              }`}
            >
              {isOnline ? "Online" : "Offline"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <VedioInterface messageCount={messageCount} />
        </div>
      </div>

      {/* Progress */}
      <div className="p-3 border-b bg-gray-50">
        <div className="flex justify-between text-sm mb-2">
          <span>{messageCount}/100 messages</span>
          <span>
            {messageCount >= 100
              ? "🎉 Video unlocked!"
              : `${100 - messageCount} to unlock video`}
          </span>
        </div>
        <div className="bg-white h-2 rounded-full">
          <div
            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoadingMessages ? (
          <div className="flex justify-center items-center h-full">
            <div className="text-gray-500">Loading messages...</div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex justify-center items-center h-full">
            <div className="text-gray-500 text-center">
              <p className="text-lg mb-2">No messages yet</p>
              <p className="text-sm">Start the conversation!</p>
            </div>
          </div>
        ) : (
          messages.map((msg, index) => {
            const isOwn = msg.from === user1;
            return (
              <div
                key={index}
                className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-2xl ${
                    isOwn ? "bg-blue-600 text-white" : "bg-gray-200 text-black"
                  }`}
                >
                  <p>{msg.content}</p>
                  <p className="text-xs mt-1 opacity-70">
                    {msg.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t p-4 z-10">
        <div className="flex gap-2">
          <textarea
            rows={1}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type something..."
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            className="flex-1 resize-none border p-2 rounded focus:outline-none"
          />
          <button
            onClick={sendMessage}
            disabled={!message.trim()}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
