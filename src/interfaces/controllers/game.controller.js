import { ok, created, noContent } from "../utils/success.js";

export function createGameController({
  gameUseCases,
  questionUseCases,
  answerUseCases,
  leaderboardUseCases,
}) {
  return {
    async createGame({ body, user }) {
      const game = await gameUseCases.createGame({
        ...body,
        createdBy: user.id,
      });

      return created(game);
    },

    async listGames() {
      const games = await gameUseCases.listGames();

      return ok(games);
    },

    async getGameById({ params }) {
      const game = await gameUseCases.getGameById(params.id ?? params.gameId);

      return ok(game);
    },

    async updateGame({ params, body }) {
      const game = await gameUseCases.updateGame(
        params.id ?? params.gameId,
        body,
      );

      return ok(game);
    },

    async deleteGame({ params }) {
      await gameUseCases.deleteGame(params.id ?? params.gameId);

      return noContent();
    },

    async startGame({ params }) {
      const result = await gameUseCases.startGame(params.id ?? params.gameId);

      return ok(result);
    },

    async joinGame({ params, body }) {
      const result = await gameUseCases.joinGame(params.gameId, body);

      return created(result);
    },

    async endGame({ params }) {
      const result = await gameUseCases.endGame(params.id ?? params.gameId);

      return ok(result);
    },

    async openNextQuestion({ params }) {
      const result = await questionUseCases.openNextQuestion(params.gameId);

      return ok(result);
    },

    async submitAnswer({ params, body, user }) {
      const result = await answerUseCases.submitAnswer({
        gameId: params.gameId,
        contestQuestionId: params.questionId,
        playerId: user.playerId,
        answer: body.answer ?? body.answerValue,
        answerType: body.answerType,
      });

      return created(result);
    },
    async closeCurrentQuestion({ params }) {
      const result = await questionUseCases.closeCurrentQuestion(params.gameId);

      return ok(result);
    },

    async getCurrentQuestionStats({ params }) {
      const stats = await questionUseCases.getCurrentQuestionStats(
        params.gameId,
      );

      return ok(stats);
    },

    async markStatsViewed({ params }) {
      const question = await questionUseCases.markStatsViewed(
        params.questionId,
      );

      return ok(question);
    },

    async getQuestionStats({ params }) {
      const stats = await questionUseCases.getQuestionStats(
        params.gameId,
        params.questionId,
      );

      return ok(stats);
    },

    async getLeaderboard({ params }) {
      const leaderboard = await leaderboardUseCases.getLeaderboard(
        params.gameId,
      );

      return ok(leaderboard);
    },

    async getResults({ params, query, body }) {
      const results = await leaderboardUseCases.getResults(params.gameId, {
        playerId: query.playerId ?? body?.playerId,
      });

      return ok(results);
    },
  };
}
