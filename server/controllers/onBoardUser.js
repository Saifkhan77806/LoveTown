import { getFilteredUsersByEmail } from "../data/match.js";
import { scheduleJob } from "../helper/cronManager.js";
import { Match } from "../models/Match.js";
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
    const userdata = await User.findOne({ email }).select("status email");
    let status = "onboarding";
    let time = 2;
    let matchedUserEmail;

    const isFrozen = userdata?._doc;
    console.log("frozen", isFrozen, userdata);
    const mydata = { ...isFrozen };

    console.log("mydata email:-", mydata.email, "status", mydata.status);

    if (mydata.status === "matched" || mydata.status === "chatting") {
      const matchedUser = await Match.findOne({
        $or: [{ user1: mydata.email }, { user2: mydata.email }],
      });

      if (!matchedUser) {
        return res.status(404).json({
          message: "matches not found",
        });
      }
      matchedUserEmail =
        matchedUser.user1 === mydata.email
          ? matchedUser.user2
          : matchedUser.user1;

      await User.findOneAndUpdate(
        { email: matchedUserEmail },
        {
          $set: { status: "breakup" },
          $inc: { matchesCount: 1 },
        },
        { new: true }
      );

      await User.findOneAndUpdate(
        { email: mydata.email },
        {
          $set: { status: "frozen" },
          $inc: { matchesCount: 1 },
        },
        { new: true }
      );

      await Match.findOneAndDelete({
        $or: [{ user1: mydata.email }, { user2: mydata.email }],
      });

      return res.status(200).json({
        messgae: "now your frozen and your partner broke up!",
      });
    }

    if (
      mydata.status == "frozen" ||
      mydata.status == "chatting" ||
      mydata.status == "matched"
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

    scheduleJob(user._id, 1, async () => {
      await getFilteredUsersByEmail(email);
    });

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
