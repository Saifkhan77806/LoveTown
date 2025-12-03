import { User } from "../models/User.js";

export const getUserByEmail = async (email, isEmbedding = false) => {
  try {
    // console.log("isEmbedding:", isEmbedding, "email:", email);

    let query = User.findOne({ email });

    if (!isEmbedding) {
      // exclude embeddings
      query = query.select("-bioEmbedding -moodembedding");
    }

    const user = await query.lean().exec();

    // console.log("user", user);

    if (user) return { user, success: true };
    return { user: null, success: false, message: "user not found" };
  } catch (error) {
    console.error("user fetch error", error);
    return { error, success: false, message: "something went wrong" };
  }
};

export const getUserByEmailwithoutEmbd = async (email) => {
  if (!email) return "Email not found";
  try {
    const user = await User.findOne({ email }).select(
      "-bioEmbedding -moodembedding"
    );
    return user;
  } catch (err) {
    return;
  }
};

export const getUserById = async (id) => {
  if (!id) return "Id not found";
  try {
    const user = await User.findById(id);
    return user;
  } catch (err) {
    return;
  }
};

export const getUserByIdWithoutEmbd = async (id) => {
  if (!id) return "Id not found";
  try {
    const user = await User.findById(id).select("-bioEmbedding -moodembedding");
    return user;
  } catch (err) {
    return;
  }
};
