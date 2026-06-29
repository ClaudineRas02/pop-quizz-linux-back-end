import dotenv from "dotenv";

dotenv.config();

/**
 * Parse une variable CSV du type:
 * "http://localhost:5173,http://localhost:3000"
 */
function parseCsv(value = "") {
  return value
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
}

/**
 * Configuration centralisée de l'application
 * → unique source de vérité pour les variables d'environnement
 */
export const env = {
  // Server
  port: Number(process.env.PORT || 3000),
  nodeEnv: process.env.NODE_ENV || "development",

  // Database
  databaseUrl: process.env.DATABASE_URL,

  // Auth
  jwtSecret: process.env.JWT_SECRET,
  adminToken: process.env.ADMIN_TOKEN,
  accessTokenExp: process.env.ACCESS_TOKEN_EXP || "900s",

  // CORS
  corsOrigins: parseCsv(process.env.CORS_ORIGINS),

  // Helpers (optionnel mais utile)
  isDev: process.env.NODE_ENV === "development",
  isProd: process.env.NODE_ENV === "production",
};