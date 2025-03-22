"use client";
import { createContext, useContext, useMemo, ReactNode } from "react";
import { io, Socket } from "socket.io-client";

// Type definition for the socket context value
interface SocketContextType {
  socket: Socket | null;
}

const SocketContext = createContext<SocketContextType | null>(null); // Default value is null

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context.socket;
};

interface SocketProviderProps {
  children: ReactNode;
}

export const SocketProvider = ({ children }: SocketProviderProps) => {
  // Use environment variables for server URL or fallback to local development URL
  const socketServerUrl =
    process.env.NEXT_PUBLIC_SOCKET_SERVER_URL ||
    (typeof window !== "undefined"
      ? window.location.origin
      : "http://localhost:3000");

  const socket = useMemo(() => {
    // In development, use the same server with Socket.io path
    return io(socketServerUrl, {
      path: "/api/socket/io",
    });
  }, [socketServerUrl]);

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};
