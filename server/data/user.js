import { User } from "../models/User.js";

export const getUserByEmail = async (email) =>{
    if(!email) return "Email not found";
    try{

        const user = await User.findOne({email});
        return user;


    }catch(err){
        return err
    }
}
