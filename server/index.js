const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const cors = require('cors');
const socketIO = require('socket.io');

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST']
  }
});

// Connect MongoDB


// In-memory user mapping
const users = new Map();

// Utility to create a consistent room ID
function getRoomId(user1, user2) {
  return [user1, user2].sort().join('-');
}

io.on('connection', (socket) => {
  console.log('Socket connected:', socket.id);

  socket.on('register', (userId) => {
    users.set(userId, socket.id);
    console.log(users)
  });

  socket.on('join-room', ({ from, to }) => {
    const roomId = getRoomId(from, to);
    socket.join(roomId);
    console.log(roomId)
  });

  socket.on('send-message', async ({id, from, to, content, timestamp, type }) => {
    const roomId = getRoomId(from, to);

    io.to(roomId).emit('receive-message', {id, from, to, content, timestamp, type });
  });

  socket.on('disconnect', () => {
    [...users.entries()].forEach(([uid, sid]) => {
      if (sid === socket.id) users.delete(uid);
    });
  });
});

// REST endpoint to fetch chat history
app.post('/get-messages', async (req, res) => {
  const { from, to } = req.body;
  const roomId = getRoomId(from, to);
  
});

server.listen(5000, () => console.log('Server running on port 5000'));
