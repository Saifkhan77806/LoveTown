import { getFilteredUsersByEmail } from "../data/match.js";
import { scheduleJob } from "../helper/cronManager.js";
import { User } from "../models/User.js";

export const onBoardUser = async (req, res) => {
  const {
    email,
    age,
    bio,
    gender,
    photos,
    location,
    interests,
    values,
    personalityType,
    relationshipGoals,
    communicationStyle,
    mood,
  } = req.body;

  try {
    const isFrozen = await User.findOne({ email }).select("status");
    let status = "onboarding";
    let time = 2;

    if (
      isFrozen == "frozen" ||
      isFrozen == "chatting" ||
      isFrozen == "matched"
    ) {
      status = "frozen";
      time = 24;
    }

    const user = await User.findOneAndUpdate(
      { email },
      {
        age,
        bio,
        gender,
        photos,
        location,
        interests,
        values,
        status,
        personalityType,
        relationshipGoals,
        communicationStyle,
        mood,
        moodembedding: [1, 2, 5, 2, 3],
        bioEmbedding: [2, 5, 4, 6, 3, 5, 56, 6, 5],
      },
      { new: true }
    );

    // scheduleJob(user._id, 1, );

    await getFilteredUsersByEmail(email);

    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    res
      .status(200)
      .json({ success: true, data: user, message: "user matched" });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
};
