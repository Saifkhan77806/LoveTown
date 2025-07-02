import { useUser } from "@clerk/clerk-react";
import axios from "axios";
import React, { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { Result, User, UserContextType } from "../types";


const UserContext = createContext<UserContextType>({ users: null, loading: true, updateStatus: () => { }, status: null });


export const UserProvider = ({ children }: { children: ReactNode }) => {

    const [users, setUser] = React.useState<User | null>(null)
    const [status, setStatus] = useState<string | null>(null);
    const [loading, setLoading] = useState(true)
    const { user, isLoaded } = useUser()

    useEffect(() => {
        if (!isLoaded || !user) return; // 🛑 Wait until user is loaded
        const email = user.emailAddresses?.[0]?.emailAddress;

        if (!email) {
            setLoading(false);
            return;
        }

        const fetchMatchUser = async (email: string): Promise<Result> => {
            try {
                const res = await axios.get(`http://localhost:5000/match-user/${email}`);

                if (res.status !== 200) {
                    throw new Error(`Failed to fetch user data: ${res.statusText}`);
                }

                const data = res.data;

               
                setUser(data);

                if (data?.user2?.email === email) {
                    setUser({
                        ...users,
                        user1: data?.user2,
                        user2: data?.user1,
                        status: data?.status,
                        compatibilityScore: data?.compatibilityScore,
                        matchedAt: data?.matchedAt,
                    });

                    setStatus(data?.status);
                }

                return {
                    message: "User data loaded successfully",
                    status: false,
                };
            } catch (err) {
                console.error("Something went wrong during loading user data", err);
                return {
                    message: "Failed to load user data",
                    status: false,
                };
            } finally {
                setLoading(false);
            }
        };

        const fetchUser = async (email: string): Promise<Result> => {
            try {
                const res = await axios.get(`http://localhost:5000/get-user-status/${email}`);

                if (res.status === 200) {
                    const userData = res.data;

                    console.log("useEffect userData status", res.data);

                    setStatus(userData.data);
                    

                    return {
                        message: "User data status loaded successfully",
                        status: true,
                    };
                } else {
                    throw new Error(`Failed to fetch user data: ${res.statusText}`);
                }
            } catch (err) {
                console.error("Something went wrong during loading user data", err);
                return {
                    message: "Failed to load user data",
                    status: false,
                };
            }
        };



        fetchMatchUser(email).then((result: Result) => {

            if (result.status) {
                console.log(result.message);
            }else{
                console.error(result.message);

                fetchUser(email).then((result: Result) => {
                    if (result.status) {
                        console.log(result.message);
                    } else {
                        console.error(result.message);
                    }
                }).catch((error) => {
                    console.error("Error fetching user data:", error);
                });
            }

           

        }).catch((error) => {
            console.error("Error fetching user data:", error);
        }
        );



    }, [isLoaded, user]);

    const updateStatus = () => {

        if (users) {

            axios.put(`http://localhost:5000/update-user-status-move-on/${(users as User).user1?._id}/${(users as User).user2?._id}`).then((res) => {
                console.log("Status updated successfully", res.data);
                if (users) {
                    setUser({ ...(users || {}), status: "move-on" });

                }
            }).catch((err) => {

                console.error("Error updating status:", err);
            }
            )
        }


        console.log("updateStatus called with status:", users);

    }





    return (
        <UserContext.Provider value={{ users, loading, updateStatus, status }}>
            {children}
        </UserContext.Provider>
    )

}

export const useMatchUser = () => useContext(UserContext);