import React from 'react';
import { Sparkles, Clock, Heart } from 'lucide-react';

const AvailableState: React.FC = () => {
  return (
    <div className="p-6 pt-12">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 bg-secondary-100 px-4 py-2 rounded-full mb-4">
          <Sparkles className="text-secondary-600" size={16} />
          <span className="text-secondary-700 font-medium">Ready to Connect</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Your next match is coming</h1>
        <p className="text-gray-600">
          We're carefully selecting someone special for you
        </p>
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-2xl p-6 mb-6 shadow-sm">
        <div className="text-center mb-6">
          <div className="w-24 h-24 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Heart className="text-white" size={40} />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Quality over quantity
          </h2>
          <p className="text-gray-600 leading-relaxed">
            We believe in meaningful connections. Your daily match is chosen based on deep compatibility, 
            shared values, and genuine potential for a lasting relationship.
          </p>
        </div>

        {/* Timer */}
        <div className="bg-gradient-to-r from-primary-50 to-secondary-50 rounded-xl p-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Clock className="text-primary-600" size={20} />
            <span className="font-medium text-primary-900">Next match in</span>
          </div>
          <div className="text-2xl font-bold text-primary-600">2h 34m</div>
        </div>
      </div>

      {/* How it Works */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h3 className="font-semibold text-gray-900 mb-4">How Lone Town works</h3>
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-primary-600 text-sm font-bold">1</span>
            </div>
            <div>
              <h4 className="font-medium text-gray-900">One match per day</h4>
              <p className="text-sm text-gray-600">Carefully selected based on deep compatibility</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-primary-600 text-sm font-bold">2</span>
            </div>
            <div>
              <h4 className="font-medium text-gray-900">Exclusive connection</h4>
              <p className="text-sm text-gray-600">Focus on one person at a time for meaningful conversations</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-primary-600 text-sm font-bold">3</span>
            </div>
            <div>
              <h4 className="font-medium text-gray-900">Milestone unlocks</h4>
              <p className="text-sm text-gray-600">Video calls unlock after 100 messages in 48 hours</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AvailableState;