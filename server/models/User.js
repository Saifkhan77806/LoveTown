// models/User.ts
import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    age: Number,
    bio: String,
    gender: { type: String, enum: ["MALE", "FEMALE"] },
    photos: [String],
    location: String,
    interests: [String],
    values: [String],
    mood: String,
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
      default: "available",
    },
    personalityType: String,
    relationshipGoals: String,
    communicationStyle: String,
    bioEmbedding: [Number],
    moodembedding: [Number],
    matchesCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const User = mongoose.model("User", UserSchema);
