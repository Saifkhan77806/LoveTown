export interface User {
  id: string;
  name: string;
  age: number;
  bio: string;
  photos: string[];
  location: string;
  interests: string[];
  values: string[];
  personalityType: string;
  relationshipGoals: string;
  communicationStyle: string;
  emotionalIntelligence: number;
  compatibility?: number;
}

export interface Match {
  id: string;
  user: User;
  compatibilityScore: number;
  matchedAt: Date;
  isPinned: boolean;
  status: 'active' | 'unpinned' | 'expired';
  reasonsForMatch: string[];
}

export interface Message {
  id: string;
  senderId: string;
  content: string;
  timestamp: Date;
  type: 'text' | 'voice' | 'system';
}

export interface Conversation {
  id: string;
  matchId: string;
  messages: Message[];
  messageCount: number;
  createdAt: Date;
  lastActivity: Date;
  milestoneReached: boolean;
  videoCallUnlocked: boolean;
}

export type UserState = 'onboarding' | 'available' | 'matched' | 'frozen' | 'chatting';

export interface AppState {
  currentUser: User | null;
  userState: UserState;
  currentMatch: Match | null;
  currentConversation: Conversation | null;
  freezeEndTime: Date | null;
  lastMatchFeedback: string | null;
}

export interface OnboardingData {
  personalInfo: {
    name: string;
    age: number;
    location: string;
    bio: string;
    photos: string[];
  };
  compatibility: {
    values: string[];
    interests: string[];
    personalityType: string;
    relationshipGoals: string;
    communicationStyle: string;
    dealBreakers: string[];
  };
  preferences: {
    ageRange: [number, number];
    maxDistance: number;
    importantTraits: string[];
  };
}