import jwt from "jsonwebtoken";
import { env } from "../../config/env.js";

function extractBearerToken(req) {
  const authHeader = req.headers["authorization"];
  if (!authHeader) return null;

  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") return null;

  return parts[1];
}

export function requireAuth(req, res, next) {
  const token = extractBearerToken(req);

  if (!token) {
    return res.status(401).json({
      message: "Token manquant",
    });
  }

  try {
    const payload = jwt.verify(token, env.jwtSecret);

    req.user = {
      playerId: payload.playerId,
      email: payload.email,
      role: payload.role || "player", // fallback si pas encore géré
    };

    next();
  } catch (err) {
    return res.status(401).json({
      message: "Token invalide",
      error: err.message,
    });
  }
}
