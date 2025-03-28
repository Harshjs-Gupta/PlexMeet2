import { Server as SocketIOServer } from "socket.io";
import { Server as HttpServer } from "http";

// Types for Socket.io events
interface JoinRoomData {
  email: string;
  roomCode: string;
}

interface CallOfferData {
  to: string;
  offer: RTCSessionDescriptionInit;
}

interface CallAnswerData {
  to: string;
  answer: RTCSessionDescriptionInit;
}

// Store for user connections
const emailToSocketIdMap = new Map<string, string>();
const socketIdToEmailMap = new Map<string, string>();

// Socket.io server instance
let io: SocketIOServer;

// Export the function to be used in a custom server (server.js or server-prod.js)
export function initSocketServer(server: HttpServer) {
  if (!io) {
    console.log("Initialize Socket.io server");

    io = new SocketIOServer(server, {
      path: "/api/socket/io",
      addTrailingSlash: false,
      cors: {
        origin: "*",
        methods: ["GET", "POST"],
      },
    });

    io.on("connection", (socket) => {
      console.log("Socket connected", socket.id);

      socket.on("room:join", (data: JoinRoomData) => {
        console.log(data);
        const { email, roomCode } = data;
        emailToSocketIdMap.set(email, socket.id);
        socketIdToEmailMap.set(socket.id, email);
        io.to(roomCode).emit("user:joined", { email, id: socket.id });
        socket.join(roomCode);
        io.to(socket.id).emit("room:join", data);
      });

      socket.on("user:call", ({ to, offer }: CallOfferData) => {
        io.to(to).emit("incoming:call", { from: socket.id, offer });
      });

      socket.on("call:accepted", ({ to, answer }: CallAnswerData) => {
        io.to(to).emit("call:accepted", { from: socket.id, answer });
      });

      socket.on("peer:negotiation:needed", ({ to, offer }: CallOfferData) => {
        io.to(to).emit("peer:negotiation:needed", { from: socket.id, offer });
      });

      socket.on("peer:nego:done", ({ to, answer }: CallAnswerData) => {
        io.to(to).emit("peer:nego:final", { from: socket.id, answer });
      });
    });
  }

  return io;
}
