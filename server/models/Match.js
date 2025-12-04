// models/Match.ts
import mongoose from "mongoose";

const MatchSchema = new mongoose.Schema(
  {
    user1: { type: String, required: true }, // store email or userId consistently
    user2: { type: String, required: true },
    compatibilityScore: Number,
    matchedAt: { type: Date, default: Date.now },
    isPinned: { type: Boolean, default: false },
    status: {
      type: String,
      enum: [
        "onboarding",
        "available",
        "matched",
        "frozen",
        "chatting",
        "breakup",
      ],
      default: "matched",
    },
  },
  { timestamps: true }
);

// Prevent duplicate or flipped matches: unique on ordered pair
// We'll ensure (min(email1,email2), max(email1,email2)) uniqueness in application
MatchSchema.index({ user1: 1, user2: 1 }, { unique: true });

export const Match = mongoose.model("Match", MatchSchema);
