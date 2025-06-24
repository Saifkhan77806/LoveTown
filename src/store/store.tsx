import { useUser } from "@clerk/clerk-react";
import axios from "axios";
import React, { createContext, ReactNode, useContext, useEffect, useState } from "react";

interface User {
    user1: user1;
    user2: user1;
    status: string;
    compatibilityScore: number;
    matchedAt: string;
}

interface user1 {
    _id: string;
    name: string;
    email: string;
    photos: string[];
    interests: string[];
    values: string[];
    createdAt: string;
    updatedAt: string;
    age: number;
    bio: string;
    communicationStyle: string;
    location: string;
    personalityType: string;
    relationshipGoals: string;
    gender: Gender;
    mood: string;
    status: string
}

enum Gender {
    male,
    female,
}

interface UserContextType {
    users: User | null;
    loading: boolean;
}

const UserContext = createContext<UserContextType>({ users: null, loading: true });


export const UserProvider = ({ children }: { children: ReactNode }) => {

    const [users, setUser] = React.useState(null)
    const [loading, setLoading] = useState(true)
    const { user, isLoaded } = useUser()

    useEffect(() => {
        console.log("start");
        if (!isLoaded || !user) return; // 🛑 Wait until user is loaded
        console.log("start 2");

        const email = user.emailAddresses?.[0]?.emailAddress;
        console.log(email)
        if (!email) {
            setLoading(false);
            return;
        }


        const fetchUser = async (email: string) => {
            try {

                axios.get(`http://localhost:5000/match-user/${email}`).then((res) => {
                    setUser(res.data);
                    console.log("it is from store.tsx useEffect", res.data);
                }).catch((err) => {
                    console.log("Something went wrong during loading user data", err);
                    setLoading(false);
                }).finally(() => {
                    setLoading(false);
                }
                )
            } catch (err) {
                console.error(err)
            }
        }

        fetchUser(email)


    }, [isLoaded, user])



    return (
        <UserContext.Provider value={{ users, loading }}>
            {children}
        </UserContext.Provider>
    )

}

export const useMatchUser = () => useContext(UserContext);