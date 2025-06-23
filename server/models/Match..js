// models/Match.ts
import mongoose from 'mongoose';

const MatchSchema = new mongoose.Schema({
  user1: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  user2: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  compatibilityScore: Number,
  matchedAt: { type: Date, default: Date.now },
  isPinned: { type: Boolean, default: false },
  status: { type: String, enum: ['onboarding', 'available', 'matched', 'frozen', 'chatting'], default: 'matched' }
}, { timestamps: true });

export const Match = mongoose.model('Match', MatchSchema);
