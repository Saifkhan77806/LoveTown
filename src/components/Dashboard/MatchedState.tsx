import React from "react";
import { Heart, MapPin, MessageCircle, Pin, Info } from "lucide-react";
import { Match } from "../../types";
import { Percentage } from "../../../utils/percentage";
import UnpinDialog from "./UnpinDialog";

interface MatchedStateProps {
  match: Match;
  onStartChat: () => void;
  onUnpinMatch: () => void;
}

const MatchedState: React.FC<MatchedStateProps> = ({ match, onStartChat }) => {
  const users = {};

  return (
    <div className="p-6 pt-12">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 bg-primary-100 px-4 py-2 rounded-full mb-4">
          <Heart className="text-primary-600" size={16} />
          <span className="text-primary-700 font-medium">Your Daily Match</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Meet {users?.user2?.name || ""}
        </h1>
        <p className="text-gray-600">
          {Percentage(Number(users?.compatibilityScore || 0), 5)}% compatibility •
          Matched today
        </p>
      </div>

      {/* Photo */}
      <div className="relative mb-6">
        <div className="aspect-[3/4] rounded-2xl overflow-hidden bg-gray-200 shadow-lg">
          <img
            src={""}
            alt={users?.user2?.name || ""}
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
            {users?.user2?.name || ""}, {users?.user2?.age || 0}
          </h2>
          <div className="flex items-center text-gray-600 mb-3">
            <MapPin size={16} className="mr-2" />
            <span>{users?.user2?.location || ""}</span>
          </div> 
          <p className="font-bold">Bio</p>
          <p className="text-gray-700 leading-relaxed">{users?.user2?.bio || ""}</p>
          <p className="font-bold">Mood</p>
          <p className="text-gray-700 leading-relaxed">{users?.user2?.mood || ""}</p>
        </div>

        {/* Interests */}
        <div className="border-t pt-4">
          <h3 className="font-medium text-gray-900 mb-3">Interests</h3>
          <div className="flex flex-wrap gap-2">
            {/* {users?.user2?.interests.map((interest, index) => (
              <span
                key={index}
                className="bg-secondary-100 text-secondary-700 px-3 py-1 rounded-full text-sm"
              >
                {interest}
              </span>
            ))} */}
          </div>
        </div>
      </div>

      {/* Compatibility Insights */}
      <button className="w-full bg-primary-50 border border-primary-200 rounded-xl p-4 mb-6 text-left transition-all duration-200 hover:bg-primary-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Info className="text-primary-600" size={20} />
            <div>
              <h3 className="font-medium text-primary-900">Why you matched</h3>
            </div>
          </div>
          <div className="text-2xl font-bold text-primary-600">
            {Percentage(Number(users?.compatibilityScore || 0), 5)}%
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

        <UnpinDialog />
      </div>
    </div>
  );
};

export default MatchedState;
