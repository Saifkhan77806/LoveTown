import React, { useState } from "react";
import { Heart, Users, MessageCircle, Video } from "lucide-react";
import { AlertDailog } from "../ui/AlertDailog";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";

interface WelcomeStepProps {
  onNext: () => void;
}

const WelcomeStep: React.FC<WelcomeStepProps> = ({ onNext }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { status }: { status: string | null } = useSelector(
    (state: RootState) => state.status
  );

  return (
    <>
      <AlertDailog
        isOpen={isOpen}
        title="Take It Slow"
        description="If you continue, your account will be paused for 24 hours. You won’t be able to chat or match during this time"
        cancelText="Cancel"
        continueText="Continue"
        onCancel={() => setIsOpen(false)}
        onContinue={() => {
          console.log("youe account is temporarliy freezed for 24 hours.");
          setIsOpen(false);
          onNext();
        }}
      />
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
          Experience mindful dating with one carefully chosen match per day. No
          endless swiping, just meaningful connections.
        </p>

        {/* Features */}
        <div className="space-y-4 mb-8">
          <div className="flex items-center gap-3 p-3 bg-primary-50 rounded-xl">
            <Users className="text-primary-600" size={20} />
            <div className="text-left">
              <h3 className="font-medium text-gray-900">One Match Daily</h3>
              <p className="text-sm text-gray-600">
                Quality over quantity, always
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-secondary-50 rounded-xl">
            <MessageCircle className="text-secondary-600" size={20} />
            <div className="text-left">
              <h3 className="font-medium text-gray-900">Deep Conversations</h3>
              <p className="text-sm text-gray-600">
                Focus on one connection at a time
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-accent-50 rounded-xl">
            <Video className="text-accent-600" size={20} />
            <div className="text-left">
              <h3 className="font-medium text-gray-900">Video Unlocks</h3>
              <p className="text-sm text-gray-600">
                100 messages unlocks video calling
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <button
          onClick={() => {
            if (status === "matched" || status === "chatting") setIsOpen(true);
          }}
          className="w-full bg-primary-600 text-white py-4 rounded-xl font-semibold shadow-lg hover:bg-primary-700 transition-all duration-200"
        >
          Let's find your person
        </button>

        <p className="text-xs text-gray-500 mt-4">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </>
  );
};

export default WelcomeStep;
