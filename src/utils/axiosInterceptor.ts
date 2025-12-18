// axiosInterceptor.ts
import type { AxiosRequestConfig } from "axios";
import { api } from "../api";


let isInterceptorSet = false;

// Clerk's getToken type
type GetToken = (options?: { template?: string }) => Promise<string | null>;

export const attachAuthInterceptor = (getToken: GetToken): void => {
  if (isInterceptorSet) return;
  isInterceptorSet = true;

  api.interceptors.request.use(
    async (config: AxiosRequestConfig) => {
      const token = await getToken();

      if (token) {
        config.headers = {
          ...config.headers,
          Authorization: `Bearer ${token}`,
        };
      }

      return config;
    },
    (error) => Promise.reject(error)
  );
};
