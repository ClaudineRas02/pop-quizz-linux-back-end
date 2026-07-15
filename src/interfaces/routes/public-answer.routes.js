import { Router } from "express";
import { adaptRoute } from "../../shared/express-route-adapter.js";

export function createPublicAnswerRoutes(answerController) {
  const router = Router();

  router.post(
    "/:gameId/:questionId/submit-answer",
    adaptRoute(answerController.submitAnswer),
  );

  return router;
}
