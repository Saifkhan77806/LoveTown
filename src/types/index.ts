

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
  content: string;
  timestamp: Date;
  from: string | undefined;
  to: string | undefined;
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
  freezeEndTime?: Date | null;
}

export interface OnboardingData {
  personalInfo: {
    name: string;
    email: string;
    gender: 'male' | 'female';
    age: number;
    location: string;
    bio: string;
    mood: string;
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


export interface User {
    user1: user1;
    user2: user1;
    status: string;
    compatibilityScore: number;
    matchedAt: string;
}

export interface user1 {
    _id: string;
    name: string;
    email: string;
    photos: string[];
    interests: string[];
    values: string[];
    createdAt: string;
    updatedAt: string;
    age: number;
    bio: string;
    communicationStyle: string;
    location: string;
    personalityType: string;
    relationshipGoals: string;
    gender: Gender;
    mood: string;
    status: string
}

enum Gender {
    male,
    female,
}

export interface UserContextType {
    users: User | null;
    loading: boolean;
}
