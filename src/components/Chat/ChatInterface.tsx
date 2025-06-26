import React, { useState, useRef, useEffect } from 'react';
import { Send, Video, Phone, MoreVertical } from 'lucide-react';
import { Match, Message } from '../../types';
import { io } from 'socket.io-client';
import { useMatchUser } from '../../store/store';

interface ChatInterfaceProps {
  match: Match;
  onBack: () => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ onBack }) => {
  const socket = io('http://localhost:5000');
  const [messageCount, setMessageCount] = useState(0)
  const {users} = useMatchUser()

  const user1 = users?.user1?._id
  const user2 = users?.user2?._id

  useEffect(() => {
    socket.emit('register', user1);
    socket.emit('join-room', { from: user1, to: user2 });

    const handleMessage = (msg: any) => {
     setMessages((prev) => {
    const updated = [...prev, { ...msg, timestamp: new Date(msg.timestamp) }];
    setMessageCount(updated.length); // ✅ Update after state is created
    return updated;
  });
    };

    socket.on('receive-message', handleMessage);

    // 👇 CLEANUP must return nothing
    return () => {
      socket.off('receive-message', handleMessage);
    };
  }, [user1, user2]);

  const [message, setMessage] = useState('');
  const [whom, setWhom] = useState('')
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      from: user1,
      to: user2,
      content: "Hi! I'm so excited we matched. I love that we both value authenticity and mindfulness. What drew you to Lone Town?",
      timestamp: new Date(Date.now() - 60000),
      type: 'text'
    },
    {
      id: '2',
      from: user1,
      to: user2,
      content: "Hi Sam! I was getting tired of superficial connections and endless swiping. The idea of one meaningful match per day really resonates with me. What about you?",
      timestamp: new Date(Date.now() - 30000),
      type: 'text'
    },
    {
      id: '3',
      from: user1,
      to: user2,
      content: "Exactly! I believe in quality over quantity. I'd rather have one deep conversation than a hundred shallow ones. Your photography work looks amazing by the way!",
      timestamp: new Date(Date.now() - 15000),
      type: 'text'
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
 
  const progress = (messageCount / 100) * 100;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = () => {
    if (message.trim()) {
      const newMessage: Message = {
        id: Date.now().toString(),
        from: user1,
        to: user2,
        content: message,
        timestamp: new Date(),
        type: 'text'
      };
      // setMessages([...messages, newMessage]);
      socket.emit('send-message', {
        from: newMessage.from,
        to: newMessage.to,
        content: newMessage.content,
        timestamp: newMessage.timestamp,
        type: newMessage.type
      });
      setMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="text-gray-600 hover:text-gray-900">
            ←
          </button>
          <img
            src={users?.user2?.photos[0]}
            alt={users?.user2?.name}
            className="w-10 h-10 rounded-full object-cover"
          />
          <div>
            <h2 className="font-semibold text-gray-900">{users?.user2?.name}</h2>
            <p className="text-sm text-green-600">Online now</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            disabled={messageCount < 100}
            className={`p-2 rounded-full transition-all duration-200 ${messageCount >= 100
              ? 'text-primary-600 hover:bg-primary-50'
              : 'text-gray-300 cursor-not-allowed'
              }`}
          >
            <Video size={20} />
          </button>
          <button
            disabled={messageCount < 100}
            className={`p-2 rounded-full transition-all duration-200 ${messageCount >= 100
              ? 'text-primary-600 hover:bg-primary-50'
              : 'text-gray-300 cursor-not-allowed'
              }`}
          >
            <Phone size={20} />
          </button>
          <button className="p-2 text-gray-600 hover:bg-gray-50 rounded-full">
            <MoreVertical size={20} />
          </button>
        </div>
      </div>
      {/* For whom to send the chat enter here */}
     
      {/* Progress Banner */}
      <div className="bg-gradient-to-r from-primary-50 to-secondary-50 p-3 border-b border-gray-100">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-gray-700">{messageCount}/100 messages</span>
          <span className="text-gray-600">
            {messageCount >= 100 ? '🎉 Video unlocked!' : `${100 - messageCount} more for video`}
          </span>
        </div>
        <div className="w-full bg-white rounded-full h-2">
          <div
            className="bg-gradient-to-r from-primary-500 to-secondary-500 h-2 rounded-full transition-all duration-500"
            style={{ width: `${Math.min(progress, 100)}%` }}
          ></div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => {
          const isOwn = msg.from === user1;
          return (
            <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] p-3 rounded-2xl ${isOwn
                ? 'bg-primary-600 text-white rounded-br-md'
                : 'bg-gray-100 text-gray-900 rounded-bl-md'
                }`}>
                <p className="text-sm leading-relaxed">{msg.content}</p>
                <p className={`text-xs mt-1 ${isOwn ? 'text-primary-100' : 'text-gray-500'
                  }`}>
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-gray-200 p-4 max-[1023px]:mb-20">
        <div className="flex items-end gap-3">
          <div className="flex-1 relative">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Type a thoughtful message..."
              className="w-full p-3 border border-gray-300 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              rows={1}
              style={{ minHeight: '44px', maxHeight: '120px' }}
            />
          </div>
          <button
            onClick={sendMessage}
            disabled={!message.trim()}
            className={`p-3 rounded-full transition-all duration-200 ${message.trim()
              ? 'bg-primary-600 text-white shadow-lg hover:bg-primary-700'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;