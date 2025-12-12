// socket.ts
import { useRef } from "react";
import { io } from "socket.io-client";

export function useSocket() {
  const socketRef = useRef(
    io("http://localhost:5000", {
      transports: ["websocket", "polling"],
      reconnectionAttempts: 5, // stop retrying after 5 attempts
      reconnectionDelay: 1000,
      autoConnect: true,
    })
  );

  return socketRef.current;
}
