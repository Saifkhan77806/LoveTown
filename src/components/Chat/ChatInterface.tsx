import React, { useState, useRef, useEffect } from 'react';
import { Send, Video, X } from 'lucide-react';
import { Match, Message } from '../../types';
import { io } from 'socket.io-client';
import { useMatchUser } from '../../store/store';

interface ChatInterfaceProps {
  match: Match;
  onBack: () => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ onBack }) => {
  const socket = useRef(io('http://localhost:5000')).current;
  const { users } = useMatchUser();

  const [messageCount, setMessageCount] = useState(3);
  const [isVideo, setIsVideo] = useState(false);
  const [isCaller, setIsCaller] = useState(false);

  const localVideo = useRef<HTMLVideoElement>(null);
  const remoteVideo = useRef<HTMLVideoElement>(null);
  const peerConnection = useRef<RTCPeerConnection | null>(null);
  const localStream = useRef<MediaStream | null>(null);

  const user1 = users?.user1?._id;
  const user2 = users?.user2?._id;

  const getRoomId = (user1: string | undefined, user2: string | undefined) =>
    [user1, user2].sort().join('-');
  const roomId = getRoomId(user1, user2);

  useEffect(() => {
    socket.emit('register', user1);
    socket.emit('join-room', { from: user1, to: user2 });

    let stream : MediaStream
    const setupMediaAndConnection = async () => {
      if(isVideo){
         stream = await navigator.mediaDevices.getUserMedia({ video: isVideo ? true : false, audio: isVideo ? true : false });
        localStream.current = stream;
  
        if (localVideo.current) {
          localVideo.current.srcObject = stream;
        }
      }

      const pc = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
      });

      stream.getTracks().forEach((track) => pc.addTrack(track, stream));

      const remoteStream = new MediaStream();
      pc.ontrack = (event) => {
        remoteStream.addTrack(event.track);
        if (remoteVideo.current) {
          remoteVideo.current.srcObject = remoteStream;
        }
      };

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit('ice-candidate', { roomId, candidate: event.candidate });
        }
      };

      socket.on('call-made', async ({ offer }) => {
        if (!pc.currentRemoteDescription) {
          await pc.setRemoteDescription(new RTCSessionDescription(offer));
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          socket.emit('make-answer', { roomId, answer });
        }
      });

      socket.on('answer-made', async ({ answer }) => {
        if (!pc.currentRemoteDescription) {
          await pc.setRemoteDescription(new RTCSessionDescription(answer));
        }
      });

      socket.on('end-call', () => {
        if (peerConnection.current) {
          peerConnection.current.close();
          peerConnection.current = null;
        }

        if (localStream.current) {
          localStream.current.getTracks().forEach((track) => track.stop());
          localStream.current = null;
        }

        if (localVideo.current) localVideo.current.srcObject = null;
        if (remoteVideo.current) remoteVideo.current.srcObject = null;

        setIsVideo(false); // close modal
      });


      socket.on('ice-candidate', async ({ candidate }) => {
        try {
          await pc.addIceCandidate(candidate);
        } catch (err) {
          console.error('Failed to add ICE candidate', err);
        }
      });

      peerConnection.current = pc;
    };

    setupMediaAndConnection();

    return () => {
      socket.off('call-made');
      socket.off('answer-made');
      socket.off('ice-candidate');
      socket.off('end-call'); // ✅ Cleanup this too
    };

  }, [user1, user2, isVideo]);

  const startCall = async () => {
    setIsCaller(true);
    if (!peerConnection.current) return;
    const offer = await peerConnection.current.createOffer();
    await peerConnection.current.setLocalDescription(offer);
    socket.emit('call-user', { roomId, offer });
  };

  const endCall = () => {
  if (peerConnection.current) {
    peerConnection.current.close();
    peerConnection.current = null;
  }

  if (localStream.current) {
    localStream.current.getTracks().forEach((track) => track.stop());
    localStream.current = null;
  }

  if (localVideo.current) localVideo.current.srcObject = null;
  if (remoteVideo.current) remoteVideo.current.srcObject = null;

  socket.emit('end-call', { roomId }); // 👈 Notify the other peer
  setIsVideo(false); // 👈 Close modal
};


  // Messaging logic (same)
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
      {isVideo && (
        <div className="w-[80%] h-[65%] bg-gray-800 rounded-lg absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 p-3 z-50">
          <div
            className="absolute right-3 top-3 cursor-pointer p-2 hover:bg-white/10 rounded-full text-white"
            onClick={() => setIsVideo(false)}
          >
            <X />
          </div>
          <div className="flex gap-4 items-center justify-center p-4">
            <div className="flex flex-col items-center">
              <video ref={localVideo} autoPlay muted playsInline className="w-64 h-48 bg-black" />
              <p className="text-white mt-1 text-sm">{isCaller ? 'You (Caller)' : 'You (Receiver)'}</p>
            </div>
            <div className="flex flex-col items-center">
              <video ref={remoteVideo} autoPlay playsInline className="w-64 h-48 bg-black" />
              <p className="text-white mt-1 text-sm">{isCaller ? 'Receiver' : 'Caller'}</p>
            </div>
          </div>
          <button onClick={startCall} className="block mx-auto mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
            Start Call
          </button>
          <button
            onClick={endCall}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
          >
            End Call
          </button>
        </div>
      )}

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
          <button
            onClick={() => setIsVideo(true)}
            className={`p-2 rounded-full ${messageCount >= 1 ? 'text-blue-600 hover:bg-blue-50' : 'text-gray-300 cursor-not-allowed'}`}
          >
            <Video size={20} />
          </button>
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
