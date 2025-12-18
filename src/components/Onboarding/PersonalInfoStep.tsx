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
  photos: string; // URL
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

  // ----------- INITIAL FORM DATA -----------
  const [formData, setFormData] = useState<FormData>({
    name: user?.username ?? "",
    email: user?.emailAddresses?.[0]?.emailAddress ?? "",
    age: data?.age ?? "",
    gender: (data?.gender as "male" | "female") ?? "",
    location: data?.location ?? "",
    bio: data?.bio ?? "",
    mood: data?.mood ?? "",
    photos:
      user?.imageUrl ||
      "https://images.pexels.com/photos/1239288/pexels-photo-1239288.jpeg",
  });

  const [errors, setErrors] = useState<Errors>({});
  const [touched, setTouched] = useState<
    Partial<Record<keyof FormData, boolean>>
  >({});

  // ----------- SYNC WITH INCOMING DATA -----------
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
      photos: user?.imageUrl ?? prev.photos,
    }));
  }, [data, user]);

  // ----------- VALIDATION -----------
  const validate = (fd: FormData): Errors => {
    const e: Errors = {};

    if (!fd.name) e.name = "Name is required.";
    if (!fd.email) e.email = "Email is required.";

    if (fd.age === "" || fd.age === null) e.age = "Age is required.";
    else if (typeof fd.age === "number") {
      if (fd.age < 18) e.age = "You must be at least 18.";
      if (fd.age > 99) e.age = "Age must be less than 100.";
    }

    if (!fd.gender) e.gender = "Please select your gender.";
    if (!fd.location) e.location = "Location is required.";

    if (!fd.bio) e.bio = "Bio is required.";
    if (fd.bio.length > MAX_BIO)
      e.bio = `Bio must be at most ${MAX_BIO} characters.`;

    if (!fd.mood) e.mood = "Mood is required.";
    if (fd.mood.length > MAX_MOOD)
      e.mood = `Mood must be at most ${MAX_MOOD} characters.`;

    if (!fd.photos) e.photos = "Profile photo is required.";

    return e;
  };

  useEffect(() => {
    const e = validate(formData);
    setErrors(e);
    onUpdate({ personalInfo: formData });
  }, [formData, onUpdate]);

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

  // ------------------ PROFILE IMAGE UPLOAD ------------------
  const handleProfileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    try {
      // Upload to Clerk
      await user.setProfileImage({ file });

      // Preview immediately
      const previewUrl = URL.createObjectURL(file);
      setFormData((prev) => ({ ...prev, photos: previewUrl }));

      console.log("Profile uploaded successfully");
    } catch (error) {
      console.error("Failed to upload:", error);
    }
  };

  // ------------------ NEXT BUTTON ------------------
  const handleNext = () => {
    const allTouched: Partial<Record<keyof FormData, boolean>> = {};
    (Object.keys(formData) as (keyof FormData)[]).forEach((k) => {
      allTouched[k] = true;
    });
    setTouched(allTouched);

    const e = validate(formData);
    setErrors(e);

    if (Object.keys(e).length === 0) onNext();
  };

  return (
    <div className="p-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Tell us about yourself
        </h2>
        <p className="text-gray-600">Help us create your authentic profile</p>
      </div>

      {/* ----------- PROFILE PHOTO ----------- */}
      <div className="mb-6">
        <label className="block text-sm text-center font-medium text-gray-700 mb-3">
          Profile Photo
        </label>

        <div className="flex justify-center">
          <div className="relative">
            <img
              src={formData.photos}
              alt="Profile preview"
              className="w-24 h-24 rounded-full object-cover border-4 border-gray-200"
            />

            {/* Hidden file input */}
            <input
              type="file"
              accept="image/*"
              id="profileImageInput"
              className="hidden"
              onChange={handleProfileUpload}
            />

            {/* Camera Button */}
            <button
              type="button"
              onClick={() =>
                document.getElementById("profileImageInput")?.click()
              }
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

      {/* ----------- FORM FIELDS ----------- */}
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
            className="w-full p-3 border border-gray-300 rounded-xl"
          />
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
            className="w-full p-3 border border-gray-300 rounded-xl"
          />
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
                e.target.value === "" ? "" : Number(e.target.value)
              )
            }
            className="w-full p-3 border border-gray-300 rounded-xl"
          />
        </div>

        {/* Gender */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Gender
          </label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                value="male"
                name="gender"
                checked={formData.gender === "male"}
                onChange={() => handleChange("gender", "male")}
              />
              Male
            </label>

            <label className="flex items-center gap-2">
              <input
                type="radio"
                value="female"
                name="gender"
                checked={formData.gender === "female"}
                onChange={() => handleChange("gender", "female")}
              />
              Female
            </label>
          </div>
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
            className="w-full p-3 border border-gray-300 rounded-xl"
          />
        </div>

        {/* Bio */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Bio
          </label>
          <textarea
            value={formData.bio}
            onChange={(e) => handleChange("bio", e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-xl"
            rows={4}
          />
        </div>

        {/* Mood */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Mood
          </label>
          <textarea
            value={formData.mood}
            onChange={(e) => handleChange("mood", e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-xl"
            rows={4}
          />
        </div>
      </div>

      {/* ----------- NAVIGATION ----------- */}
      <div className="flex gap-3">
        {onPrev && (
          <button
            onClick={onPrev}
            className="w-12 h-12 border rounded-xl flex items-center justify-center"
            type="button"
          >
            <ChevronLeft size={20} />
          </button>
        )}

        <button
          onClick={handleNext}
          disabled={!isValid}
          className={`flex-1 py-3 rounded-xl font-semibold ${
            isValid
              ? "bg-primary-600 text-white"
              : "bg-gray-200 text-gray-400 cursor-not-allowed"
          }`}
          type="button"
        >
          Continue
          {/* <ChevronRight size={16} /> */}
        </button>
      </div>
    </div>
  );
};

export default PersonalInfoStep;
