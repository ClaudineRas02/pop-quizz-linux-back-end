import { Router } from "express";
import { lazyRouteMount } from "../../shared/lazy-route-mount.js";

// Routeur admin global.
// Toutes les routes montees ici doivent etre protegees dans leurs fichiers dedies.
export function createAdminRoutes(modules) {
  const router = Router();

  router.use(
    "/",
    lazyRouteMount(() => modules.admin.getAdminRoutes()),
  );

  router.use(
    "/game",
    lazyRouteMount(() => modules.game.getAdminRoutes()),
  );

  router.use(
    "/players",
    lazyRouteMount(() => modules.player.getAdminRoutes()),
  );

  router.use(
    "/questions",
    lazyRouteMount(() => modules.question.getAdminRoutes()),
  );

  return router;
}
