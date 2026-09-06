import { ok } from "../../shared/http-response.js";
export function createLeaderboardController({ leaderboardUseCases }) {
  return {
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
