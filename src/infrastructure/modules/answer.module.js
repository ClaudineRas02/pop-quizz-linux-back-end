import { createAnswerController } from "../../interfaces/controllers/answer.controller.js";
import { createAnswerUseCases } from "../../application/use-cases/answer.use-case.js";
import { createAdminAnswerRoutes } from "../../interfaces/routes/admin-answer.routes.js";
import { createPublicAnswerRoutes } from "../../interfaces/routes/public-answer.routes.js";
import { createPostgresAnswerRepository } from "../persistence/postgres/postgres-answer.repository.js";

export function createAnswerModule() {
  const answerRepository = createPostgresAnswerRepository();

  const answerUseCases = createAnswerUseCases({
    answerRepository,
  });

  const answerController = createAnswerController({ answerUseCases });

  return {
    adminRoutes: createAdminAnswerRoutes(answerController),
    publicRoutes: createPublicAnswerRoutes(answerController),
  };
}
