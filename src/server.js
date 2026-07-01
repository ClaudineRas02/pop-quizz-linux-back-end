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

app.locals.io = io;

//connect to socket.io
io.on("connection", (socket) => {
  console.log(`Client connecté: ${socket.id}`);
  //room lobby: pour tous les clients connectés, pour les notifications de parties
  socket.join("lobby");

  //room game: pour les clients connectés à une partie spécifique, pour les notifications de la partie
  socket.on("join-game", (gameId) => {
    socket.join(`game:${gameId}`);
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
