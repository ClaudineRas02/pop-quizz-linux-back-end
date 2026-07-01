import { BusinessError } from "../../domain/errors/business-error.js";
import {
  getAnswerTypeForQuestion,
  normalizeAnswer,
  verifyAnswerPayload,
  verifyGameData,
  verifyGameUpdate,
  verifyJoinPayload,
  verifyRoundPayload,
} from "../../domain/entities/game.js";

export function createGameUseCases({ gameRepository }) {
  return {
    async createGame(gameData) {
      const verifiedGameData = verifyGameData(gameData);
      const game = await gameRepository.create(verifiedGameData);

      return {
        game,
        event: {
          name: "created-game",
          room: `lobby`,
          payload: {
            game,
          },
        },
      };
    },

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

    async updateGame(gameId, updateData) {
      const verifiedUpdateData = verifyGameUpdate(updateData);
      const updatedGame = await gameRepository.update(
        gameId,
        verifiedUpdateData,
      );

      if (!updatedGame) {
        throw new BusinessError("Impossible de mettre a jour la partie.", 404);
      }

      return updatedGame;
    },

    async deleteGame(gameId) {
      const deleted = await gameRepository.delete(gameId);

      if (!deleted) {
        throw new BusinessError("Impossible de supprimer la partie.", 404);
      }

      return deleted;
    },

    async startGame(gameId) {
      const game = await gameRepository.start(gameId);

      if (!game) {
        throw new BusinessError(
          "La partie est introuvable ou ne peut pas etre demarree.",
          409,
        );
      }
      // L'événement "game:started" est déclenché pour notifier les clients connectés que la partie a commencé.
      return {
        game,
        event: {
          name: "game:started",
          room: `game:${game.gameId}`,
          payload: { game },
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

    async joinGame(gameId, payload) {
      await this.getGameById(gameId);
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

    async createRound(gameId, payload) {
      await this.getGameById(gameId);
      const round = verifyRoundPayload(payload);
      return gameRepository.createRound(gameId, round);
    },

    async openNextQuestion(gameId) {
      const game = await this.getGameById(gameId);

      if (game.status !== "running") {
        throw new BusinessError(
          "La partie doit etre en cours pour ouvrir une question.",
          409,
        );
      }

      const result = await gameRepository.openNextQuestion(gameId);

      if (!result) {
        throw new BusinessError(
          "Aucune question en attente pour cette partie.",
          404,
        );
      }

      if (result.blockedByOpenQuestion) {
        throw new BusinessError(
          "La question courante ne peut pas encore etre cloturee.",
          409,
          { question: result.question },
        );
      }

      return {
        question: result.question,
        event: {
          name: "question:opened",
          room: `game:${gameId}`,
          payload: { question: result.question },
        },
      };
    },
    // iscorrect answer?
    async submitAnswer(gameId, contestQuestionId, payload) {
      const answerPayload = verifyAnswerPayload(payload);
      const question = await gameRepository.findQuestionForAnswer(
        gameId,
        contestQuestionId,
      );

      if (!question) {
        throw new BusinessError("Question introuvable pour cette partie.", 404);
      }

      const answerType = getAnswerTypeForQuestion(question.type);
      const isCorrect =
        normalizeAnswer(answerPayload.answer) ===
        normalizeAnswer(question.correctAnswer);
      const result = await gameRepository.submitAnswer(
        gameId,
        contestQuestionId,
        {
          ...answerPayload,
          answerType,
          isCorrect,
        },
      );

      if (!result) {
        throw new BusinessError("Question introuvable pour cette partie.", 404);
      }

      if (!result.accepted) {
        return {
          message: "Le temps est ecoule. La reponse correcte est affichee.",
          accepted: false,
          correctAnswer: result.correctAnswer,
          progress: result.progress,
          event: {
            name: "question:closed",
            room: `game:${gameId}`,
            payload: {
              contestQuestionId: Number(contestQuestionId),
              correctAnswer: result.correctAnswer,
              progress: result.progress,
            },
          },
        };
      }

      const response = {
        message: result.closed
          ? "Tous les participants ont repondu. La reponse correcte est affichee."
          : "Votre reponse a bien ete recue.",
        accepted: true,
        answer: result.answer,
        progress: result.progress,
        correctAnswer: result.correctAnswer,
      };

      return {
        ...response,
        event: {
          name: result.closed ? "question:closed" : "question:answer-received",
          room: `game:${gameId}`,
          payload: {
            contestQuestionId: Number(contestQuestionId),
            progress: result.progress,
            correctAnswer: result.correctAnswer,
          },
        },
      };
    },

    async getQuestionStats(gameId, contestQuestionId) {
      const stats = await gameRepository.getQuestionStats(
        gameId,
        contestQuestionId,
      );

      if (!stats) {
        throw new BusinessError(
          "Statistiques introuvables pour cette question.",
          404,
        );
      }

      return stats;
    },

    getLeaderboard(gameId) {
      return gameRepository.getLeaderboard(gameId);
    },

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
