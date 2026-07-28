import { Router } from "express";
import { adaptRoute } from "../../shared/express-route-adapter.js";
import { requireAuth } from "../../infrastructure/http/middlewares/auth.middleware.js";

export function createPublicGameRoutes(gameController) {
  const router = Router();

  router.use(requireAuth);

  router.post("/:gameId/join", adaptRoute(gameController.joinGame));
  router.post(
    "/:gameId/open-next-question",
    adaptRoute(gameController.openNextQuestion),
  );
  router.post(
    "/:gameId/questions/:questionId/submit-answer",
    adaptRoute(gameController.submitAnswer),
  );
  router.get(
    "/:gameId/questions/:questionId/stats",
    adaptRoute(gameController.getQuestionStats),
  );
  router.get("/:gameId/leaderboard", adaptRoute(gameController.getLeaderboard));
  //leaderboard for a the connected player
  router.get(
    "/:gameId/leaderboard/me",
    adaptRoute(gameController.getLeaderboardForPlayer),
  );

  return router;
}
