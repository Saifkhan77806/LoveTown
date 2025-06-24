import { Match } from "../models/Match..js"


export const findMatchByEmail = async (email) => {
    try {
        const match = await Match.findOne({ user1: email });

        return match
    } catch (err) {
        return
    }
}

export const findMatchById = async (id) => {
    try {
        const match = await Match.findById(id);
        return match
    } catch (err) {
        return
    }
}