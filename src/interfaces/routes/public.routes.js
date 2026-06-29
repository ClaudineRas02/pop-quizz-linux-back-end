import { Router } from "express";
import { lazyRouteMount } from "../../shared/lazy-route-mount.js";

// Routeur public global.
// On y branche les routes accessibles sans authentification admin.
export function createPublicRoutes(modules) {
  const router = Router();

  return router;
}
