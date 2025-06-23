import { GoogleGenerativeAI } from "@google/generative-ai";
import { getUserByEmail } from "../data/user.js";
import { User } from "../models/User.js";
import { Match } from "../models/Match..js";

const genAI = new GoogleGenerativeAI("AIzaSyBv1hdbmsSlMR-OjS9hBHvFe7jMDdGPO_Y");
const model = genAI.getGenerativeModel({ model: "embedding-001" });


const cosineSimilarity = (a, b) => {
    const dot = a.reduce((sum, ai, i) => sum + ai * b[i], 0);
    const magA = Math.sqrt(a.reduce((sum, ai) => sum + ai * ai, 0));
    const magB = Math.sqrt(b.reduce((sum, bi) => sum + bi * bi, 0));
    return dot / (magA * magB);
};

export const createMatch = async (email) => {
    try {
        const user = await getUserByEmail(email)
        if (!user) return "User not found";

        const bioEmbedding = await model.embedContent({
            content: { parts: [{ text: user.bio }] },
            taskType: "RETRIEVAL_QUERY"
        })

        const moodembedding = await model.embedContent({
            content: { parts: [{ text: user.mood }] },
            taskType: "RETRIEVAL_QUERY"
        });

        const oppositeGender = user.gender === 'male' ? 'female' : 'male';
        const candidates = await User.find({ gender: oppositeGender });

        const results = candidates.map(candidate => {
            let score = 0;

            // embedding similarity
            const bioScore = cosineSimilarity(bioEmbedding.embedding.values, candidate.bioEmbedding || []);
            const moodScore = cosineSimilarity(moodembedding.embedding.values, candidate.moodembedding || []);

            score += bioScore * 5 + moodScore * 3;

            return { ...candidate.toObject(), matchScore: score.toFixed(4) };
        }).sort((a, b) => parseFloat(b.matchScore) - parseFloat(a.matchScore)).slice(0, 3);

        const result = results[0];


        try {
            const Macthed = new Match({ user1: user?._id, user2: result?._id , compatibilityScore: result?.matchScore, isPinned: true })
            const saved = await Macthed.save();

            return { success: true, message: saved,  };

        } catch (error) {
            return { success: false, message: error.message };
        }

        // return { success: true, results, user1: user?._id };


    } catch (error) {
        return { success: false, message: error.message };
    }
}