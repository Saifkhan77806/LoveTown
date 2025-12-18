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
import messageRoutes from "./routes/matchedroutes.js";
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
import { clerkMiddleware, requireAuth } from "@clerk/express";

const app = express();
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());
app.use(morgan("dev"));
app.use(clerkMiddleware());

dotenv.config();

import { verifyToken } from "@clerk/clerk-sdk-node";

const genAI = new GoogleGenerativeAI(process.env.AI_KEY);
const model = genAI.getGenerativeModel({ model: "embedding-001" });

const server = http.createServer(app);
const io = new socketIO(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
  transports: ["websocket", "polling"],
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
  // console.log("New socket connection:", socket.id);

  socket.on("register", (userId) => {
    // Remove old socket mapping if exists
    const oldSocketId = users.get(userId);
    if (oldSocketId && oldSocketId !== socket.id) {
      userBySocket.delete(oldSocketId);
      // console.log("Removed old socket mapping for user:", userId);
    }

    // Set new mapping
    users.set(userId, socket.id);
    userBySocket.set(socket.id, userId);
    // console.log("User registered:", userId, "Socket:", socket.id);

    // Notify all rooms this user was previously in about their online status
    // This handles the case where they reconnected
    socket.rooms.forEach((roomId) => {
      if (roomId !== socket.id) {
        socket.to(roomId).emit("getonline", true);
      }
    });
  });

  socket.on("join-room", async ({ from, to }) => {
    const roomId = getRoomId(from, to);
    socket.join(roomId);
    // console.log(`User ${from} joined room: ${roomId}`);

    try {
      // Load previous messages from database
      const messages = await Message.find({
        $or: [
          { from, to },
          { from: to, to: from },
        ],
      })
        .sort({ timestamp: 1 })
        .limit(100);

      socket.emit("message-history", messages);

      const messageCount = await Message.countDocuments({
        $or: [
          { from, to },
          { from: to, to: from },
        ],
      });

      socket.emit("message-count", messageCount);
    } catch (error) {
      console.error("Error loading messages:", error);
      socket.emit("error", { message: "Failed to load message history" });
    }

    // Check if the other user is online (has an active socket)
    const otherUserSocketId = users.get(to);
    const isOtherUserOnline =
      otherUserSocketId && io.sockets.sockets.has(otherUserSocketId);

    // console.log(`Checking online status for ${to}: ${isOtherUserOnline}`);

    // Notify the joining user about the other user's status
    socket.emit("getonline", isOtherUserOnline || false);

    // Notify the other user that this user is now online (if they're in the room)
    if (isOtherUserOnline) {
      const otherSocket = io.sockets.sockets.get(otherUserSocketId);
      if (otherSocket && otherSocket.rooms.has(roomId)) {
        socket.to(roomId).emit("getonline", true);
      }
    }
  });

  socket.on("isonline", ({ from, to, online }) => {
    const roomId = getRoomId(from, to);
    socket.to(roomId).emit("getonline", online);
  });

  socket.on(
    "send-message",
    async ({ id, from, to, content, timestamp, type }) => {
      const roomId = getRoomId(from, to);

      try {
        const newMessage = new Message({
          from,
          to,
          content,
          timestamp: timestamp || new Date(),
          type: type || "text",
        });

        const savedMessage = await newMessage.save();

        await User.findOneAndUpdate(
          { email: from },
          {
            $push: { messages: { message: savedMessage._id } },
          }
        );

        await User.findOneAndUpdate(
          { email: to },
          {
            $push: { messages: { message: savedMessage._id } },
          }
        );

        const messageCount = await Message.countDocuments({
          $or: [
            { from, to },
            { from: to, to: from },
          ],
        });

        io.to(roomId).emit("receive-message", {
          id: savedMessage._id.toString(),
          from: savedMessage.from,
          to: savedMessage.to,
          content: savedMessage.content,
          timestamp: savedMessage.timestamp,
          type: savedMessage.type,
        });

        io.to(roomId).emit("message-count", messageCount);
      } catch (error) {
        console.error("Error saving message:", error);
        socket.emit("error", { message: "Failed to send message" });
      }
    }
  );

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

    if (userId) {
      // console.log("User disconnected:", userId, "Socket:", socket.id);

      // Only delete if this is still the current socket for this user
      if (users.get(userId) === socket.id) {
        users.delete(userId);
      }
      userBySocket.delete(socket.id);

      // Notify all rooms that this user was in that they're now offline
      socket.rooms.forEach((roomId) => {
        if (roomId !== socket.id) {
          console.log(`User ${userId} left room ${roomId}`);
          socket.to(roomId).emit("getonline", false);
        }
      });
    }
  });
});

// create users

app.post("/create-user", requireAuth, async (req, res) => {
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

app.use("/api", requireAuth, onBoardRoutes);
app.use("/user", requireAuth, userRoutes);
app.use("/matched", requireAuth, matchedRoutes);

const cosineSimilarity = (a, b) => {
  const dot = a.reduce((sum, ai, i) => sum + ai * b[i], 0);
  const magA = Math.sqrt(a.reduce((sum, ai) => sum + ai * ai, 0));
  const magB = Math.sqrt(b.reduce((sum, bi) => sum + bi * bi, 0));
  return dot / (magA * magB);
};

app.use("/api/messages", messageRoutes);

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

app.get("/", (req, res) => {
  return res.json({
    message: "this is me!",
  });
});

app.get("/test", async (req, res) => {
  console.log(req.auth);

  try {
    // Check if auth exists
    if (!req.auth || !req.auth.userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized - No valid session",
      });
    }

    res.json({
      clerkUserId: req.auth.userId,
      success: true,
      message: "user is authenticated",
    });
  } catch (error) {
    console.error("Auth error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

server.listen(5000, "0.0.0.0", () =>
  console.log("Server running on port 5000")
);
