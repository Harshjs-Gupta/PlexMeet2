// @ts-check
import { Server as SocketIOServer } from "socket.io";

/**
 * @typedef {Object} JoinRoomData
 * @property {string} email
 * @property {string} roomCode
 */

/**
 * @typedef {Object} CallOfferData
 * @property {string} to
 * @property {RTCSessionDescriptionInit} offer
 */

/**
 * @typedef {Object} CallAnswerData
 * @property {string} to
 * @property {RTCSessionDescriptionInit} answer
 */

// Store for user connections
const emailToSocketIdMap = new Map();
const socketIdToEmailMap = new Map();

// Socket.io server instance
/** @type {SocketIOServer|null} */
let io = null;

/**
 * Initialize the Socket.io server
 * @param {import("http").Server} server - HTTP server instance
 * @returns {SocketIOServer} Socket.io server instance
 */
export function initSocketServer(server) {
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

      socket.on("room:join", (data) => {
        console.log(data);
        const { email, roomCode } = data;
        emailToSocketIdMap.set(email, socket.id);
        socketIdToEmailMap.set(socket.id, email);
        io?.to(roomCode).emit("user:joined", { email, id: socket.id });
        socket.join(roomCode);
        io?.to(socket.id).emit("room:join", data);
      });

      socket.on("user:call", ({ to, offer }) => {
        io?.to(to).emit("incoming:call", { from: socket.id, offer });
      });

      socket.on("call:accepted", ({ to, answer }) => {
        io?.to(to).emit("call:accepted", { from: socket.id, answer });
      });

      socket.on("peer:negotiation:needed", ({ to, offer }) => {
        io?.to(to).emit("peer:negotiation:needed", { from: socket.id, offer });
      });

      socket.on("peer:nego:done", ({ to, answer }) => {
        io?.to(to).emit("peer:nego:final", { from: socket.id, answer });
      });
    });
  }

  return io;
}
