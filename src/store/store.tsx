import { useUser } from "@clerk/clerk-react";
import axios from "axios";
import React, { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { UserContextType } from "../types";


const UserContext = createContext<UserContextType>({ users: null, loading: true });


export const UserProvider = ({ children }: { children: ReactNode }) => {

    const [users, setUser] = React.useState(null)
    const [loading, setLoading] = useState(true)
    const { user, isLoaded } = useUser()

    useEffect(() => {
        if (!isLoaded || !user) return; // 🛑 Wait until user is loaded

        const email = user.emailAddresses?.[0]?.emailAddress;

        if (!email) {
            setLoading(false);
            return;
        }


        const fetchUser = async (email: string) => {
            try {

                axios.get(`http://localhost:5000/match-user/${email}`).then((res) => {
                    setUser(res.data);
                    if (res.data?.user2?.email == email) {
                        setUser({...users,user1: res.data?.user2, user2: res.data?.user1, status: res.data?.status, compatibilityScore: res.data?.compatibilityScore, matchedAt: res.data?.matchedAt})
                    }
                    // console.log("it is from store.tsx useEffect", res.data);
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