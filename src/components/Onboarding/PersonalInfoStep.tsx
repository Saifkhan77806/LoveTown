import React, { useState } from 'react';
import { Camera, ChevronLeft, ChevronRight } from 'lucide-react';
import { useUser } from '@clerk/clerk-react';

interface PersonalInfoStepProps {
  data: any;
  onUpdate: (data: any) => void;
  onNext: () => void;
  onPrev?: () => void;
}

const PersonalInfoStep: React.FC<PersonalInfoStepProps> = ({ data, onUpdate, onNext, onPrev }) => {

  const { user } = useUser()

  const [formData, setFormData] = useState({
    name: user?.username,
    email: user?.emailAddresses?.[0]?.emailAddress,
    age: data.personalInfo?.age || '',
    gender: data.personalInfo?.gender || '',
    location: data.personalInfo?.location || '',
    bio: data.personalInfo?.bio || '',
    mood: data.personalInfo?.mood || '',
    photos: data.personalInfo?.photos || ['https://images.pexels.com/photos/1239288/pexels-photo-1239288.jpeg']
  });

  const handleChange = (field: string, value: any) => {
    const newData = { ...formData, [field]: value };
    setFormData(newData);
    onUpdate({ personalInfo: newData });
  };

  const canProceed = formData.name && formData.age && formData.location && formData.bio && formData.gender && formData.mood;

  return (
    <div className="p-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Tell us about yourself</h2>
        <p className="text-gray-600">Help us create your authentic profile</p>
      </div>

      {/* Photo Upload */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">Profile Photo</label>
        <div className="flex justify-center">
          <div className="relative">
            <img
              src={formData.photos[0]}
              alt="Profile preview"
              className="w-24 h-24 rounded-full object-cover border-4 border-gray-200"
            />
            <button className="absolute -bottom-1 -right-1 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center shadow-lg">
              <Camera size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Form Fields */}
      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
          <input
            type="text"
            value={formData?.name as string}
            readOnly
            className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Your first name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
          <input
            type="text"
            value={formData.email}
            readOnly
            className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Your first name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Age</label>
          <input
            type="number"
            value={formData.age}
            onChange={(e) => handleChange('age', parseInt(e.target.value) || '')}
            className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="25"
            min="18"
            max="99"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Age</label>
          <div className='flex gap-2'>
            <input
              type="radio"
              value={'male'}
              name='gender'
              id='male'
              onChange={(e) => handleChange('gender', e.target.value || '')}
              className="p-3 border border-gray-300 rounded-xl "
              placeholder="Male"
            />
            <label htmlFor="male">Male</label>
          </div>

          <div className='flex gap-2'>
            <input
              type="radio"
              value={'female'}
              name='gender'
              id='female'
              onChange={(e) => handleChange('gender', e.target.value || '')}
              className="p-3 border border-gray-300 rounded-x"
              placeholder="female"
            />
            <label htmlFor="female">Female</label>
          </div>

        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
          <input
            type="text"
            value={formData.location}
            onChange={(e) => handleChange('location', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="San Francisco, CA"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
          <textarea
            value={formData.bio}
            onChange={(e) => handleChange('bio', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
            rows={4}
            placeholder="Tell us about yourself, your passions, and what makes you unique..."
            maxLength={500}
          />
          <p className="text-xs text-gray-500 mt-1">{formData.bio.length}/500 characters</p>
        </div>

         <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Mood</label>
          <textarea
            value={formData.mood}
            onChange={(e) => handleChange('mood', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
            rows={4}
            placeholder="Tell Me about your mood , your day, your thoughts..."
            maxLength={500}
          />
          <p className="text-xs text-gray-500 mt-1">{formData.mood.length}/500 characters</p>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex gap-3">
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
          className={`flex-1 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${canProceed
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

export default PersonalInfoStep;