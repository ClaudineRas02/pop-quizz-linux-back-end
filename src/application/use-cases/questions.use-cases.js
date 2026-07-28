import { BusinessError } from "../../domain/errors/business-error.js";
import {
  verifyQuestionData,
  verifyQuestionUpdate,
} from "../../domain/entities/question.js";
import {
  clearQuestionTimeout,
  scheduleQuestionTimeout,
} from "../../shared/utils/question-timer.service.js";
import { emitRealtimeEvent } from "../../shared/realtime-event-bus.js";

export function createQuestionUseCases({
  gameRepository,
  questionRepository,
  statisticRepository,
}) {
  return {
    // ==================== CRUD QUESTIONS ====================

    async listQuestions() {
      return await questionRepository.findAll();
    },

    async getQuestionById(questionId) {
      const question = await questionRepository.findById(questionId);
      if (!question) {
        throw new BusinessError("Question introuvable.", 404);
      }
      return question;
    },

    async createQuestion(questionData) {
      const verifiedData = verifyQuestionData(questionData);
      return await questionRepository.create(verifiedData);
    },

    async updateQuestion(questionId, updateData) {
      const existing = await questionRepository.findById(questionId);
      if (!existing) {
        throw new BusinessError("Question introuvable.", 404);
      }

      const verifiedData = verifyQuestionUpdate(updateData);
      const updated = await questionRepository.update(questionId, verifiedData);
      if (!updated) {
        throw new BusinessError(
          "Impossible de mettre à jour la question.",
          500,
        );
      }
      return updated;
    },

    async deleteQuestion(questionId) {
      const existing = await questionRepository.findById(questionId);
      if (!existing) {
        throw new BusinessError("Question introuvable.", 404);
      }

      const deleted = await questionRepository.delete(questionId);
      if (!deleted) {
        throw new BusinessError("Impossible de supprimer la question.", 500);
      }
      return deleted;
    },

    // ==================== GAME QUESTION OPERATIONS ====================

    //ouvre, envoie la question, attend la fin du timer et ferme la question automatiquement
    async openNextQuestion(gameId) {
      const game = await gameRepository.findById(gameId);

      if (!game) {
        throw new BusinessError("Partie introuvable.", 404);
      }

      if (game.status !== "running") {
        throw new BusinessError(
          "La partie doit etre en cours pour ouvrir une question.",
          409,
        );
      }

      const currentQuestion =
        await questionRepository.findOpenedQuestion(gameId);

      if (currentQuestion) {
        throw new BusinessError(
          "Une question est deja ouverte pour cette partie.",
          409,
        );
      }

      const question = await questionRepository.findNextWaitingQuestion(gameId);

      if (!question) {
        throw new BusinessError("Aucune question en attente.", 404);
      }

      await questionRepository.openQuestion(question.contestQuestionId);
      const openedQuestion =
        (await questionRepository.findOpenedQuestion(gameId)) ?? question;

      scheduleQuestionTimeout(gameId, openedQuestion.duration, async () => {
        const result = await this.closeCurrentQuestion(gameId);
        emitRealtimeEvent(result?.event);
      });

      return {
        question: openedQuestion,
        event: {
          name: "question:opened",
          room: `game:${gameId}`,
          payload: {
            question: openedQuestion,
          },
        },
      };
    },

    async closeCurrentQuestion(gameId) {
      const game = await gameRepository.findById(gameId);

      if (!game) {
        throw new BusinessError("Partie introuvable.", 404);
      }

      if (game.status !== "running") {
        throw new BusinessError(
          "La partie doit etre en cours pour fermer la question courante.",
          409,
        );
      }

      const openedquestion =
        await questionRepository.findOpenedQuestion(gameId);

      if (!openedquestion) {
        throw new BusinessError(
          "Aucune question ouverte pour cette partie.",
          404,
        );
      }

      const progress = await questionRepository.getQuestionProgress(
        openedquestion.contestQuestionId,
      );
      const allAnswered =
        progress.totalParticipants > 0 &&
        progress.answeredCount >= progress.totalParticipants;
      const timeExpired =
        secondsSince(openedquestion.openedAt) >=
        Number(openedquestion.duration);

      if (!allAnswered && !timeExpired) {
        throw new BusinessError(
          "La question ne peut etre fermee que si tous les participants ont repondu ou si le temps est ecoule.",
          409,
        );
      }

      await questionRepository.closeQuestion(openedquestion.contestQuestionId);
      clearQuestionTimeout(gameId);

      return {
        progress,
        event: {
          name: "question:closed",
          room: `game:${gameId}`,
          payload: {
            contestQuestionId: openedquestion.contestQuestionId,
            correctAnswer: openedquestion.correctAnswer,
          },
        },
      };
    },

    async getCurrentQuestionStats(gameId) {
      const game = await gameRepository.findById(gameId);

      if (!game) {
        throw new BusinessError("Partie introuvable.", 404);
      }

      const current =
        await questionRepository.findCurrentQuestionForStatistics(gameId);

      if (!current) {
        throw new BusinessError(
          "Aucune question fermee pour calculer les statistiques.",
          404,
        );
      }

      return this.getQuestionStats(gameId, current.contestQuestionId);
    },

    async getQuestionStats(gameId, contestQuestionId) {
      const stats = await statisticRepository.getQuestionStatistics(
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

    async markStatsViewed(contestQuestionId) {
      const result =
        await statisticRepository.markStatsViewed(contestQuestionId);

      if (!result) {
        throw new BusinessError("Question introuvable.", 404);
      }

      return result;
    },
  };
}

function secondsSince(date) {
  return Number(((Date.now() - new Date(date).getTime()) / 1000).toFixed(2));
}
