import express from "express";
import http from "http";
import cors from "cors";
import { Server as socketIO } from "socket.io";
import { connectDB } from "./db.js";
import { User } from "./models/User.js";
import { getUserByEmail, getUserByEmailwithoutEmbd } from "./data/user.js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Match } from "./models/Match.js";
import { cancelJob, getAllJobs, scheduleJob } from "./helper/cronManager.js";
import { createMatch } from "./helper/createMatch.js";
import messageRoutes from './routes/matchedroutes.js';
import {
  findMatchByEmail,
  findMatchByEmailOfUser2,
  getFilteredUsersByEmail,
} from "./data/match.js";
import morgan from "morgan";
import dotenv from "dotenv";
import onBoardRoutes from "./routes/onboardRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import matchedRoutes from "./routes/matchedroutes.js";
import { Message } from "./models/Message.js";


const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.AI_KEY);
const model = genAI.getGenerativeModel({ model: "embedding-001" });

const server = http.createServer(app);
const io = new socketIO(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

// Connect MongoDB
connectDB();

// In-memory user mapping
const users = new Map(); // userId -> socketId
const userBySocket = new Map(); // socketId -> userId

// Utility to create a consistent room ID
function getRoomId(user1, user2) {
  return [user1, user2].sort().join("-");
}

io.on("connection", (socket) => {
  
  socket.on("register", (userId) => {
    users.set(userId, socket.id);
    userBySocket.set(socket.id, userId);
    console.log("User registered:", userId, "Socket:", socket.id);
  });

  socket.on("join-room", async ({ from, to }) => {
    const roomId = getRoomId(from, to);
    socket.join(roomId);
    console.log(`User ${from} joined room: ${roomId}`);

    try {
      // Load previous messages from database
      const messages = await Message.find({
        $or: [
          { from, to },
          { from: to, to: from }
        ]
      })
      .sort({ timestamp: 1 })
      .limit(100); // Load last 100 messages

      // Send message history to the joining user
      socket.emit("message-history", messages);

      // Get message count for this conversation
      const messageCount = await Message.countDocuments({
        $or: [
          { from, to },
          { from: to, to: from }
        ]
      });

      socket.emit("message-count", messageCount);

    } catch (error) {
      console.error("Error loading messages:", error);
      socket.emit("error", { message: "Failed to load message history" });
    }

    // Check if the other user is already in the room
    const otherUserSocketId = users.get(to);
    const isOtherUserOnline =
      otherUserSocketId &&
      io.sockets.sockets.get(otherUserSocketId)?.rooms.has(roomId);

    // Notify the joining user about the other user's status
    socket.emit("getonline", isOtherUserOnline || false);

    // Notify the other user that this user is now online
    socket.to(roomId).emit("getonline", true);
  });

  socket.on("isonline", ({ from, to, online }) => {
    const roomId = getRoomId(from, to);
    socket.to(roomId).emit("getonline", online);
  });

  socket.on("send-message", async ({ id, from, to, content, timestamp, type }) => {
    const roomId = getRoomId(from, to);

    try {
      // Save message to database
      const newMessage = new Message({
        from,
        to,
        content,
        timestamp: timestamp || new Date(),
        type: type || "text"
      });

      const savedMessage = await newMessage.save();

      // Update both users' message references
      await User.findOneAndUpdate(
        { email: from },
        { 
          $push: { messages: { message: savedMessage._id } },
        }
      );

      await User.findOneAndUpdate(
        { email: to },
        { 
          $push: { messages: { message: savedMessage._id } }
        }
      );

      // Get updated message count
      const messageCount = await Message.countDocuments({
        $or: [
          { from, to },
          { from: to, to: from }
        ]
      });

      // Emit the message to all users in the room with the database ID
      io.to(roomId).emit("receive-message", {
        id: savedMessage._id.toString(),
        from: savedMessage.from,
        to: savedMessage.to,
        content: savedMessage.content,
        timestamp: savedMessage.timestamp,
        type: savedMessage.type
      });

      // Emit updated message count
      io.to(roomId).emit("message-count", messageCount);

    } catch (error) {
      console.error("Error saving message:", error);
      socket.emit("error", { message: "Failed to send message" });
    }
  });

  socket.on("call-user", ({ roomId, offer, isIncomingCall }) => {
    socket
      .to(roomId)
      .emit("call-made", { offer, from: socket.id, isIncomingCall });
  });

  socket.on("calling", ({ offeringCall, roomId }) => {
    socket.to(roomId).emit("inComingCall", { offeringCall });
  });

  socket.on("end-call", ({ roomId }) => {
    socket.to(roomId).emit("end-call");
  });

  socket.on("make-answer", ({ roomId, answer }) => {
    socket.to(roomId).emit("answer-made", { answer, from: socket.id });
  });

  socket.on("ice-candidate", ({ roomId, candidate }) => {
    socket.to(roomId).emit("ice-candidate", { candidate, from: socket.id });
  });

  socket.on("disconnect", () => {
    const userId = userBySocket.get(socket.id);
    // console.log("User disconnected:", userId, "Socket:", socket.id);
``
    if (userId) {
      // Notify all rooms that this user was in that they're now offline
      socket.rooms.forEach((roomId) => {
        if (roomId !== socket.id) {
          console.log(`User ${userId} left room ${roomId}`);
          socket.to(roomId).emit("getonline", false);
        }
      });

      userBySocket.delete(socket.id);
      users.delete(userId);
    }
  });
});

// create users

app.post("/create-user", async (req, res) => {
  try {
    const isUser = await getUserByEmail(req.body.email);

    if (isUser.success)
      return res
        .status(400)
        .json({ success: false, data: "User already exits" });

    const user = new User({ ...req.body, status: "available" });
    const saved = await user.save();

    return res.status(201).json({ success: true, data: saved });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
});

app.use("/api", onBoardRoutes);
app.use("/user", userRoutes);
app.use("/matched", matchedRoutes);

// app.put("/onboard-user", async (req, res) => {
//   const {
//     email,
//     age,
//     bio,
//     gender,
//     photos,
//     location,
//     interests,
//     values,
//     personalityType,
//     relationshipGoals,
//     communicationStyle,
//     mood,
//   } = req.body;

//   try {
//     // const result = await model.embedContent({
//     //   content: { parts: [{ text: mood }] },
//     //   taskType: "RETRIEVAL_DOCUMENT",
//     // });

//     // const embedContent = result.embedding.values;

//     // const bioResult = await model.embedContent({
//     //   content: { parts: [{ text: mood }] },
//     //   taskType: "RETRIEVAL_DOCUMENT",
//     // });

//     // const bioEmbedContent = bioResult.embedding.values;

//     const user = await User.findOneAndUpdate(
//       { email },
//       {
//         age,
//         bio,
//         gender,
//         photos,
//         location,
//         interests,
//         values,
//         personalityType,
//         relationshipGoals,
//         communicationStyle,
//         mood,
//         moodembedding: [1, 2, 5, 2, 3],
//         bioEmbedding: [2, 5, 4, 6, 3, 5, 56, 6, 5],
//       },
//       { new: true }
//     );

//     if (!user)
//       return res
//         .status(404)
//         .json({ success: false, message: "User not found" });

//     res.status(200).json({ success: true, data: user });
//   } catch (err) {
//     return res.status(400).json({ success: false, message: err.message });
//   }
// });

const cosineSimilarity = (a, b) => {
  const dot = a.reduce((sum, ai, i) => sum + ai * b[i], 0);
  const magA = Math.sqrt(a.reduce((sum, ai) => sum + ai * ai, 0));
  const magB = Math.sqrt(b.reduce((sum, bi) => sum + bi * bi, 0));
  return dot / (magA * magB);
};

app.use('/api/messages', messageRoutes);

app.post("/create-appstate", async (req, res) => {
  const { user1, user2, compatibilityScore, isPinned } = req.body;

  try {
    const Macthed = new Match({ user1, user2, compatibilityScore, isPinned });
    const saved = await Macthed.save();

    return res.status(201).json({ success: true, message: saved });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
});

app.post("/api/schedule", (req, res) => {
  const { jobId, data } = req.body;

  const date = new Date(Date.now() + 1 * 60 * 1000); // 2 hours later

  scheduleJob(jobId, date, async () => {
    console.log("data");
    const result = await createMatch(data);
    // Add DB cleanup or email, etc.
  });

  res.json({ success: true, message: "Cron job scheduled" });
});

app.post("/api/cancel", (req, res) => {
  const { jobId } = req.body;
  const success = cancelJob(jobId);

  if (success) {
    res.json({ success: true, message: "Job cancelled" });
  } else {
    res.status(404).json({ success: false, message: "Job not found" });
  }
});

app.get("/api/jobs", (req, res) => {
  const jobs = getAllJobs();
  res.json({ success: true, jobs });
});

// app.get("/test", async (req, res) => {
// const users = await getFilteredUsersByEmail("saifkhan042358@gmail.com");

// res.status(200).json({ users });
// });

app.get("/match-user/:email", async (req, res) => {
  const email = req.params.email;
  let user1;
  let user2;
  let matchUserdata;

  if (!email)
    return res.status(404).json({ success: false, message: "Email not found" });

  try {
    const isMatched = await findMatchByEmailOfUser2(email);

    if (isMatched) {
      user2 = await getUserByEmailwithoutEmbd(isMatched?.user2);
      user1 = await getUserByEmailwithoutEmbd(isMatched?.user1);

      return res.status(200).json({
        success: true,
        user1,
        user2,
        status: isMatched?.status,
        compatibilityScore: isMatched?.compatibilityScore,
        matchedAt: isMatched?.matchedAt,
      });
    } else {
      matchUserdata = await findMatchByEmail(email);

      if (!matchUserdata)
        return res
          .status(404)
          .json({ success: false, message: "No match found" });
      user2 = await getUserByEmailwithoutEmbd(matchUserdata.user2);
      user1 = await getUserByEmailwithoutEmbd(matchUserdata?.user1);
      return res.status(200).json({
        success: true,
        user1,
        user2,
        status: matchUserdata?.status,
        compatibilityScore: matchUserdata?.compatibilityScore,
        matchedAt: matchUserdata?.matchedAt,
      });
    }
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
});

app.get("/get-user-status/:email", async (req, res) => {
  const email = req.params.email;

  try {
    const user = await getUserByEmailwithoutEmbd(email);
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    return res.status(200).json({ success: true, data: user.status });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
});

app.post("/update-match-status-chatting/:data", async (req, res) => {
  const data = req.params.data;

  try {
    const matchData = await Match.findOneAndUpdate(
      { user1: data },
      { status: "chatting" },
      { new: true }
    );

    if (!matchData)
      return res
        .status(404)
        .json({ success: false, message: "Match not found" });

    return res.status(200).json({
      success: true,
      data: matchData,
      message: "Match status updated to chatting",
    });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
});

server.listen(5000, () => console.log("Server running on port 5000"));
