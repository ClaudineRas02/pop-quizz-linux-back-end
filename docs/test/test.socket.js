// test-socket.js

import { io } from "socket.io-client";

const socket = io("http://localhost:3000");

socket.on("connect", () => {
  console.log("Connecté :", socket.id);
  socket.emit("join-game", 24);
});

socket.on("disconnect", () => {
  console.log("Déconnecté :", socket.id);
});

socket.on("created-game", (data) => {
  console.log("game créée :", data);
});

socket.on("game:created", (game) => {
  console.log("Nouvelle partie");
  console.log(game);
});

socket.on("game:started", (game) => {
  console.log("Partie démarrée");
  console.log(game);
});

socket.on("show-leaderboard", (data) => {
  console.log(data.message);
});

//game:participant-joined
socket.on("game:participant-joined", (data) => {
  console.log("Nouveau participant");
  console.log(data);
});

socket.on("question:opened", (data) => {
  console.log("Question ouverte");
  console.log(data);
});

socket.on("question:closed", (data) => {
  console.log("Question fermée");
  console.log(data);
});

socket.on("game:ended", (data) => {
  console.log("Partie terminée");
  console.log(data);
});
