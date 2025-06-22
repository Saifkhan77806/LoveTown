// models/Message.ts
import mongoose from 'mongoose';

const MessageSchema = new mongoose.Schema({
  from: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  to: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  type: { type: String, enum: ['text', 'image', 'video'], default: 'text' }
}, { timestamps: true });

export const Message = mongoose.model('Message', MessageSchema);
