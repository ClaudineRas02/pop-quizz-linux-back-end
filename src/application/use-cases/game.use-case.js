import { BusinessError } from "../../domain/errors/business-error.js";
import {
  verifyGameData,
  verifyGameUpdate,
  verifyJoinPayload,
} from "../../domain/entities/game.js";

export function createGameUseCases({ gameRepository }) {
  return {
    async listGames() {
      return await gameRepository.findAll();
    },

    async getGameById(gameId) {
      const game = await gameRepository.findById(gameId);

      if (!game) {
        throw new BusinessError("Aucune partie correspond à id.", 404);
      }

      return game;
    },

    async createGame(gameData) {
      const verifiedGameData = verifyGameData(gameData);
      const game = await gameRepository.create(verifiedGameData);

      return {
        //pour admin, on retourne la partie créée pour qu'il puisse la voir dans son interface
        game,
        // pour les joueurs, on retourne un événement pour qu'ils puissent être notifiés de la création d'une nouvelle partie
        event: {
          name: "created-game",
          room: `lobby`,
          payload: {
            game,
          },
        },
      };
    },

    async updateGame(gameId, updateData) {
      const verifiedUpdateData = verifyGameUpdate(updateData);
      const updatedGame = await gameRepository.update(
        gameId,
        verifiedUpdateData,
      );

      if (!updatedGame) {
        throw new BusinessError("Impossible de mettre a jour la partie.", 404);
      }

      return {
        //pour admin, on retourne la partie modifiée pour qu'il puisse la voir dans son interface
        updatedGame,
        // pour les joueurs, on retourne un événement pour qu'ils puissent être notifiés de la modification d'une nouvelle partie
        event: {
          name: "updated-game",
          room: `lobby`,
          payload: {
            updatedGame,
          },
        },
      };
    },

    async deleteGame(gameId) {
      const deleted = await gameRepository.delete(gameId);

      if (!deleted) {
        throw new BusinessError("Impossible de supprimer la partie.", 404);
      }

      return deleted;
    },
    async joinGame(gameId, payload) {
      const { playerId } = verifyJoinPayload(payload);
      const participant = await gameRepository.join(gameId, playerId);

      return {
        participant,
        event: {
          name: "game:participant-joined",
          room: `game:${gameId}`,
          payload: { participant },
        },
      };
    },

    async startGame(gameId) {
      const game = await gameRepository.findById(gameId);

      if (!game) throw new BusinessError("Partie introuvable", 404);

      if (game.status !== "waiting") throw new BusinessError("Déjà démarrée");

      const startedGame = await gameRepository.start(gameId);

      return {
        game: startedGame,
        event: {
          name: "game:started",
          room: `game:${startedGame.gameId}`,
          payload: { game: startedGame },
        },
      };
    },

    async endGame(gameId) {
      const game = await gameRepository.end(gameId);

      if (!game) {
        throw new BusinessError(
          "La partie est introuvable ou ne peut pas etre terminee.",
          409,
        );
      }

      return {
        game,
        event: {
          name: "game:ended",
          room: `game:${game.gameId}`,
          payload: { game },
        },
      };
    },
  };
}
