// models/AppState.ts
import mongoose from 'mongoose';

const AppStateSchema = new mongoose.Schema({
  currentUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userState: { type: String, enum: ['matched', 'idle', 'waiting'], required: true },
  currentMatch: { type: mongoose.Schema.Types.ObjectId, ref: 'Match' },
  currentConversation: { type: mongoose.Schema.Types.ObjectId, ref: 'Message', default: null },
  freezeEndTime: { type: Date, default: null },
  lastMatchFeedback: { type: String, default: null }
}, { timestamps: true });

export const AppState = mongoose.model('AppState', AppStateSchema);
