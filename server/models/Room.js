import mongoose from "mongoose";

const roomSchema = new mongoose.Schema({
  participants: [{ type: mongoose.Schema.Types.ObjectId, required: true }],
  lastMessage: { type: String },
  lastMessageTime: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
});

roomSchema.index({ participants: 2 });

export const Room = mongoose.model("Room", roomSchema);
