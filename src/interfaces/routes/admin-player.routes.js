import { Router } from "express";
import { adaptRoute } from "../../shared/express-route-adapter.js";
import { requireAuth } from "../../infrastructure/http/middlewares/auth.middleware.js";

export function createAdminPlayerRoutes(playerController) {
  const router = Router();

  router.use(requireAuth);
  // router.use(requireRole("admin"));

  /**
   * LIST ALL PLAYERS
   * GET /admin/players/
   */
  router.get(
    "/list",
    adaptRoute(playerController.listPlayers)
  );

  /**
   * GET PLAYER BY ID
   * GET /admin/players/:playerId
   */
  router.get(
    "/:playerId",
    adaptRoute(playerController.getPlayerById)
  );

  /**
   * UPDATE PLAYER AVATAR
   * PATCH /admin/players/:playerId/avatar
   */
  router.patch(
    "/:playerId/avatar",
    adaptRoute(playerController.updatePlayerAvatar)
  );

  /**
   * DELETE PLAYER (option admin)
   * DELETE /admin/players/delete/:playerId
   */
  router.delete(
    "/delete/:playerId",
    adaptRoute(playerController.deletePlayer)
  );

  return router;
}