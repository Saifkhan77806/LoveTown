// models/User.ts
import mongoose, { mongo } from "mongoose";
import { ref } from "process";

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
    messages: [
      {
        message: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Message",
        },
      },
    ],
  },
  { timestamps: true }
);

export const User = mongoose.model("User", UserSchema);
