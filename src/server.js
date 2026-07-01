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

// Socket events pour les clients connectés. Ces événements sont déclenchés par les actions des joueurs dans le jeu (ex: rejoindre un jeu, répondre à une question, etc.).
io.on("connection", (socket) => {
  console.log(`Client connecté: ${socket.id}`);

  // Join the Socket.IO rooms used by the game HTTP events.
  // action : join-contest, join-game, disconnect appelé quand frontend fait un socket.emit("join-contest", contestId) ou socket.emit("join-game", gameId)
  socket.on("join-contest", (contestId) => {
    socket.join(contestId);
    socket.join(`game:${contestId}`);
  });

  socket.on("join-game", (gameId) => {
    socket.join(gameId);
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
