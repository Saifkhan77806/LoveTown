import React, { useEffect, useMemo, useState } from "react";
import { Camera, ChevronLeft, ChevronRight } from "lucide-react";
import { useUser } from "@clerk/clerk-react";
import { userType } from "../../types";

interface PersonalInfoStepProps {
  data: userType | null;
  onUpdate: (data: any) => void;
  onNext: () => void;
  onPrev?: () => void;
}

type FormData = {
  name: string;
  email: string;
  age: number | "";
  gender: "male" | "female" | "";
  location: string;
  bio: string;
  mood: string;
  photos: string[]; // array of URL strings
};

type Errors = Partial<Record<keyof FormData, string>>;

const MAX_BIO = 500;
const MAX_MOOD = 500;

const PersonalInfoStep: React.FC<PersonalInfoStepProps> = ({
  data,
  onUpdate,
  onNext,
  onPrev,
}) => {
  const { user } = useUser();

  // initialize form with either user/data or safe defaults
  const [formData, setFormData] = useState<FormData>({
    name: user?.username ?? "",
    email: user?.emailAddresses?.[0]?.emailAddress ?? "",
    age: data?.age ?? "",
    gender: (data?.gender as "male" | "female") ?? "",
    location: data?.location ?? "",
    bio: data?.bio ?? "",
    mood: data?.mood ?? "",
    photos: (Array.isArray(data?.photos)
      ? (data?.photos as string[])
      : undefined) ?? [
      "https://images.pexels.com/photos/1239288/pexels-photo-1239288.jpeg",
    ],
  });

  const [errors, setErrors] = useState<Errors>({});
  const [touched, setTouched] = useState<
    Partial<Record<keyof FormData, boolean>>
  >({});

  // sync in incoming `data` when it changes (useful for async fetch)
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      name: user?.username ?? prev.name,
      email: user?.emailAddresses?.[0]?.emailAddress ?? prev.email,
      age: data?.age ?? prev.age,
      gender: (data?.gender as "male" | "female") ?? prev.gender,
      location: data?.location ?? prev.location,
      bio: data?.bio ?? prev.bio,
      mood: data?.mood ?? prev.mood,
      photos:
        (Array.isArray(data?.photos)
          ? (data?.photos as string[])
          : undefined) ?? prev.photos,
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, user?.username, user?.emailAddresses]);

  // validate function
  const validate = (fd: FormData): Errors => {
    const e: Errors = {};

    if (!fd.name || !fd.name.toString().trim()) e.name = "Name is required.";
    if (!fd.email || !fd.email.toString().trim())
      e.email = "Email is required.";

    if (fd.age === "" || fd.age === null) {
      e.age = "Age is required.";
    } else if (typeof fd.age === "number") {
      if (fd.age < 18) e.age = "You must be at least 18.";
      if (fd.age > 99) e.age = "Age must be less than 100.";
    } else {
      e.age = "Invalid age.";
    }

    if (!fd.gender) e.gender = "Please select your gender.";
    if (!fd.location || !fd.location.trim())
      e.location = "Location is required.";
    if (!fd.bio || !fd.bio.trim()) e.bio = "Bio is required.";
    if ((fd.bio || "").length > MAX_BIO)
      e.bio = `Bio must be at most ${MAX_BIO} characters.`;

    if (!fd.mood || !fd.mood.trim()) e.mood = "Mood is required.";
    if ((fd.mood || "").length > MAX_MOOD)
      e.mood = `Mood must be at most ${MAX_MOOD} characters.`;

    // optional: ensure there's at least one photo url
    if (!Array.isArray(fd.photos) || fd.photos.length === 0)
      e.photos = "At least one photo is required.";

    return e;
  };

  // run validation whenever formData changes and update parent via onUpdate
  useEffect(() => {
    const e = validate(formData);
    setErrors(e);
    onUpdate({ personalInfo: formData });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData]);

  // whether form is valid (no errors)
  const isValid = useMemo(() => Object.keys(errors).length === 0, [errors]);

  const handleChange = <K extends keyof FormData>(
    field: K,
    value: FormData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleBlur = <K extends keyof FormData>(field: K) => {
    setTouched((t) => ({ ...t, [field]: true }));
  };

  const handleNext = () => {
    // mark all fields touched so errors display
    const allTouched: Partial<Record<keyof FormData, boolean>> = {};
    (Object.keys(formData) as (keyof FormData)[]).forEach((k) => {
      allTouched[k] = true;
    });
    setTouched(allTouched);

    const e = validate(formData);
    setErrors(e);

    if (Object.keys(e).length === 0) {
      onNext();
    } else {
      // focus first errored field (optional enhancement)
      // leave UX to show messages
    }
  };

  return (
    <div className="p-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Tell us about yourself
        </h2>
        <p className="text-gray-600">Help us create your authentic profile</p>
      </div>

      {/* Photo Upload */}
      <div className="mb-6">
        <label className="block text-sm text-center font-medium text-gray-700 mb-3">
          Profile Photo
        </label>
        <div className="flex justify-center">
          <div className="relative">
            <img
              src={formData.photos[0]}
              alt="Profile preview"
              className="w-24 h-24 rounded-full object-cover border-4 border-gray-200"
            />
            <button
              type="button"
              className="absolute -bottom-1 -right-1 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center shadow-lg"
            >
              <Camera size={14} />
            </button>
          </div>
        </div>
        {touched.photos && errors.photos && (
          <p className="text-sm text-red-600 mt-2">{errors.photos}</p>
        )}
      </div>

      {/* Form Fields */}
      <div className="space-y-4 mb-6">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Name
          </label>
          <input
            type="text"
            value={formData.name}
            readOnly
            onBlur={() => handleBlur("name")}
            className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Your first name"
          />
          {touched.name && errors.name && (
            <p className="text-sm text-red-600 mt-1">{errors.name}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email
          </label>
          <input
            type="text"
            value={formData.email}
            readOnly
            onBlur={() => handleBlur("email")}
            className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="you@example.com"
          />
          {touched.email && errors.email && (
            <p className="text-sm text-red-600 mt-1">{errors.email}</p>
          )}
        </div>

        {/* Age */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Age
          </label>
          <input
            type="number"
            value={formData.age === "" ? "" : String(formData.age)}
            onChange={(e) =>
              handleChange(
                "age",
                (e.target.value === "" ? "" : Number(e.target.value)) as any
              )
            }
            onBlur={() => handleBlur("age")}
            className={`w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 ${
              touched.age && errors.age ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="25"
            min={18}
            max={99}
          />
          {touched.age && errors.age && (
            <p className="text-sm text-red-600 mt-1">{errors.age}</p>
          )}
        </div>

        {/* Gender */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Gender
          </label>

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                value="male"
                name="gender"
                checked={formData.gender === "male"}
                onChange={() => handleChange("gender", "male")}
                onBlur={() => handleBlur("gender")}
                className="p-3 border border-gray-300 rounded-xl"
              />
              <span>Male</span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="radio"
                value="female"
                name="gender"
                checked={formData.gender === "female"}
                onChange={() => handleChange("gender", "female")}
                onBlur={() => handleBlur("gender")}
                className="p-3 border border-gray-300 rounded-x"
              />
              <span>Female</span>
            </label>
          </div>

          {touched.gender && errors.gender && (
            <p className="text-sm text-red-600 mt-1">{errors.gender}</p>
          )}
        </div>

        {/* Location */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Location
          </label>
          <input
            type="text"
            value={formData.location}
            onChange={(e) => handleChange("location", e.target.value)}
            onBlur={() => handleBlur("location")}
            className={`w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 ${
              touched.location && errors.location
                ? "border-red-500"
                : "border-gray-300"
            }`}
            placeholder="San Francisco, CA"
          />
          {touched.location && errors.location && (
            <p className="text-sm text-red-600 mt-1">{errors.location}</p>
          )}
        </div>

        {/* Bio */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Bio
          </label>
          <textarea
            value={formData.bio}
            onChange={(e) => handleChange("bio", e.target.value)}
            onBlur={() => handleBlur("bio")}
            className={`w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none ${
              touched.bio && errors.bio ? "border-red-500" : "border-gray-300"
            }`}
            rows={4}
            placeholder="Tell us about yourself, your passions, and what makes you unique..."
            maxLength={MAX_BIO}
          />
          <div className="flex justify-between items-center mt-1">
            <p className="text-xs text-gray-500">
              {formData.bio.length}/{MAX_BIO} characters
            </p>
            {touched.bio && errors.bio ? (
              <p className="text-sm text-red-600">{errors.bio}</p>
            ) : null}
          </div>
        </div>

        {/* Mood */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Mood
          </label>
          <textarea
            value={formData.mood}
            onChange={(e) => handleChange("mood", e.target.value)}
            onBlur={() => handleBlur("mood")}
            className={`w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none ${
              touched.mood && errors.mood ? "border-red-500" : "border-gray-300"
            }`}
            rows={4}
            placeholder="Tell me about your mood, your day, your thoughts..."
            maxLength={MAX_MOOD}
          />
          <div className="flex justify-between items-center mt-1">
            <p className="text-xs text-gray-500">
              {formData.mood.length}/{MAX_MOOD} characters
            </p>
            {touched.mood && errors.mood ? (
              <p className="text-sm text-red-600">{errors.mood}</p>
            ) : null}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex gap-3">
        {onPrev && (
          <button
            onClick={onPrev}
            className="flex items-center justify-center w-12 h-12 border border-gray-300 rounded-xl hover:bg-gray-50 transition-all duration-200"
            type="button"
          >
            <ChevronLeft size={20} />
          </button>
        )}
        <button
          onClick={handleNext}
          disabled={!isValid}
          className={`flex-1 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
            isValid
              ? "bg-primary-600 text-white hover:bg-primary-700"
              : "bg-gray-100 text-gray-400 cursor-not-allowed"
          }`}
          type="button"
        >
          Continue
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default PersonalInfoStep;
