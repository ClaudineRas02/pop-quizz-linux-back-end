import { Router } from "express";
import { adaptRoute } from "../../shared/express-route-adapter.js";

export function createPublicQuestionRoutes(questionController) {
  const router = Router();

  return router;
}
