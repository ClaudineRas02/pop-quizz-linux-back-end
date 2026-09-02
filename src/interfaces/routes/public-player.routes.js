import { Router } from "express";
import { adaptRoute } from "../../shared/express-route-adapter.js";
import { requireAuth } from "../../infrastructure/http/middlewares/auth.middleware.js"

export function createPlayerRoutes(playerController) {
  const router = Router();

  router.get(
    "/me",
    requireAuth,
    adaptRoute(playerController.getMe),
  );

  return router;
}