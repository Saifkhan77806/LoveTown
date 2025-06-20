import React from 'react';
import { MessageCircle, Video, Clock } from 'lucide-react';
import { Match } from '../../types';
import { useNavigate } from 'react-router-dom';

interface ChattingStateProps {
  match: Match;
}

const ChattingState: React.FC<ChattingStateProps> = ({ match }) => {
  const navigate = useNavigate();
  const messageCount = 80; // Mock data
  const hoursLeft = 38; // Mock data
  const progress = (messageCount / 100) * 100;

  return (
    <div className="p-6 pt-12">
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Chatting with {match.user.name}
        </h1>
        <p className="text-gray-600">Building a meaningful connection</p>
      </div>

      {/* Progress Card */}
      <div className="bg-white rounded-2xl p-6 mb-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">Video Call Progress</h3>
          <div className="flex items-center gap-1 text-sm text-gray-600">
            <Clock size={14} />
            <span>{hoursLeft}h left</span>
          </div>
        </div>
        
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>{messageCount} messages</span>
            <span>100 messages needed</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-primary-500 to-secondary-500 h-3 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(progress, 100)}%` }}
            ></div>
          </div>
        </div>

        <div className="bg-primary-50 border border-primary-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <Video className="text-primary-600" size={20} />
            <div>
              <h4 className="font-medium text-primary-900">
                {messageCount >= 100 ? 'Video call unlocked!' : `${100 - messageCount} more messages to unlock video`}
              </h4>
              <p className="text-sm text-primary-600">
                {messageCount >= 100 
                  ? 'You can now have face-to-face conversations' 
                  : 'Deep conversations unlock deeper connections'
                }
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <button className="bg-primary-600 text-white p-4 rounded-xl font-medium shadow-lg hover:bg-primary-700 transition-all duration-200 flex items-center justify-center gap-2" onClick={() => navigate("/chat")}>
          <MessageCircle size={18} />
          Open Chat
        </button>
        <button 
          disabled={messageCount < 100}
          className={`p-4 rounded-xl font-medium shadow-lg transition-all duration-200 flex items-center justify-center gap-2 ${
            messageCount >= 100 
              ? 'bg-secondary-600 text-white hover:bg-secondary-700' 
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
        >
          <Video size={18} />
          Video Call
        </button>
      </div>

      {/* Connection Tips */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h3 className="font-semibold text-gray-900 mb-4">Building deeper connections</h3>
        <div className="space-y-3">
          <div className="flex items-start gap-3 p-3 bg-warm-50 rounded-lg">
            <div className="w-2 h-2 bg-accent-500 rounded-full mt-2"></div>
            <div>
              <h4 className="font-medium text-gray-900">Ask meaningful questions</h4>
              <p className="text-sm text-gray-600">Go beyond small talk - explore values, dreams, and experiences</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-warm-50 rounded-lg">
            <div className="w-2 h-2 bg-accent-500 rounded-full mt-2"></div>
            <div>
              <h4 className="font-medium text-gray-900">Share authentically</h4>
              <p className="text-sm text-gray-600">Be vulnerable and genuine - it encourages the same in return</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-warm-50 rounded-lg">
            <div className="w-2 h-2 bg-accent-500 rounded-full mt-2"></div>
            <div>
              <h4 className="font-medium text-gray-900">Listen actively</h4>
              <p className="text-sm text-gray-600">Show genuine interest in their responses and follow up thoughtfully</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChattingState;