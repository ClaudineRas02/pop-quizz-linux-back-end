import { Router } from "express";
import { adaptRoute } from "../../shared/express-route-adapter.js";
import { requireAuth } from "../../infrastructure/http/middlewares/auth.middleware.js";
import { requireAdmin } from "../../infrastructure/http/middlewares/admin-auth.middleware.js";
export function createAdminGameRoutes(gameController) {
  const router = Router();

  router.use(requireAuth);
  router.use(requireAdmin);

  // listes toutes les parties : en attente, en cours, terminées
  router.get("/list", adaptRoute(gameController.listGames));
  // recup une partie par son id
  router.get("/view/:gameId", adaptRoute(gameController.getGameById));
  //crée une partie + ret admin et event pour joueurs
  router.post("/create", adaptRoute(gameController.createGame));
  // met à jour une partie
  router.patch("/update/:gameId", adaptRoute(gameController.updateGame));
  // supprime une partie
  router.delete("/delete/:gameId", adaptRoute(gameController.deleteGame));
  // démarre une partie: màj start_time et status
  router.post("/:gameId/start", adaptRoute(gameController.startGame));
  // fermer la question courante (temps ecoule ou tous ont repondu)
  router.patch(
    "/:gameId/questions/current/close",
    adaptRoute(gameController.closeCurrentQuestion),
  );
  // consulter les stats de la question courante fermee
  router.get(
    "/:gameId/questions/current/stats",
    adaptRoute(gameController.getCurrentQuestionStats),
  );
  // marquer les stats comme vues
  router.patch(
    "/questions/:questionId/stats/viewed",
    adaptRoute(gameController.markStatsViewed),
  );
  // ouvrir la prochaine question
  router.post(
    "/:gameId/questions/next",
    adaptRoute(gameController.openNextQuestion),
  );
  // termine une partie: màj end_time et status
  router.post("/:gameId/end", adaptRoute(gameController.endGame));
  // recup les résultats d'une partie + 2fa
  router.get("/:gameId/results", adaptRoute(gameController.getResults));

  return router;
}
