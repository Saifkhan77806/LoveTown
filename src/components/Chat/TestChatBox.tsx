import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { io } from 'socket.io-client';

// import {socket} from '../../../socket';

export default function TestChat() {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const socket = io('http://localhost:5000');

  const { user1, user2 } = useParams();
  console.log(user1, user2)

  useEffect(() => {
    socket.emit('register', user1);
    socket.emit('join-room', { from: user1, to: user2 });

    const handleMessage = (msg: any) => {
      setMessages((prev) => [...prev, msg]);
    };

    socket.on('receive-message', handleMessage);

    // 👇 CLEANUP must return nothing
    return () => {
      socket.off('receive-message', handleMessage);
    };
  }, [user1, user2]);


  const handleSend = () => {
    if (!input.trim()) return;

    socket.emit('send-message', {
      from: user1,
      to: user2,
      content: input,
      timestamp: Date.now
    });

    setInput('');
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Chat with {user2}</h2>
      <div style={{ border: '1px solid #ccc', height: 300, overflowY: 'auto', padding: 10 }}>
        {messages.map((m, i) => (
          <p key={i} style={{ textAlign: m.from === user1 ? 'right' : 'left' }} className={`${m.from === user1 ? "bg-purple-700" : "bg-gray-300"}`}>
            <b>{m.from}:</b> {m.content}
          </p>
        ))}
      </div>
      <input value={input} className='p-2' placeholder='Enter meesage here' onChange={(e) => setInput(e.target.value)} />
      <button onClick={handleSend}>Send</button>
    </div>
  );
}
