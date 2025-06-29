import React, { useState, useRef, useEffect } from 'react';
import { Send, } from 'lucide-react';
import { Match, Message } from '../../types';
import { io } from 'socket.io-client';
import { useMatchUser } from '../../store/store';
import VedioInterface from './VedioInterface';

interface ChatInterfaceProps {
  match: Match;
  onBack: () => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ onBack }) => {
  const socket = useRef(io('http://localhost:5000')).current;
  const { users } = useMatchUser();

  const [messageCount, setMessageCount] = useState(3);
  const user1 = users?.user1?._id;
  const user2 = users?.user2?._id;

  
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      from: user1,
      to: user2,
      content: "Hi! I'm excited we matched. What drew you to Lone Town?",
      timestamp: new Date(),
      type: 'text',
    },
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const progress = (messageCount / 100) * 100;

  const sendMessage = () => {
    if (!message.trim()) return;
    const newMessage: Message = {
      id: Date.now().toString(),
      from: user1,
      to: user2,
      content: message,
      timestamp: new Date(),
      type: 'text',
    };
    socket.emit('send-message', newMessage);
    setMessage('');
  };

  useEffect(() => {
    const handler = (msg: Message) => {
      setMessages((prev) => [...prev, { ...msg, timestamp: new Date(msg.timestamp) }]);
      setMessageCount((prev) => prev + 1);
    };
    socket.on('receive-message', handler);
    return () => {
      socket.off('receive-message', handler);
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex flex-col h-screen max-lg:h-[76vh] bg-white">
      {/* Video Modal */}
     

      

      {/* Header */}
      <div className="bg-white border-b p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="text-gray-600 hover:text-gray-900">←</button>
          <img src={users?.user2?.photos[0]} alt={users?.user2?.name} className="w-10 h-10 rounded-full object-cover" />
          <div>
            <h2 className="font-semibold text-gray-900">{users?.user2?.name}</h2>
            <p className="text-sm text-green-600">Online</p>
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
          <span>{messageCount >= 100 ? '🎉 Video unlocked!' : `${100 - messageCount} to unlock video`}</span>
        </div>
        <div className="bg-white h-2 rounded-full">
          <div className="bg-blue-500 h-2 rounded-full transition-all duration-300" style={{ width: `${Math.min(progress, 100)}%` }} />
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => {
          const isOwn = msg.from === user1;
          return (
            <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] p-3 rounded-2xl ${isOwn ? 'bg-blue-600 text-white' : 'bg-gray-200 text-black'}`}>
                <p>{msg.content}</p>
                <p className="text-xs mt-1">{msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
              </div>
            </div>
          );
        })}
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
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
            className="flex-1 resize-none border p-2 rounded focus:outline-none"
          />
          <button onClick={sendMessage} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
