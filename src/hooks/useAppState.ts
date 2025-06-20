import { useState } from 'react';
import { AppState, UserState, Match, User, Conversation } from '../types';

// Mock data for demonstration
const mockUser: User = {
  id: '1',
  name: 'Alex',
  age: 28,
  bio: 'Passionate about mindful living and deep connections',
  photos: ['https://images.pexels.com/photos/1239288/pexels-photo-1239288.jpeg'],
  location: 'San Francisco, CA',
  interests: ['Meditation', 'Hiking', 'Photography', 'Cooking'],
  values: ['Authenticity', 'Growth', 'Compassion', 'Adventure'],
  personalityType: 'INFP',
  relationshipGoals: 'Long-term partnership',
  communicationStyle: 'Direct and empathetic',
  emotionalIntelligence: 85,
};

const mockMatch: Match = {
  id: '1',
  user: {
    id: '2',
    name: 'Sam',
    age: 26,
    bio: 'Artist and dreamer seeking genuine connection in a world of superficial swipes',
    photos: ['https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg'],
    location: 'San Francisco, CA',
    interests: ['Art', 'Yoga', 'Travel', 'Reading'],
    values: ['Creativity', 'Mindfulness', 'Authenticity', 'Growth'],
    personalityType: 'ENFP',
    relationshipGoals: 'Meaningful connection',
    communicationStyle: 'Warm and intuitive',
    emotionalIntelligence: 90,
    compatibility: 94,
  },
  compatibilityScore: 94,
  matchedAt: new Date(),
  isPinned: true,
  status: 'active',
  reasonsForMatch: [
    'Shared values of authenticity and growth',
    'Complementary personality types (INFP/ENFP)',
    'Similar interests in mindfulness and creativity',
    'Both seeking meaningful connections',
    'High emotional intelligence scores'
  ]
};

export const useAppState = () => {
  const [appState, setAppState] = useState<AppState>({
    currentUser: mockUser,
    userState: 'matched',
    currentMatch: mockMatch,
    currentConversation: null,
    freezeEndTime: null,
    lastMatchFeedback: null,
  });

  const updateUserState = (newState: UserState) => {
    setAppState(prev => ({ ...prev, userState: newState }));
  };

  const setMatch = (match: Match | null) => {
    setAppState(prev => ({ ...prev, currentMatch: match }));
  };

  const unpinMatch = () => {
    if (appState.currentMatch) {
      const freezeEndTime = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now
      setAppState(prev => ({
        ...prev,
        currentMatch: null,
        userState: 'frozen',
        freezeEndTime,
        lastMatchFeedback: `We noticed you weren't quite aligned with . Here's what we learned: Different communication styles and life goals. We're updating your preferences for better matches.`
      }));
    }
  };

  const startConversation = (conversation: Conversation) => {
    setAppState(prev => ({
      ...prev,
      currentConversation: conversation,
      userState: 'chatting'
    }));
  };

  return {
    appState,
    updateUserState,
    setMatch,
    unpinMatch,
    startConversation,
  };
};