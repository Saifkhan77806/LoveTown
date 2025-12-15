import  { useEffect, useState } from "react";
import { Camera, MapPin, Heart, Edit, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAppSelector } from "../../store/hook";
import { AppDispatch } from "../../store/store";
import { useDispatch } from "react-redux";
import { fetchUserAsync } from "../../slice/userSlice";
import { fetchMatchedUserasync } from "../../slice/matchedSlice";
import { useUser } from "@clerk/clerk-react";


const Profile = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [activeTab, setActiveTab] = useState<
    "about" | "preferences" | "compatibility"
  >("about");
  const navigate = useNavigate();
  const { matchedUser } = useAppSelector((state) => state.matched);
  const { user } = useAppSelector((state) => state.user);
  const { user: users } = useUser();
  const email = users?.emailAddresses?.[0]?.emailAddress;

  useEffect(() => {
    if (email && !user) dispatch(fetchUserAsync({ email }));
    if (
      !matchedUser &&
      user &&
      (user.status === "matched" || user.status === "chatting")
    )
      dispatch(fetchMatchedUserasync(email as string));
  }, [email, user, matchedUser]);

  return (
    <div className="min-h-screen lg:pt-10 bg-gradient-to-br from-warm-50 to-primary-50 pb-20">
      <div className="p-6 pt-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Your Profile</h1>
          <button
            className="p-2 text-gray-600 hover:bg-white hover:shadow-sm rounded-full transition-all duration-200"
            onClick={() => navigate("/settings")}
          >
            <Settings size={20} />
          </button>
        </div>

        {/* Profile Photo & Basic Info */}
        <div className="bg-white rounded-2xl p-6 mb-6 shadow-sm">
          <div className="flex items-center gap-4 mb-6">
            <div className="relative">
              <img
                src={user?.photos}
                alt={user?.name}
                className="w-20 h-20 rounded-full object-cover"
              />
              <button className="absolute -bottom-1 -right-1 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center shadow-lg">
                <Camera size={14} />
              </button>
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-gray-900">
                {user?.name}, {user?.age}
              </h2>
              <div className="flex items-center text-gray-600 mb-2">
                <MapPin size={16} className="mr-1" />
                <span>{user?.location}</span>
              </div>
              <button className="flex items-center gap-1 text-primary-600 hover:text-primary-700 font-medium">
                <Edit size={14} />
                Edit profile
              </button>
            </div>
          </div>

          <p className="text-gray-700 leading-relaxed">{user?.bio}</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {/* <div className="bg-white rounded-xl p-4 text-center shadow-sm">
            <div className="text-2xl font-bold text-primary-600 mb-1">94%</div>
            <div className="text-xs text-gray-600">Avg Match Score</div>
          </div> */}
          <div className="bg-white rounded-xl p-4 text-center shadow-sm">
            <div className="text-2xl font-bold text-secondary-600 mb-1">
              {user?.matchesCount}
            </div>
            <div className="text-xs text-gray-600">Total Matches</div>
          </div>
          <div className="bg-gray-300/20 cursor-default rounded-xl p-4 text-center shadow-sm " >
            <div className="text-2xl font-bold text-accent-600 mb-1">Coming soon!</div>
            <div className="text-xs text-gray-600">Video Calls</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="flex border-b border-gray-200">
            {[
              { id: "about", label: "About" },
              { id: "preferences", label: "Preferences" },
              { id: "compatibility", label: "Compatibility" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 py-3 px-4 text-sm font-medium transition-all duration-200 ${
                  activeTab === tab.id
                    ? "text-primary-600 border-b-2 border-primary-600 bg-primary-50"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-6">
            {activeTab === "about" && (
              <div className="space-y-6">
                {/* Interests */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">
                    Interests
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {user?.interests.map((interest, index) => (
                      <span
                        key={index}
                        className="bg-secondary-100 text-secondary-700 px-3 py-1 rounded-full text-sm"
                      >
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Values */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">
                    Core Values
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {user?.values.map((value, index) => (
                      <span
                        key={index}
                        className="bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-sm"
                      >
                        {value}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Personality */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">
                    Personality
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Type</span>
                      <span className="font-medium text-gray-900">
                        {user?.personalityType}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Communication Style</span>
                      <span className="font-medium text-gray-900">
                        {user?.communicationStyle}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">
                        Emotional Intelligence
                      </span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-secondary-500 h-2 rounded-full"
                            style={{
                              width: `${matchedUser?.compatibilityScore}%`,
                            }}
                          ></div>
                        </div>
                        <span className="font-medium text-gray-900">
                          {matchedUser?.compatibilityScore}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "preferences" && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">
                    Looking For
                  </h3>
                  <p className="text-gray-700">{user?.relationshipGoals}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">
                    Age Range
                  </h3>
                  <p className="text-gray-700">24 - 32 years old</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Distance</h3>
                  <p className="text-gray-700">Within 25 miles</p>
                </div>
              </div>
            )}

            {activeTab === "compatibility" && (
              <div className="space-y-6">
                <div className="text-center">
                  <div className="w-24 h-24 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Heart className="text-white" size={32} />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Compatibility Algorithm
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Your matches are based on deep psychological compatibility,
                    shared values, and complementary personality traits.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">
                      Emotional Intelligence
                    </span>
                    <span className="font-medium text-secondary-600">
                      High Match Priority
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Core Values Alignment</span>
                    <span className="font-medium text-secondary-600">
                      Essential
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">
                      Personality Compatibility
                    </span>
                    <span className="font-medium text-primary-600">
                      INFP/ENFP Preferred
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Communication Style</span>
                    <span className="font-medium text-accent-600">
                      Empathetic & Direct
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
