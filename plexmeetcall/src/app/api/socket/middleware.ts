import { NextApiRequest, NextApiResponse } from "next";
import { Server as ServerIO } from "socket.io";
import { Server as HTTPServer } from "http";

// Define a type for the Socket.io server
export type SocketServer = NextApiResponse & {
  socket: {
    server: HTTPServer & {
      io?: ServerIO;
    };
  };
};

// Define the middleware function to set up Socket.io
export const socketMiddleware = async (
  req: NextApiRequest,
  res: SocketServer
) => {
  // Skip if Socket.io server is already running
  if (res.socket.server.io) {
    res.end();
    return;
  }

  // Maps to store connection data
  const emailToSocketIdMap = new Map<string, string>();
  const socketIdToEmailMap = new Map<string, string>();

  // Create Socket.io server
  const io = new ServerIO(res.socket.server, {
    path: "/api/socket/io",
    addTrailingSlash: false,
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  // Set up Socket.io event handlers
  io.on("connection", (socket) => {
    console.log("Socket connected", socket.id);

    socket.on("room:join", (data) => {
      console.log(data);
      const { email, roomCode } = data;
      emailToSocketIdMap.set(email, socket.id);
      socketIdToEmailMap.set(socket.id, email);
      io.to(roomCode).emit("user:joined", { email, id: socket.id });
      socket.join(roomCode);
      io.to(socket.id).emit("room:join", data);
    });

    socket.on("user:call", ({ to, offer }) => {
      io.to(to).emit("incoming:call", { from: socket.id, offer });
    });

    socket.on("call:accepted", ({ to, answer }) => {
      io.to(to).emit("call:accepted", { from: socket.id, answer });
    });

    socket.on("peer:negotiation:needed", ({ to, offer }) => {
      io.to(to).emit("peer:negotiation:needed", { from: socket.id, offer });
    });

    socket.on("peer:nego:done", ({ to, answer }) => {
      io.to(to).emit("peer:nego:final", { from: socket.id, answer });
    });
  });

  // Set Socket.io server on response object
  res.socket.server.io = io;

  // End the response
  res.end();
};
