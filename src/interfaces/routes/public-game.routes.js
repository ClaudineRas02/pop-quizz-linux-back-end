import { Router } from "express";
import { adaptRoute } from "../../shared/express-route-adapter.js";

export function createPublicGameRoutes(gameController) {
  const router = Router();

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

  return router;
}
