import React, { useState } from 'react';
import { ChevronLeft, Check } from 'lucide-react';

interface PreferencesStepProps {
  data: any;
  onUpdate: (data: any) => void;
  onNext: () => void;
  onPrev?: () => void;
}

const PreferencesStep: React.FC<PreferencesStepProps> = ({ data, onUpdate, onNext, onPrev }) => {
  const [formData, setFormData] = useState({
    ageRange: data.preferences?.ageRange || [22, 35],
    maxDistance: data.preferences?.maxDistance || 25,
    importantTraits: data.preferences?.importantTraits || []
  });

  const importantTraits = [
    'Emotional Intelligence', 'Sense of Humor', 'Ambition', 'Kindness',
    'Intelligence', 'Creativity', 'Honesty', 'Loyalty', 'Adventure',
    'Stability', 'Passion', 'Empathy', 'Independence', 'Family-oriented'
  ];

  const toggleTrait = (trait: string) => {
    const updated = formData.importantTraits.includes(trait)
      ? formData.importantTraits.filter(t => t !== trait)
      : [...formData.importantTraits, trait];
    
    const newData = { ...formData, importantTraits: updated };
    setFormData(newData);
    onUpdate({ preferences: newData });
  };

  const handleAgeChange = (index: number, value: number) => {
    const newRange = [...formData.ageRange] as [number, number];
    newRange[index] = value;
    
    // Ensure min <= max
    if (index === 0 && value > newRange[1]) {
      newRange[1] = value;
    } else if (index === 1 && value < newRange[0]) {
      newRange[0] = value;
    }
    
    const newData = { ...formData, ageRange: newRange };
    setFormData(newData);
    onUpdate({ preferences: newData });
  };

  const handleDistanceChange = (distance: number) => {
    const newData = { ...formData, maxDistance: distance };
    setFormData(newData);
    onUpdate({ preferences: newData });
  };

  const canProceed = formData.importantTraits.length >= 3;

  return (
    <div className="p-6 max-h-[80vh] overflow-y-auto">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Preferences</h2>
        <p className="text-gray-600">Help us find your ideal matches</p>
      </div>

      <div className="space-y-6">
        {/* Age Range */}
        <div>
          <h3 className="font-semibold text-gray-900 mb-3">Age Range</h3>
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-gray-700">From {formData.ageRange[0]} to {formData.ageRange[1]} years old</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Minimum Age</label>
                <input
                  type="range"
                  min="18"
                  max="65"
                  value={formData.ageRange[0]}
                  onChange={(e) => handleAgeChange(0, parseInt(e.target.value))}
                  className="w-full"
                />
                <div className="text-center text-sm text-gray-500">{formData.ageRange[0]}</div>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Maximum Age</label>
                <input
                  type="range"
                  min="18"
                  max="65"
                  value={formData.ageRange[1]}
                  onChange={(e) => handleAgeChange(1, parseInt(e.target.value))}
                  className="w-full"
                />
                <div className="text-center text-sm text-gray-500">{formData.ageRange[1]}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Distance */}
        <div>
          <h3 className="font-semibold text-gray-900 mb-3">Maximum Distance</h3>
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="text-center mb-3">
              <span className="text-gray-700">Within {formData.maxDistance} miles</span>
            </div>
            <input
              type="range"
              min="5"
              max="100"
              step="5"
              value={formData.maxDistance}
              onChange={(e) => handleDistanceChange(parseInt(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-gray-500 mt-1">
              <span>5 mi</span>
              <span>100 mi</span>
            </div>
          </div>
        </div>

        {/* Important Traits */}
        <div>
          <h3 className="font-semibold text-gray-900 mb-3">Most Important Traits (Select at least 3)</h3>
          <div className="grid grid-cols-2 gap-2">
            {importantTraits.map((trait) => (
              <button
                key={trait}
                onClick={() => toggleTrait(trait)}
                className={`p-3 rounded-xl text-sm font-medium transition-all duration-200 flex items-center justify-between ${
                  formData.importantTraits.includes(trait)
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {trait}
                {formData.importantTraits.includes(trait) && <Check size={16} />}
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
          className={`flex-1 py-3 rounded-xl font-semibold transition-all duration-200 ${
            canProceed
              ? 'bg-primary-600 text-white hover:bg-primary-700'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
        >
          Complete Setup
        </button>
      </div>
    </div>
  );
};

export default PreferencesStep;