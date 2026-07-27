// Module game.

// Ce fichier assemble toutes les dependances liees aux jeux :
// repository PostgreSQL -> use cases -> controller -> routes.

// Il permet de garder app.js propre et scalable.
import { createGameController } from "../../interfaces/controllers/game.controller.js";
import { createGameUseCases } from "../../application/use-cases/game.use-case.js";
import { createAdminGameRoutes } from "../../interfaces/routes/admin-game.routes.js";
import { createPublicGameRoutes } from "../../interfaces/routes/public-game.routes.js";
import { createPostgresGameRepository } from "../persistence/postgres/postgres-game.repository.js";
import { createQuestionUseCases } from "../../application/use-cases/questions.use-cases.js";
import { createPostgresStatisticsRepository } from "../persistence/postgres/postgres-statistics.repository.js";
import { createPostgresQuestionRepository } from "../persistence/postgres/postgres-question.repository.js";

export function createGameModule() {
  const gameRepository = createPostgresGameRepository();

  const gameUseCases = createGameUseCases({
    gameRepository,
  });
  const statisticRepository = createPostgresStatisticsRepository();
  const questionRepository = createPostgresQuestionRepository();
  const questionUseCases = createQuestionUseCases({
    gameRepository,
    questionRepository,
    statisticRepository,
  });

  const gameController = createGameController({
    gameUseCases,
    questionUseCases,
  });

  return {
    adminRoutes: createAdminGameRoutes(gameController),
    publicRoutes: createPublicGameRoutes(gameController),
  };
}
