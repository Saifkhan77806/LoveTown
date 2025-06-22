
import express from 'express'
import http from 'http'
import cors from 'cors';
import { Server as socketIO } from 'socket.io';
import { connectDB } from './db.js';
import { User } from './models/User.js';
import { getUserByEmail } from './data/user.js';
// import router from './routes/userRoutes.js';

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new socketIO(server, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST']
  }
});

// Connect MongoDB
connectDB()


// In-memory user mapping
const users = new Map();

// Utility to create a consistent room ID
function getRoomId(user1, user2) {
  return [user1, user2].sort().join('-');
}

io.on('connection', (socket) => {

  socket.on('register', (userId) => {
    users.set(userId, socket.id);
    console.log(users)
  });

  socket.on('join-room', ({ from, to }) => {
    const roomId = getRoomId(from, to);
    socket.join(roomId);
    console.log(roomId)
  });

  socket.on('send-message', async ({ id, from, to, content, timestamp, type }) => {
    const roomId = getRoomId(from, to);

    io.to(roomId).emit('receive-message', { id, from, to, content, timestamp, type });
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


app.post('/create-user', async (req, res) => {
  try {
    const isUser = await getUserByEmail(req.body.email);
    if (isUser) return res.status(400).json({ success: false, data: "User already exits" });

    const user = new User(req.body);
    const saved = await user.save();

    return res.status(201).json({ success: true, data: saved });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
});


app.put("/onboard-user", async (req, res) => {
  const { email, age, bio, gender, photos, location, interests, values, personalityType, relationshipGoals, communicationStyle } = req.body;

  try {
    const user = await User.findOneAndUpdate({ email },
      { age, bio, gender, photos, location, interests, values, personalityType, relationshipGoals, communicationStyle },
      { new: true }
    );

    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    res.status(200).json({ success: true, data: user });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }




})




server.listen(5000, () => console.log('Server running on port 5000'));
