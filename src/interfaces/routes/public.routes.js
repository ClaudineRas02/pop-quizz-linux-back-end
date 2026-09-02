import { Router } from "express";
import { lazyRouteMount } from "../../shared/lazy-route-mount.js";

// Routeur public global.
// On y branche les routes accessibles sans authentification admin.
export function createPublicRoutes(modules) {
  const router = Router();

  router.use(
    "/game",
    lazyRouteMount(() => modules.game.getPublicRoutes()),
  );
  router.use(
    "/auth",
    lazyRouteMount(() => modules.auth.getPublicRoutes()),
  );

  router.use(
    "/player",
    lazyRouteMount(() => modules.player.getPublicRoutes()),
  );

  return router;
}
