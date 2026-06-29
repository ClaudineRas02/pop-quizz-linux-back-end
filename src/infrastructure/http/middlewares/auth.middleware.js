// Middleware d'authentification : vérifie la présence et la validité du token JWT dans les requêtes protégées.
// Si le token est valide, ajoute les infos de l'utilisateur (id, email, role) à req.user pour que les controllers puissent les utiliser.
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
      id: payload.sub,
      email: payload.email,
      role: payload.role,
    };

    next();
  } catch {
    return res.status(401).json({
      message: "Token invalide",
    });
  }
}
