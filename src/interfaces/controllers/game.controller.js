export function createGameController(gameUseCases) {
  return {
    async createGame({ body }) {
      const game = await gameUseCases.createGame(body);

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
      const game = await gameUseCases.updateGame(params.id ?? params.gameId, body);

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

    async endGame({ params }) {
      const result = await gameUseCases.endGame(params.id ?? params.gameId);

      return ok(result);
    },

    async joinGame({ params, body }) {
      const result = await gameUseCases.joinGame(params.gameId, body);

      return created(result);
    },

    async createRound({ params, body }) {
      const roundQuestions = await gameUseCases.createRound(params.gameId, body);

      return created(roundQuestions);
    },

    async openNextQuestion({ params }) {
      const result = await gameUseCases.openNextQuestion(params.gameId);

      return ok(result);
    },

    async submitAnswer({ params, body }) {
      const result = await gameUseCases.submitAnswer(
        params.gameId,
        params.questionId,
        body,
      );

      return created(result);
    },

    async getQuestionStats({ params }) {
      const stats = await gameUseCases.getQuestionStats(params.gameId, params.questionId);

      return ok(stats);
    },

    async getLeaderboard({ params }) {
      const leaderboard = await gameUseCases.getLeaderboard(params.gameId);

      return ok(leaderboard);
    },

    async getResults({ params, query, body }) {
      const results = await gameUseCases.getResults(params.gameId, {
        playerId: query.playerId ?? body?.playerId,
      });

      return ok(results);
    },
  };
}

function ok(data) {
  return {
    statusCode: 200,
    body: { data },
  };
}

function created(data) {
  return {
    statusCode: 201,
    body: { data },
  };
}

function noContent() {
  return {
    statusCode: 204,
    body: null,
  };
}
