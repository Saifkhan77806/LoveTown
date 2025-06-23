// models/User.ts
import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  age: Number,
  bio: String,
  gender: { type: String, enum: ['MALE', 'FEMALE']},
  photos: [String],
  location: String,
  interests: [String],
  values: [String],
  mood: String,
  personalityType: String,
  relationshipGoals: String,
  communicationStyle: String,
  bioEmbedding: [Number],
  moodembedding: [Number]
}, { timestamps: true });

export const User = mongoose.model('User', UserSchema);
