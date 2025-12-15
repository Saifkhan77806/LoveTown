import { Match } from "../models/Match.js";
import { User } from "../models/User.js";

export const findMatchByEmail = async (email) => {
  try {
    const match = await Match.findOne({ user1: email });

    return match;
  } catch (err) {
    return;
  }
};

export const findMatchByEmailOfUser2 = async (email) => {
  try {
    const match = await Match.findOne({ user2: email });
    return match;
  } catch (err) {
    return;
  }
};

export const findMatchById = async (id) => {
  try {
    const match = await Match.findById(id);
    return match;
  } catch (err) {
    return;
  }
};

export async function getFilteredUsersByEmail(email) {
  const allowedStatuses = ["available", "onboarding", "breakup"];
  console.log("my match function is executed successfully");
  try {
    // 1. Find the current user
    const currentUser = await User.findOne({ email });
    if (!currentUser) {
      throw new Error("User not found");
    }

    // 2. Determine target gender (opposite)
    let targetGender;
    if (currentUser.gender === "male") targetGender = "female";
    else if (currentUser.gender === "female") targetGender = "male";

    // If gender is missing or not MALE/FEMALE

    if (!targetGender) {
      throw new Error("User gender is invalid or missing");
    }

    // 3. Query opposite gender users with desired statuses
    const users = await User.find({
      email: { $ne: email },
      gender: targetGender,
      status: { $in: allowedStatuses },
    });

    if (users.length === 0) {
      throw new Error("Match not found");
    }

    const match = Math.floor(Math.random() * users.length);

    const matchedUser = users[match];

    const user1 = currentUser.email; //It is in the form of email
    const user2 = matchedUser.email; //It is in the form of email

    const compatibilityScore = Math.floor(Math.random() * 100);

    const matchData = await Match({
      user1: user1,
      user2: user2,
      compatibilityScore,
    });

    await matchData.save();

    await User.updateMany(
      { email: { $in: [user1, user2] } },
      { $set: { status: "matched", messages: [] } }
    );

    // console.log("Matched data", {
    //   user1: user1,
    //   user2: user2,
    //   compatibilityScore,
    // });

    return true;
  } catch (err) {
    console.error("Error fetching users:", err);
    throw err;
  }
}
