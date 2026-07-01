import { Router } from "express";
import { adaptRoute } from "../../shared/express-route-adapter.js";
import { requireAuth } from "../../infrastructure/http/middlewares/auth.middleware.js";

export function createAdminGameRoutes(gameController) {
  const router = Router();

  router.use(requireAuth);
  //   router.use(requireRole("admin"));
  router.get("/list", adaptRoute(gameController.listGames));
  router.get("/view/:gameId", adaptRoute(gameController.getGameById));
  router.post("/create", adaptRoute(gameController.createGame));
  router.patch("/update/:gameId", adaptRoute(gameController.updateGame));
  router.delete("/delete/:gameId", adaptRoute(gameController.deleteGame));
  router.post("/:gameId/start", adaptRoute(gameController.startGame));
  router.post("/:gameId/end", adaptRoute(gameController.endGame));
  router.get("/:gameId/results", adaptRoute(gameController.getResults));

  return router;
}
