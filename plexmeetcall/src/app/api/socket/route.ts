import { Server } from "socket.io";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { Socket } from "socket.io";

// Interface definitions
interface JoinData {
  email: string;
  roomCode: string;
}

interface CallData {
  to: string;
  offer: RTCSessionDescriptionInit;
}

interface AnswerData {
  to: string;
  answer: RTCSessionDescriptionInit;
}

// Maps to store connection data
const emailToSocketIdMap = new Map<string, string>();
const socketIdToEmailMap = new Map<string, string>();
let io: Server | null = null;

// This function handles the actual Socket.io logic
function setupSocketServer(
  req: NextRequest,
  res: {
    socket: {
      server: any;
    };
  }
) {
  if (!io) {
    // Create Socket.io server
    io = new Server(res.socket.server, {
      path: "/api/socket/io",
      addTrailingSlash: false,
      cors: {
        origin: "*",
        methods: ["GET", "POST"],
      },
    });

    // Set up Socket.io event handlers
    io.on("connection", (socket: Socket) => {
      console.log("Socket connected", socket.id);

      socket.on("room:join", (data: JoinData) => {
        console.log(data);
        const { email, roomCode } = data;
        emailToSocketIdMap.set(email, socket.id);
        socketIdToEmailMap.set(socket.id, email);
        io?.to(roomCode).emit("user:joined", { email, id: socket.id });
        socket.join(roomCode);
        io?.to(socket.id).emit("room:join", data);
      });

      socket.on("user:call", ({ to, offer }: CallData) => {
        io?.to(to).emit("incoming:call", { from: socket.id, offer });
      });

      socket.on("call:accepted", ({ to, answer }: AnswerData) => {
        io?.to(to).emit("call:accepted", { from: socket.id, answer });
      });

      socket.on("peer:negotiation:needed", ({ to, offer }: CallData) => {
        io?.to(to).emit("peer:negotiation:needed", { from: socket.id, offer });
      });

      socket.on("peer:nego:done", ({ to, answer }: AnswerData) => {
        io?.to(to).emit("peer:nego:final", { from: socket.id, answer });
      });
    });

    // Add Socket.io to the response object
    res.socket.server.io = io;
  }
}

// Export GET handler
export async function GET(req: NextRequest) {
  // Note: The setupSocketServer function is not called here because
  // it would require HTTP server modifications that are handled separately
  // in the middleware file
  return new NextResponse("Socket.io server running", { status: 200 });
}

// Export a global config for the Edge API route
export const config = {
  api: {
    bodyParser: false,
  },
};
