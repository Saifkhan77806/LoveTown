import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';

interface CompatibilityStepProps {
  data: any;
  onUpdate: (data: any) => void;
  onNext: () => void;
  onPrev?: () => void;
}

const CompatibilityStep: React.FC<CompatibilityStepProps> = ({ data, onUpdate, onNext, onPrev }) => {
  const [formData, setFormData] = useState({
    values: data?.values || [],
    interests: data.interests || [],
    personalityType: data.personalityType || '',
    relationshipGoals: data.relationshipGoals || '',
    communicationStyle: data.communicationStyle || '',
    dealBreakers: data.dealBreakers || []
  });

  const valueOptions = [
    'Authenticity', 'Growth', 'Compassion', 'Adventure', 'Creativity', 'Mindfulness',
    'Family', 'Career', 'Travel', 'Health', 'Learning', 'Spirituality'
  ];

  const interestOptions = [
    'Meditation', 'Hiking', 'Photography', 'Cooking', 'Art', 'Yoga', 'Travel',
    'Reading', 'Music', 'Dancing', 'Sports', 'Gaming', 'Volunteering', 'Technology'
  ];

  const personalityTypes = [
    'INTJ', 'INTP', 'ENTJ', 'ENTP', 'INFJ', 'INFP', 'ENFJ', 'ENFP',
    'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ', 'ISTP', 'ISFP', 'ESTP', 'ESFP'
  ];

  const relationshipGoals = [
    'Long-term partnership', 'Marriage & family', 'Serious dating', 
    'Meaningful connection', 'Life partner', 'Growth together'
  ];

  const communicationStyles = [
    'Direct and honest', 'Warm and empathetic', 'Thoughtful and deep',
    'Playful and light', 'Analytical and logical', 'Intuitive and emotional'
  ];

  const dealBreakers = [
    'Smoking', 'Excessive drinking', 'Dishonesty', 'Lack of empathy',
    'Different life goals', 'Poor communication', 'Lack of ambition', 'Infidelity'
  ];

  const toggleSelection = (category: keyof typeof formData, item: string) => {
    const current = formData[category] as string[];
    const updated = current.includes(item)
      ? current.filter(i => i !== item)
      : [...current, item];
    
    const newData = { ...formData, [category]: updated };
    setFormData(newData);
    onUpdate({ compatibility: newData });
  };

  const handleSingleSelect = (field: keyof typeof formData, value: string) => {
    const newData = { ...formData, [field]: value };
    setFormData(newData);
    onUpdate({ compatibility: newData });
  };

  const canProceed = formData.values.length >= 3 && formData.interests.length >= 3 && 
                    formData.personalityType && formData.relationshipGoals && formData.communicationStyle;

  return (
    <div className="p-6 max-h-[80vh] overflow-y-auto">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Compatibility Assessment</h2>
        <p className="text-gray-600">Help us understand what matters most to you</p>
      </div>

      <div className="space-y-6">
        {/* Core Values */}
        <div>
          <h3 className="font-semibold text-gray-900 mb-3">Core Values (Select at least 3)</h3>
          <div className="grid grid-cols-2 gap-2">
            {valueOptions.map((value) => (
              <button
                key={value}
                onClick={() => toggleSelection('values', value)}
                className={`p-3 rounded-xl text-sm font-medium transition-all duration-200 flex items-center justify-between ${
                  formData.values.includes(value)
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {value}
                {formData.values.includes(value) && <Check size={16} />}
              </button>
            ))}
          </div>
        </div>

        {/* Interests */}
        <div>
          <h3 className="font-semibold text-gray-900 mb-3">Interests (Select at least 3)</h3>
          <div className="grid grid-cols-2 gap-2">
            {interestOptions.map((interest) => (
              <button
                key={interest}
                onClick={() => toggleSelection('interests', interest)}
                className={`p-3 rounded-xl text-sm font-medium transition-all duration-200 flex items-center justify-between ${
                  formData.interests.includes(interest)
                    ? 'bg-secondary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {interest}
                {formData.interests.includes(interest) && <Check size={16} />}
              </button>
            ))}
          </div>
        </div>

        {/* Personality Type */}
        <div>
          <h3 className="font-semibold text-gray-900 mb-3">Personality Type</h3>
          <div className="grid grid-cols-4 gap-2">
            {personalityTypes.map((type) => (
              <button
                key={type}
                onClick={() => handleSingleSelect('personalityType', type)}
                className={`p-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  formData.personalityType === type
                    ? 'bg-accent-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Relationship Goals */}
        <div>
          <h3 className="font-semibold text-gray-900 mb-3">Relationship Goals</h3>
          <div className="space-y-2">
            {relationshipGoals.map((goal) => (
              <button
                key={goal}
                onClick={() => handleSingleSelect('relationshipGoals', goal)}
                className={`w-full p-3 rounded-xl text-sm font-medium transition-all duration-200 text-left ${
                  formData.relationshipGoals === goal
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {goal}
              </button>
            ))}
          </div>
        </div>

        {/* Communication Style */}
        <div>
          <h3 className="font-semibold text-gray-900 mb-3">Communication Style</h3>
          <div className="space-y-2">
            {communicationStyles.map((style) => (
              <button
                key={style}
                onClick={() => handleSingleSelect('communicationStyle', style)}
                className={`w-full p-3 rounded-xl text-sm font-medium transition-all duration-200 text-left ${
                  formData.communicationStyle === style
                    ? 'bg-secondary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {style}
              </button>
            ))}
          </div>
        </div>

        {/* Deal Breakers */}
        <div>
          <h3 className="font-semibold text-gray-900 mb-3">Deal Breakers (Optional)</h3>
          <div className="grid grid-cols-2 gap-2">
            {dealBreakers.map((breaker) => (
              <button
                key={breaker}
                onClick={() => toggleSelection('dealBreakers', breaker)}
                className={`p-3 rounded-xl text-sm font-medium transition-all duration-200 flex items-center justify-between ${
                  formData.dealBreakers.includes(breaker)
                    ? 'bg-red-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {breaker}
                {formData.dealBreakers.includes(breaker) && <Check size={16} />}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex gap-3 mt-6 pt-6 border-t border-gray-200">
        {onPrev && (
          <button
            onClick={onPrev}
            className="flex items-center justify-center w-12 h-12 border border-gray-300 rounded-xl hover:bg-gray-50 transition-all duration-200"
          >
            <ChevronLeft size={20} />
          </button>
        )}
        <button
          onClick={onNext}
          disabled={!canProceed}
          className={`flex-1 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
            canProceed
              ? 'bg-primary-600 text-white hover:bg-primary-700'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
        >
          Continue
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default CompatibilityStep;