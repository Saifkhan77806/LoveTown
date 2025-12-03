import React, { useState } from "react";
import PersonalInfoStep from "./PersonalInfoStep";
import CompatibilityStep from "./CompatibilityStep";
import PreferencesStep from "./PreferencesStep";
import WelcomeStep from "./WelcomeStep";
import { OnboardingData } from "../../types";

interface OnboardingProps {
  onComplete: (data: OnboardingData) => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [data, setData] = useState<Partial<OnboardingData>>({});

  const steps = [
    { component: WelcomeStep, title: "Welcome to Lone Town" },
    { component: PersonalInfoStep, title: "Tell us about yourself" },
    { component: CompatibilityStep, title: "Compatibility Assessment" },
    { component: PreferencesStep, title: "Your Preferences" },
  ];

  const updateData = (stepData: any) => {
    setData((prev) => ({ ...prev, ...stepData }));
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete(data as OnboardingData);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const StepComponent = steps[currentStep].component;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-500 to-secondary-500">
      {/* Progress Bar */}
      <div className="bg-white bg-opacity-20 backdrop-blur-sm">
        <div className="max-w-md mx-auto p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white text-sm font-medium">
              Step {currentStep + 1} of {steps.length}
            </span>
            <span className="text-white text-sm">
              {Math.round(((currentStep + 1) / steps.length) * 100)}%
            </span>
          </div>
          <div className="w-full bg-white bg-opacity-30 rounded-full h-2">
            <div
              className="bg-white h-2 rounded-full transition-all duration-500"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Step Content */}
      <div className="max-w-md mx-auto p-6">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden animate-fade-in">
          <StepComponent
            data={data}
            onUpdate={updateData}
            onNext={nextStep}
            onPrev={currentStep > 0 ? prevStep : undefined}
          />
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
