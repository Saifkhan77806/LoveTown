import React, { useState } from 'react';
import { Heart, MapPin, MessageCircle, Pin, PinOff, Info } from 'lucide-react';
import { Match } from '../../types';

interface MatchedStateProps {
  match: Match;
  onStartChat: () => void;
  onUnpinMatch: () => void;
}

const MatchedState: React.FC<MatchedStateProps> = ({ match, onStartChat, onUnpinMatch }) => {
  const [showCompatibility, setShowCompatibility] = useState(false);
  const [showUnpinDialog, setShowUnpinDialog] = useState(false);

  return (
    <div className="p-6 pt-12">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 bg-primary-100 px-4 py-2 rounded-full mb-4">
          <Heart className="text-primary-600" size={16} />
          <span className="text-primary-700 font-medium">Your Daily Match</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Meet {match.user.name}</h1>
        <p className="text-gray-600">
          {match.compatibilityScore}% compatibility • Matched today
        </p>
      </div>

      {/* Photo */}
      <div className="relative mb-6">
        <div className="aspect-[3/4] rounded-2xl overflow-hidden bg-gray-200 shadow-lg">
          <img 
            src={match.user.photos[0]} 
            alt={match.user.name}
            className="w-full h-full object-cover"
          />
        </div>
        {match.isPinned && (
          <div className="absolute top-4 right-4 bg-primary-600 text-white p-2 rounded-full shadow-lg">
            <Pin size={16} />
          </div>
        )}
      </div>

      {/* Basic Info */}
      <div className="bg-white rounded-xl p-6 mb-6 shadow-sm">
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {match.user.name}, {match.user.age}
          </h2>
          <div className="flex items-center text-gray-600 mb-3">
            <MapPin size={16} className="mr-2" />
            <span>{match.user.location}</span>
          </div>
          <p className="text-gray-700 leading-relaxed">{match.user.bio}</p>
        </div>

        {/* Interests */}
        <div className="border-t pt-4">
          <h3 className="font-medium text-gray-900 mb-3">Interests</h3>
          <div className="flex flex-wrap gap-2">
            {match.user.interests.map((interest, index) => (
              <span 
                key={index}
                className="bg-secondary-100 text-secondary-700 px-3 py-1 rounded-full text-sm"
              >
                {interest}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Compatibility Insights */}
      <button
        onClick={() => setShowCompatibility(!showCompatibility)}
        className="w-full bg-primary-50 border border-primary-200 rounded-xl p-4 mb-6 text-left transition-all duration-200 hover:bg-primary-100"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Info className="text-primary-600" size={20} />
            <div>
              <h3 className="font-medium text-primary-900">Why you matched</h3>
              <p className="text-sm text-primary-600">See compatibility insights</p>
            </div>
          </div>
          <div className="text-2xl font-bold text-primary-600">
            {match.compatibilityScore}%
          </div>
        </div>
      </button>

      {showCompatibility && (
        <div className="bg-white rounded-xl p-6 mb-6 shadow-sm animate-slide-up">
          <h3 className="font-semibold text-gray-900 mb-4">Compatibility Reasons</h3>
          <div className="space-y-3">
            {match.reasonsForMatch.map((reason, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="w-2 h-2 bg-primary-500 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-gray-700">{reason}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="space-y-4">
        <button
          onClick={onStartChat}
          className="w-full bg-primary-600 text-white py-4 rounded-xl font-semibold shadow-lg hover:bg-primary-700 transition-all duration-200 flex items-center justify-center gap-2"
        >
          <MessageCircle size={20} />
          Start Conversation
        </button>

        <button
          onClick={() => setShowUnpinDialog(true)}
          className="w-full bg-gray-100 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-200 transition-all duration-200 flex items-center justify-center gap-2"
        >
          <PinOff size={18} />
          Not feeling it? Unpin match
        </button>
      </div>

      {/* Unpin Dialog */}
      {showUnpinDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-6 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full animate-slide-up">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Take a moment to reflect</h3>
            <p className="text-gray-600 mb-6">
              Unpinning means taking a 24-hour break to reflect on what you're looking for. 
              {match.user.name} will get a new match in 2 hours.
            </p>
            <div className="space-y-3">
              <button
                onClick={() => {
                  setShowUnpinDialog(false);
                  onUnpinMatch();
                }}
                className="w-full bg-red-500 text-white py-3 rounded-xl font-medium"
              >
                Yes, unpin match
              </button>
              <button
                onClick={() => setShowUnpinDialog(false)}
                className="w-full bg-gray-100 text-gray-700 py-3 rounded-xl font-medium"
              >
                Keep exploring together
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MatchedState;