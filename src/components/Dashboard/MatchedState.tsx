import React, { useEffect } from "react";
import { Heart, MapPin, MessageCircle, Pin, Info } from "lucide-react";
import { Match } from "../../types";
import UnpinDialog from "./UnpinDialog";
import { useUser } from "@clerk/clerk-react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { AppDispatch } from "../../store/store";
import { fetchMatchedUserasync } from "../../slice/matchedSlice";

interface MatchedStateProps {
  match: Match;
  onStartChat: () => void;
  onUnpinMatch: () => void;
}

const MatchedState: React.FC<MatchedStateProps> = ({ match, onStartChat }) => {
  const {
    matchedUser: users,
    error,
    loading,
  } = useSelector((state: RootState) => state.matched);
  const dispatch = useDispatch<AppDispatch>();

  const { user } = useUser();

  const email = user?.emailAddresses[0].emailAddress;

  useEffect(() => {
     dispatch(fetchMatchedUserasync(email as string));
  }, [email]);

  return (
    <div className="p-6 pt-12">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 bg-primary-100 px-4 py-2 rounded-full mb-4">
          <Heart className="text-primary-600" size={16} />
          <span className="text-primary-700 font-medium">Your Daily Match</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Meet {users?.name || ""}
        </h1>
        <p className="text-gray-600">
          {users?.compatibilityScore}% compatibility • Matched today
        </p>
      </div>

      {/* Photo */}
      <div className="relative mb-6">
        <div className="size-96 mx-auto rounded-2xl overflow-hidden bg-gray-200 shadow-lg relative">
          <img
            src={
              users?.photos ||
              "https://th.bing.com/th/id/OIP.hUQ0Z2p1_c0qBwjINDYKTQHaEo?w=243&h=180&c=7&r=0&o=7&cb=ucfimg2&dpr=1.3&pid=1.7&rm=3&ucfimg=1"
            }
            alt={users?.name || ""}
            className="w-full h-full object-cover"
          />
          {match.isPinned && (
            <div className="absolute top-4 right-4 bg-primary-600 text-white p-2 rounded-full shadow-lg">
              <Pin size={16} />
            </div>
          )}
        </div>
      </div>

      {/* Basic Info */}
      <div className="bg-white rounded-xl p-6 mb-6 shadow-sm">
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {users?.name || ""}, {users?.age || 0}
          </h2>
          <div className="flex items-center text-gray-600 mb-3">
            <MapPin size={16} className="mr-2" />
            <span>{users?.location || ""}</span>
          </div>
          <p className="font-bold">Bio</p>
          <p className="text-gray-700 leading-relaxed">{users?.bio || ""}</p>
          <p className="font-bold">Mood</p>
          <p className="text-gray-700 leading-relaxed">{users?.mood || ""}</p>
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
            {users?.compatibilityScore}%
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
