
import express from 'express'
import http from 'http'
import cors from 'cors';
import { Server as socketIO } from 'socket.io';
import { connectDB } from './db.js';
import { User } from './models/User.js';
import { getUserByEmail, getUserByEmailwithoutEmbd } from './data/user.js';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Match } from './models/Match..js';
import { cancelJob, getAllJobs, scheduleJob } from './helper/cronManager.js';
import { createMatch } from './helper/createMatch.js';
import { findMatchByEmail, findMatchByEmailOfUser2 } from './data/match.js';

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
  });

  socket.on('join-room', ({ from, to }) => {
    const roomId = getRoomId(from, to);
    socket.join(roomId);
  });

  socket.on('send-message', async ({ id, from, to, content, timestamp, type }) => {
    const roomId = getRoomId(from, to);

    io.to(roomId).emit('receive-message', { id, from, to, content, timestamp, type });
  });

  socket.on('call-user', ({ roomId, offer, isIncomingCall }) => {
    socket.to(roomId).emit('call-made', { offer, from: socket.id, isIncomingCall });
  });

  socket.on('calling', ({offeringCall})=>{
    socket.to(roomId).emit('inComingCall', {offeringCall})
  })

  // Server-side
  socket.on('end-call', ({ roomId }) => {
    socket.to(roomId).emit('end-call');
  });


  socket.on('make-answer', ({ roomId, answer }) => {
    socket.to(roomId).emit('answer-made', { answer, from: socket.id });
  });

  socket.on('ice-candidate', ({ roomId, candidate }) => {
    socket.to(roomId).emit('ice-candidate', { candidate, from: socket.id });
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

    const isMatched = await findMatchByEmailOfUser2(email)

    if (isMatched) return res.status(200).json({ success: false, message: "Matched is already exists" });

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
    const candidates = await User.find({ gender: oppositeGender, status: "available" });

    if (!candidates) return res.status(404).json({ success: false, message: "No candidates found" });

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


app.post('/api/schedule', (req, res) => {
  const { jobId, data } = req.body;

  const date = new Date(Date.now() + 1 * 60 * 1000); // 2 hours later

  scheduleJob(jobId, date, async () => {
    console.log("data")
    const result = await createMatch(data)
    // Add DB cleanup or email, etc.
  });

  res.json({ success: true, message: 'Cron job scheduled' });
});

app.post('/api/cancel', (req, res) => {
  const { jobId } = req.body;
  const success = cancelJob(jobId);

  if (success) {
    res.json({ success: true, message: 'Job cancelled' });
  } else {
    res.status(404).json({ success: false, message: 'Job not found' });
  }
});

app.get('/api/jobs', (req, res) => {
  const jobs = getAllJobs();
  res.json({ success: true, jobs });
});

app.get('/match-user/:email', async (req, res) => {
  const email = req.params.email;
  let user1;
  let user2;
  let matchUserdata;

  if (!email) return res.status(404).json({ success: false, message: 'Email not found' });

  try {

    const isMatched = await findMatchByEmailOfUser2(email);


    if (isMatched) {
      user2 = await getUserByEmailwithoutEmbd(isMatched?.user2);
      user1 = await getUserByEmailwithoutEmbd(isMatched?.user1);

      return res.status(200).json({ success: true, user1, user2, status: isMatched?.status, compatibilityScore: isMatched?.compatibilityScore, matchedAt: isMatched?.matchedAt })


    } else {
      matchUserdata = await findMatchByEmail(email);

      if (!matchUserdata) return res.status(404).json({ success: false, message: 'No match found' });
      user2 = await getUserByEmailwithoutEmbd(matchUserdata.user2);
      user1 = await getUserByEmailwithoutEmbd(matchUserdata?.user1);
      return res.status(200).json({ success: true, user1, user2, status: matchUserdata?.status, compatibilityScore: matchUserdata?.compatibilityScore, matchedAt: matchUserdata?.matchedAt })
    }

  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
})

app.get("/get-user-status/:email", async (req, res) => {
  const email = req.params.email;

  try {
    const user = await getUserByEmailwithoutEmbd(email);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    console.log("status", user.status);

    return res.status(200).json({ success: true, data: user.status });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
})


app.post("/update-match-status-chatting/:data", async (req, res) => {
  const  data  = req.params.data;

  try{

    const matchData = await Match.findOneAndUpdate(
      { user1: data },
      { status: "chatting" },
      { new: true }
    );

    if (!matchData) return res.status(404).json({ success: false, message: "Match not found" });


    return res.status(200).json({ success: true, data: matchData, message: "Match status updated to chatting" });

  }catch(err){
    return res.status(400).json({ success: false, message: err.message });
  }
})










server.listen(5000, () => console.log('Server running on port 5000'));
