// Module game.

// Ce fichier assemble toutes les dependances liees aux jeux :
// repository PostgreSQL -> use cases -> controller -> routes.

// Il permet de garder app.js propre et scalable.
import { createGameController } from "../../interfaces/controllers/game.controller.js";
import { createGameUseCases } from "../../application/use-cases/game.use-case.js";
import { createQuestionUseCases } from "../../application/use-cases/questions.use-cases.js";
import { createAnswerUseCases } from "../../application/use-cases/answer.use-case.js";
import { createLeaderboardUseCases } from "../../application/use-cases/result.use-case.js";
import { createAdminGameRoutes } from "../../interfaces/routes/admin-game.routes.js";
import { createPublicGameRoutes } from "../../interfaces/routes/public-game.routes.js";
import { createPostgresGameRepository } from "../persistence/postgres/postgres-game.repository.js";
import { createPostgresQuestionRepository } from "../persistence/postgres/postgres-question.repository.js";
import { createPostgresStatisticsRepository } from "../persistence/postgres/postgres-statistics.repository.js";
import { createPostgresAnswerRepository } from "../persistence/postgres/postgres-answer.repository.js";
import { createPostgresLeaderboardRepository } from "../persistence/postgres/postgres-leaderboard.repository.js";

export function createGameModule() {
  const gameRepository = createPostgresGameRepository();
  const questionRepository = createPostgresQuestionRepository();
  const statisticRepository = createPostgresStatisticsRepository();
  const answerRepository = createPostgresAnswerRepository();
  const leaderboardRepository = createPostgresLeaderboardRepository();

  const gameUseCases = createGameUseCases({
    gameRepository,
  });

  const questionUseCases = createQuestionUseCases({
    gameRepository,
    questionRepository,
    statisticRepository,
  });

  const answerUseCases = createAnswerUseCases({
    answerRepository,
  });

  const leaderboardUseCases = createLeaderboardUseCases({
    gameRepository,
    leaderboardRepository,
  });

  const gameController = createGameController({
    gameUseCases,
    questionUseCases,
    answerUseCases,
    leaderboardUseCases,
  });

  return {
    adminRoutes: createAdminGameRoutes(gameController),
    publicRoutes: createPublicGameRoutes(gameController),
  };
}
