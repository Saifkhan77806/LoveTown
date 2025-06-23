import React, { useState, useEffect } from 'react';
import { Clock, Heart, Lightbulb } from 'lucide-react';

interface FrozenStateProps {
  freezeEndTime: Date;
  feedback?: string | null;
}

const FrozenState: React.FC<FrozenStateProps> = ({ freezeEndTime, feedback }) => {
  const [timeLeft, setTimeLeft] = useState<string>('');

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date().getTime();3
      const end = freezeEndTime.getTime();
      const difference = end - now;

      if (difference > 0) {
        const hours = Math.floor(difference / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        setTimeLeft(`${hours}h ${minutes}m`);
      } else {
        setTimeLeft('Available now');
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [freezeEndTime]);

  return (
    <div className="p-6 pt-12">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 bg-accent-100 px-4 py-2 rounded-full mb-4">
          <Clock className="text-accent-600" size={16} />
          <span className="text-accent-700 font-medium">Reflection Period</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Taking a mindful pause</h1>
        <p className="text-gray-600">
          Your next match will be available in {timeLeft}
        </p>
      </div>

      {/* Reflection Card */}
      <div className="bg-white rounded-2xl p-6 mb-6 shadow-sm">
        <div className="text-center mb-6">
          <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Heart className="text-primary-600" size={32} />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Reflection is part of the journey
          </h2>
          <p className="text-gray-600 leading-relaxed">
            Sometimes connections don't align, and that's perfectly okay. 
            This pause helps us understand you better and find more compatible matches.
          </p>
        </div>

        {/* Feedback */}
        {feedback && (
          <div className="bg-secondary-50 border border-secondary-200 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <Lightbulb className="text-secondary-600 mt-1" size={20} />
              <div>
                <h3 className="font-medium text-secondary-900 mb-2">Learning from this match</h3>
                <p className="text-secondary-700 text-sm">{feedback}</p>
              </div>
            </div>
          </div>
        )}

        {/* Timer Display */}
        <div className="bg-gray-50 rounded-xl p-6 text-center">
          <div className="text-3xl font-bold text-gray-900 mb-2">{timeLeft}</div>
          <p className="text-gray-600">until your next thoughtful match</p>
        </div>
      </div>

      {/* Reflection Activities */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h3 className="font-semibold text-gray-900 mb-4">While you wait...</h3>
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-3 bg-warm-50 rounded-lg">
            <div className="w-2 h-2 bg-primary-500 rounded-full mt-2"></div>
            <div>
              <h4 className="font-medium text-gray-900">Reflect on your values</h4>
              <p className="text-sm text-gray-600">What matters most to you in a relationship?</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-warm-50 rounded-lg">
            <div className="w-2 h-2 bg-primary-500 rounded-full mt-2"></div>
            <div>
              <h4 className="font-medium text-gray-900">Update your profile</h4>
              <p className="text-sm text-gray-600">Add new photos or refine your bio</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-warm-50 rounded-lg">
            <div className="w-2 h-2 bg-primary-500 rounded-full mt-2"></div>
            <div>
              <h4 className="font-medium text-gray-900">Practice mindfulness</h4>
              <p className="text-sm text-gray-600">Take time for self-care and personal growth</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FrozenState;