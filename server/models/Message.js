// models/Message.ts
import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema(
  {
    from: { type: String, required: true },
    to: { type: String, required: true },
    content: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    type: { type: String, enum: ["text", "image", "video"], default: "text" },
  },
  { timestamps: true }
);

export const Message = mongoose.model("Message", MessageSchema);
