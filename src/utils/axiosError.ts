// utils/getErrorMessage.ts
import axios from "axios";

/**
 * Return a readable error message for Axios errors and non-Axios errors.
 * Always accepts `unknown` (safe for catch blocks).
 */
export const getErrorMessage = (error: unknown): string => {
  // axios.isAxiosError is the correct way to detect Axios errors
  if (axios.isAxiosError(error)) {
    // Log the full AxiosError for debugging
    console.error("Axios error:", error);

    // Prefer the server-provided message, then the Axios message, then a default
    // Note: error.response may be undefined for network errors
    return (
      // Some backends put message at error.response.data.message
      (error.response?.data as { message?: string } | undefined)?.message ??
      // axios's own message (e.g., 'Request failed with status code 404')
      error.message ??
      "Something went wrong"
    );
  }

  // Not an Axios error — maybe a plain Error, string, or something else
  console.error("Non-Axios error:", error);

  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  return "Unexpected error";
};
