// This file enables Socket.io to work with Next.js in a production environment
import { createServer } from "http";
import next from "next";
import { Server } from "socket.io";

const port = parseInt(process.env.PORT || "3000", 10);
const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

// Maps to store connection data
const emailToSocketIdMap = new Map();
const socketIdToEmailMap = new Map();

app.prepare().then(() => {
  const server = createServer((req, res) => {
    // API route to handle Socket.io
    if (req.url && req.url.startsWith("/api/socket")) {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ message: "Socket.io server running" }));
      return;
    }

    // Let Next.js handle all other routes
    handle(req, res);
  });

  // Initialize Socket.io
  const io = new Server(server, {
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

  server.listen(port, () => {
    console.log(`> Ready on http://localhost:${port}`);
  });
});
