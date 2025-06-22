// models/Match.ts
import mongoose from 'mongoose';

const MatchSchema = new mongoose.Schema({
  user1: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  user2: {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    compatibility: { type: Number, required: true }
  },
  compatibilityScore: Number,
  matchedAt: { type: Date, default: Date.now },
  isPinned: { type: Boolean, default: false },
  status: { type: String, enum: ['active', 'inactive', 'ended'], default: 'active' },
  reasonsForMatch: [String]
}, { timestamps: true });

export const Match = mongoose.model('Match', MatchSchema);
