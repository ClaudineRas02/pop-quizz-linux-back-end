import { BusinessError } from "../../domain/errors/business-error.js";
import { verifyJoinPayload } from "../../domain/entities/game.js";

export function createLeaderboardUseCases({
  gameRepository,
  leaderboardRepository,
}) {
  return {
    async emitLeaderboardViewEvent(gameId) {
      //return event to show leaderboard to the player
      return {
        event: {
          name: "show-leaderboard",
          room: `game:${gameId}`,
          payload: {
            message: "Le classement est maintenant visible pour les joueurs.",
          },
        },
      };
    },

    async getLeaderboard(gameId) {
      return await leaderboardRepository.getLeaderboard(gameId);
    },

    async getLeaderboardForPlayer(gameId, playerId) {
      return await leaderboardRepository.getLeaderboardForPlayer(
        gameId,
        playerId,
      );
    },

    //top 3 players + reveal schedule
    async getResults(gameId, payload) {
      const { playerId } = verifyJoinPayload(payload);
      const results = await gameRepository.getResults(gameId, playerId);

      if (!results.twoFactorValidated) {
        throw new BusinessError(
          "Validation 2FA requise pour consulter les resultats finaux.",
          403,
        );
      }

      return {
        countdownSeconds: 20,
        revealSchedule: [
          { rank: 3, revealAfterSeconds: 0 },
          { rank: 2, revealAfterSeconds: 5 },
          { rank: 1, revealAfterSeconds: 15 },
          { rank: "all", revealAfterSeconds: 20 },
        ],
        leaderboard: results.leaderboard,
      };
    },
  };
}
