import { Router } from "express";
import { lazyRouteMount } from "../../shared/lazy-route-mount.js";

// Routeur admin global.
// Toutes les routes montees ici doivent etre protegees dans leurs fichiers dedies.
export function createAdminRoutes(modules) {
  const router = Router();

  router.use(
    "/admin",
    lazyRouteMount(() => modules.adminuser.getAdminRoutes()),
  );
  router.use(
    "/game",
    lazyRouteMount(() => modules.game.getAdminRoutes()),
  );

  return router;
}
