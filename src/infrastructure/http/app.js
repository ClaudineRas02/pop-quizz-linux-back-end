import express from "express";
import cors from "cors";

import { createAdminRoutes } from "../../interfaces/routes/admin.routes.js";
import { createPublicRoutes } from "../../interfaces/routes/public.routes.js";
import { createApplicationModules } from "../modules/index.js";
import { errorMiddleware } from "./middlewares/error.middleware.js";
import { createOpenApiRoutes } from "./docs/openapi.js";
import { env } from "../config/env.js";

export function createApp() {
  const app = express();

  // Body parser
  app.use(express.json());

  // CORS configuration
  app.use(
    cors({
      origin: isAllowedOrigin,
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
      allowedHeaders: ["Content-Type", "Authorization", "X-Admin-Token"],
    })
  );

  // Dependency injection container (domain + infra services)
  const modules = createApplicationModules();

  // API documentation (Swagger/OpenAPI)
  createOpenApiRoutes(app);

  // Public API (users, quizzes, submissions)
  app.use("/api", createPublicRoutes(modules));

  // Admin API (manage quizzes, stats, users)
  app.use("/api/admin", createAdminRoutes(modules));

  // Health check (monitoring / docker / deployment)
  app.get("/health", (req, res) => {
    res.status(200).json({
      status: "ok",
      service: "pop-quizz-api",
    });
  });

  // Global error handler (must be last)
  app.use(errorMiddleware);

  return app;
}

// CORS whitelist logic
function isAllowedOrigin(origin, callback) {
  const allowed = env.corsOrigins || [];

  if (!origin || allowed.includes("*") || allowed.includes(origin)) {
    return callback(null, true);
  }

  return callback(new Error("Origin non autorisée par CORS"));
}