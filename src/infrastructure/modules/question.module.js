import { createQuestionController } from "../../interfaces/controllers/question.controller.js";
import { createQuestionUseCases } from "../../application/use-cases/questions.use-cases.js";
import { createAdminQuestionRoutes } from "../../interfaces/routes/admin-question.routes.js";
import { createPublicQuestionRoutes } from "../../interfaces/routes/public-question.routes.js";
import { createPostgresStatisticsRepository } from "../persistence/postgres/postgres-statistics.repository.js";
import { createPostgresQuestionRepository } from "../persistence/postgres/postgres-question.repository.js";

export function createQuestionModule() {
  const questionRepository = createPostgresQuestionRepository();
  const statisticRepository = createPostgresStatisticsRepository();

  const questionUseCases = createQuestionUseCases({
    questionRepository,
    statisticRepository,
  });

  const questionController = createQuestionController({ questionUseCases });

  return {
    adminRoutes: createAdminQuestionRoutes(questionController),
    publicRoutes: createPublicQuestionRoutes(questionController),
  };
}
