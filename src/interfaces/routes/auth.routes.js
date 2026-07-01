import { Router } from "express";
import { adaptRoute } from "../../shared/express-route-adapter.js";

export function createAuthRoutes(playerController) {
  const router = Router();

  router.post(
    "/register",
    adaptRoute(playerController.register),
  );

  router.post(
    "/login",
    adaptRoute(playerController.login),
  );

  return router;
}