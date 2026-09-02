import { Router } from "express";
import { adaptRoute } from "../../shared/express-route-adapter.js";

export function createAuthRoutes(authController) {
  const router = Router();

  router.post(
    "/register",
    adaptRoute(authController.register),
  );

  router.post(
    "/login",
    adaptRoute(authController.login),
  );

  return router;
}
