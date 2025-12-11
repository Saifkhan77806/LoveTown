import { Match } from "../models/Match.js";
import { User } from "../models/User.js";

export const matchedUser = async (req, res) => {
  try {
    const { email } = req.query;

    const matchedDetails = await Match.findOne({
      $or: [{ user1: email }, { user2: email }],
    });

    if (!matchedDetails)
      return res.status(404).json({
        message: "user not found",
      });

    const userEmail =
      email === matchedDetails.user1
        ? matchedDetails.user2
        : matchedDetails.user1;

    const matchedUser = await User.findOne({ email: userEmail });

    const data = {
      name: matchedUser.name,
      email: matchedUser.email,
      age: matchedUser.age,
      bio: matchedUser.bio,
      mood: matchedUser.mood,
      interest: matchedUser.interests,
      values: matchedUser.values,
      photos: matchedUser.photos[0],
      personalityType: matchedUser.personalityType,
      relationshipGoals: matchedUser.relationshipGoals,
      location: matchedUser.location,
      compatibilityScore: matchedDetails.compatibilityScore,
    };

    return res.status(200).json({ ...data });
  } catch (error) {
    console.error("matched user error", error);
  }
};
