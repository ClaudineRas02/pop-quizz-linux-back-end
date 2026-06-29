import dotenv from "dotenv";
import http from "http";
import { Server } from "socket.io";

import { createApp } from "./infrastructure/http/app.js";

// Load environment variables
dotenv.config();

// Create Express app
const app = createApp();

// Wrap Express in HTTP server (required for Socket.IO)
const server = http.createServer(app);

// Socket.IO setup (real-time features: CP contests, live ranking, chat)
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGINS,
    credentials: true,
  },
});

// Socket events
io.on("connection", (socket) => {
  console.log(`Client connecté: ${socket.id}`);

  // Example: join a live contest room (future CP feature)
  socket.on("join-contest", (contestId) => {
    socket.join(contestId);
  });

  socket.on("disconnect", () => {
    console.log(`Client déconnecté: ${socket.id}`);
  });
});

// Port
const PORT = process.env.PORT || 3000;

// Start server
server.listen(PORT, () => {
  console.log("pop quizz linux api");
  console.log(`http://localhost:${PORT}`);
  console.log("Socket.IO enabled");
});