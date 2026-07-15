import { Router } from "express";
import { adaptRoute } from "../../shared/express-route-adapter.js";

export function createAdminQuestionRoutes(questionController) {
  const router = Router();

  router.get(
    "/:gameId/:questionId/stats",
    adaptRoute(questionController.getQuestionStats),
  );

  router.patch(
    "/:questionId/stats/viewed",
    adaptRoute(questionController.markStatsViewed),
  );
  return router;
}
