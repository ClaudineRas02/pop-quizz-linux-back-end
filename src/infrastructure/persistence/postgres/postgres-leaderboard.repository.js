import { query } from "./db.js";
import { toLeaderboardRow } from "./mappers/leaderboard.mapper.js";

export function createPostgresLeaderboardRepository() {
  return {
    async getLeaderboard(gameId) {
      const { rows } = await query(
        `
        SELECT *
        FROM public.v_contest_player_score
        WHERE contest_id = $1
        ORDER BY rank ASC, score DESC, avg_response_time ASC
        `,
        [gameId],
      );

      return rows.map(toLeaderboardRow);
    },
    async getLeaderboardForPlayer(gameId, playerId) {
      const { rows } = await query(
        `
        SELECT *
        FROM public.v_contest_player_score
        WHERE contest_id = $1 AND player_id = $2
        `,
        [gameId, playerId],
      );

      return rows.map(toLeaderboardRow);
    },
  };
}
