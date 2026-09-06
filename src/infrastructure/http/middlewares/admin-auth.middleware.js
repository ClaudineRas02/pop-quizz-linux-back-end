import jwt from "jsonwebtoken";
import { env } from "../../config/env.js";

function extractBearerToken(req) {
  const authHeader = req.headers["authorization"];
  if (!authHeader) return null;

  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") return null;

  return parts[1];
}

export function requireAdmin(req, res, next) {
  const token = extractBearerToken(req);

  if (!token) {
    return res.status(401).json({
      message: "Token manquant",
    });
  }

  try {
    const payload = jwt.verify(token, env.jwtSecret);

    // ⚠️ sécurité admin obligatoire
    if (payload.role !== "admin") {
      return res.status(403).json({
        message: "Accès interdit (admin uniquement)",
      });
    }

    req.user = {
      adminId: payload.adminId, // IMPORTANT: adminId côté JWT
      email: payload.email,
      role: payload.role,
    };

    next();
  } catch (err) {
    return res.status(401).json({
      message: "Token invalide",
      error: err.message,
    });
  }
}
