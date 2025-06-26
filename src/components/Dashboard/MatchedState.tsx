import React, { useState } from 'react';
import { Heart, MapPin, MessageCircle, Pin, PinOff, Info } from 'lucide-react';
import { Match } from '../../types';
import { useMatchUser } from '../../store/store';
import {Percentage} from '../../../utils/percentage'

interface MatchedStateProps {
  match: Match;
  onStartChat: () => void;
  onUnpinMatch: () => void;
}

const MatchedState: React.FC<MatchedStateProps> = ({ match, onStartChat, onUnpinMatch }) => {
  const [showUnpinDialog, setShowUnpinDialog] = useState(false);

  const {users} = useMatchUser()

  return (
    <div className="p-6 pt-12">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 bg-primary-100 px-4 py-2 rounded-full mb-4">
          <Heart className="text-primary-600" size={16} />
          <span className="text-primary-700 font-medium">Your Daily Match</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Meet {users?.user2?.name}</h1>
        <p className="text-gray-600">
          {Percentage(Number(users?.compatibilityScore), 5)}% compatibility • Matched today
        </p>
      </div>

      {/* Photo */}
      <div className="relative mb-6">
        <div className="aspect-[3/4] rounded-2xl overflow-hidden bg-gray-200 shadow-lg">
          <img 
            src={users?.user2.photos[0]} 
            alt={users?.user2?.name}
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
            {users?.user2?.name}, {users?.user2?.age}
          </h2>
          <div className="flex items-center text-gray-600 mb-3">
            <MapPin size={16} className="mr-2" />
            <span>{users?.user2?.location}</span>
          </div>
          <p className='font-bold'>Bio</p>
          <p className="text-gray-700 leading-relaxed">{users?.user2?.bio}</p>
          <p className='font-bold'>Mood</p>
          <p className="text-gray-700 leading-relaxed">{users?.user2?.mood}</p>
        </div>

        {/* Interests */}
        <div className="border-t pt-4">
          <h3 className="font-medium text-gray-900 mb-3">Interests</h3>
          <div className="flex flex-wrap gap-2">
            {users?.user2?.interests.map((interest, index) => (
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
        className="w-full bg-primary-50 border border-primary-200 rounded-xl p-4 mb-6 text-left transition-all duration-200 hover:bg-primary-100"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Info className="text-primary-600" size={20} />
            <div>
              <h3 className="font-medium text-primary-900">Why you matched</h3>
            </div>
          </div>
          <div className="text-2xl font-bold text-primary-600">
            {Percentage(Number(users?.compatibilityScore), 5)}%
          </div>
        </div>
      </button>

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
              {Percentage(Number(users?.compatibilityScore), 5)} will get a new match in 2 hours.
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