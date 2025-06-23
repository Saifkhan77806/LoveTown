
import express from 'express'
import http from 'http'
import cors from 'cors';
import { Server as socketIO } from 'socket.io';
import { connectDB } from './db.js';
import { User } from './models/User.js';
import { getUserByEmail } from './data/user.js';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Match } from './models/Match..js';

const app = express();
app.use(cors());
app.use(express.json());

const genAI = new GoogleGenerativeAI("AIzaSyBv1hdbmsSlMR-OjS9hBHvFe7jMDdGPO_Y");
const model = genAI.getGenerativeModel({ model: "embedding-001" });

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
  const { email, age, bio, gender, photos, location, interests, values, personalityType, relationshipGoals, communicationStyle, mood } = req.body;

  try {

    const result = await model.embedContent({
      content: { parts: [{ text: mood }] },
      taskType: "RETRIEVAL_DOCUMENT"
    })

    const embedContent = result.embedding.values;


    const bioResult = await model.embedContent({
      content: { parts: [{ text: mood }] },
      taskType: "RETRIEVAL_DOCUMENT"
    })

    const bioEmbedContent = bioResult.embedding.values;




    const user = await User.findOneAndUpdate({ email },
      { age, bio, gender, photos, location, interests, values, personalityType, relationshipGoals, communicationStyle, mood, moodembedding: embedContent, bioEmbedding: bioEmbedContent },
      { new: true }
    );

    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    res.status(200).json({ success: true, data: user });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
})

const cosineSimilarity = (a, b) => {
  const dot = a.reduce((sum, ai, i) => sum + ai * b[i], 0);
  const magA = Math.sqrt(a.reduce((sum, ai) => sum + ai * ai, 0));
  const magB = Math.sqrt(b.reduce((sum, bi) => sum + bi * bi, 0));
  return dot / (magA * magB);
};

app.get("/match/:email", async (req, res) => {

  const email = req.params.email;

  try {
    const user = await getUserByEmail(email)
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const bioEmbedding = await model.embedContent({
      content: { parts: [{ text: user.bio }] },
      taskType: "RETRIEVAL_QUERY"
    })

    const moodembedding = await model.embedContent({
      content: { parts: [{ text: user.mood }] },
      taskType: "RETRIEVAL_QUERY"
    });

    const oppositeGender = user.gender === 'male' ? 'female' : 'male';
    const candidates = await User.find({ gender: oppositeGender });

    const results = candidates.map(candidate => {
      let score = 0;

      // embedding similarity
      const bioScore = cosineSimilarity(bioEmbedding.embedding.values, candidate.bioEmbedding || []);
      const moodScore = cosineSimilarity(moodembedding.embedding.values, candidate.moodembedding || []);

      score += bioScore * 5 + moodScore * 3;

      return { ...candidate.toObject(), matchScore: score.toFixed(4) };
    }).sort((a, b) => parseFloat(b.matchScore) - parseFloat(a.matchScore)).slice(0, 3);

    return res.status(200).json({ results, user1: user?._id });


  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
})

app.post("/create-appstate", async (req, res) => {

  const { user1, user2, compatibilityScore, isPinned, } = req.body;

  try {
    const Macthed = new Match({ user1, user2, compatibilityScore, isPinned })
    const saved = await Macthed.save();

    return res.status(201).json({ success: true, message: saved });

  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
})








server.listen(5000, () => console.log('Server running on port 5000'));
