// AxiosAuthProvider.tsx
import { useAuth } from "@clerk/clerk-react";
import { useEffect } from "react";
import { attachAuthInterceptor } from "../utils/axiosInterceptor";


export const AxiosAuthProvider: React.FC = () => {
  const { getToken } = useAuth();

  useEffect(() => {
    attachAuthInterceptor(getToken);
  }, [getToken]);

  return null;
};
