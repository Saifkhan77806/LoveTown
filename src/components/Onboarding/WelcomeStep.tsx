import React from 'react';
import { Heart, Users, MessageCircle, Video } from 'lucide-react';

interface WelcomeStepProps {
  onNext: () => void;
}

const WelcomeStep: React.FC<WelcomeStepProps> = ({ onNext }) => {
  return (
    <div className="p-8 text-center">
      {/* Logo */}
      <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center mx-auto mb-6">
        <Heart className="text-white" size={32} />
      </div>

      {/* Title */}
      <h1 className="text-3xl font-bold text-gray-900 mb-4">
        Welcome to Lone Town
      </h1>
      <p className="text-gray-600 mb-8 leading-relaxed">
        Experience mindful dating with one carefully chosen match per day. 
        No endless swiping, just meaningful connections.
      </p>

      {/* Features */}
      <div className="space-y-4 mb-8">
        <div className="flex items-center gap-3 p-3 bg-primary-50 rounded-xl">
          <Users className="text-primary-600" size={20} />
          <div className="text-left">
            <h3 className="font-medium text-gray-900">One Match Daily</h3>
            <p className="text-sm text-gray-600">Quality over quantity, always</p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-3 bg-secondary-50 rounded-xl">
          <MessageCircle className="text-secondary-600" size={20} />
          <div className="text-left">
            <h3 className="font-medium text-gray-900">Deep Conversations</h3>
            <p className="text-sm text-gray-600">Focus on one connection at a time</p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-3 bg-accent-50 rounded-xl">
          <Video className="text-accent-600" size={20} />
          <div className="text-left">
            <h3 className="font-medium text-gray-900">Video Unlocks</h3>
            <p className="text-sm text-gray-600">100 messages unlocks video calling</p>
          </div>
        </div>
      </div>

      {/* CTA */}
      <button
        onClick={onNext}
        className="w-full bg-primary-600 text-white py-4 rounded-xl font-semibold shadow-lg hover:bg-primary-700 transition-all duration-200"
      >
        Let's find your person
      </button>

      <p className="text-xs text-gray-500 mt-4">
        By continuing, you agree to our Terms of Service and Privacy Policy
      </p>
    </div>
  );
};

export default WelcomeStep;