import { useUser } from "@clerk/clerk-react"
import { genericRoutes, protectedRoutes } from "./routes/route";
import { useNavigate } from "react-router-dom";


export const Middleware = (url: string) =>{

    const {isSignedIn} = useUser();
    const navigate = useNavigate()

    if(isSignedIn){
        if(!protectedRoutes.includes(url)){
            navigate("/login")
            return 
        }else{
            return 
        }
    }else{
        if(!genericRoutes.includes(url)){
            navigate("/dashboard")
            return 
        }else{
            return 
        }
    }



    

}