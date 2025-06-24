import { User } from "../models/User.js";

export const getUserByEmail = async (email) => {
    if (!email) return "Email not found";
    try {
        const user = await User.findOne({ email });
        return user;

    } catch (err) {
        return 
    }
}

export const getUserByEmailwithoutEmbd = async (email) => {
    if (!email) return "Email not found";
    try {
        const user = await User.findOne({ email }).select('-bioEmbedding -moodembedding');
        return user;

    } catch (err) {
        return 
    }
}

export const getUserById = async (id) => {
    if (!id) return "Id not found";
    try {
        const user = await User.findById(id);
        return user;
    } catch (err) {
        return 
    }
}

export const getUserByIdWithoutEmbd = async (id) => {
    if (!id) return "Id not found";
    try {
        const user = await User.findById(id).select('-bioEmbedding -moodembedding');
        return user;
    } catch (err) {
        return 
    }
}
