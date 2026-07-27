import { Router } from "express";
import { adaptRoute } from "../../shared/express-route-adapter.js";

export function createAdminQuestionRoutes(questionController) {
  const router = Router();

  // LIST ALL QUESTIONS
  router.get("/list", adaptRoute(questionController.listQuestions));

  // GET QUESTION BY ID
  router.get("/:questionId", adaptRoute(questionController.getQuestionById));

  // CREATE QUESTION
  router.post("/create", adaptRoute(questionController.createQuestion));

  // UPDATE QUESTION
  router.patch("/update/:questionId", adaptRoute(questionController.updateQuestion));

  // DELETE QUESTION
  router.delete("/delete/:questionId", adaptRoute(questionController.deleteQuestion));

  // ==================== GAME QUESTION OPERATIONS ====================

  // GET QUESTION STATS (in contest context)
  router.get(
    "/:gameId/:questionId/stats",
    adaptRoute(questionController.getQuestionStats),
  );

  // MARK STATS AS VIEWED
  router.patch(
    "/:questionId/stats/viewed",
    adaptRoute(questionController.markStatsViewed),
  );

  return router;
}
