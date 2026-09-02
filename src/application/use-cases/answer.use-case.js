// answer.use-cases.js
import { BusinessError } from "../../domain/errors/business-error.js";
import {
  getAnswerTypeForQuestion,
  normalizeAnswer,
  verifyAnswerPayload,
} from "../../domain/entities/game.js";
import { clearQuestionTimeout } from "../../shared/utils/question-timer.service.js";

export function createAnswerUseCases({ answerRepository }) {
  return {
    async submitAnswer({
      gameId,
      contestQuestionId,
      playerId,
      answer,
      answerType,
    }) {
      const payload = verifyAnswerPayload({ playerId, answer });

      const result = await answerRepository.withTransaction(async (client) => {
        const question = await answerRepository.findQuestionForUpdate(
          client,
          gameId,
          contestQuestionId,
        );
        if (!question) {
          throw new BusinessError("Question introuvable", 404);
        }

        if (question.status !== "opened") {
          return {
            accepted: false,
            closed: true,
            reason: "QUESTION_CLOSED",
            correctAnswer: question.correctAnswer,
          };
        }
        // Check if the player has already answered this question

        const existing = await answerRepository.findExistingAnswer(
          client,
          contestQuestionId,
          payload.playerId,
        );
        if (existing) {
          return {
            accepted: false,
            reason: "ALREADY_ANSWERED",
            answer: existing,
          };
        }
        const responseTime = secondsSince(question.openedAt);
        const timeExpired = responseTime >= Number(question.duration);

        if (timeExpired) {
          await answerRepository.closeQuestion(client, contestQuestionId);
          clearQuestionTimeout(gameId);

          return {
            accepted: false,
            closed: true,
            reason: "QUESTION_TIMEOUT",
            correctAnswer: question.correctAnswer,
          };
        }

        // Check if the answer is correct and calculate points
        const isCorrect = checkAnswerCorrectness(question, payload.answer);
        const firstBlood =
          isCorrect &&
          !(await answerRepository.hasFirstBlood(client, contestQuestionId));
        const earnedPoints = isCorrect
          ? calculateEarnedPoints(question.points, firstBlood)
          : 0;

        // Save the answer in the database
        const savedAnswer = await answerRepository.insertAnswer(client, {
          contestQuestionId,
          playerId: payload.playerId,
          answer: payload.answer,
          answerType: answerType ?? getAnswerTypeForQuestion(question.type),
          isCorrect,
          responseTime,
          firstBlood,
          earnedPoints,
        });

        const progress = await answerRepository.getQuestionProgress(
          client,
          contestQuestionId,
        );

        // Check if all participants have answered the question
        const allAnswered =
          progress.totalParticipants > 0 &&
          progress.answeredCount >= progress.totalParticipants;

        if (allAnswered) {
          await answerRepository.closeQuestion(client, contestQuestionId);
          clearQuestionTimeout(gameId);
        }
        // Return the result of the answer submission if all answered
        return {
          accepted: true,
          closed: allAnswered,
          answer: savedAnswer,
          correctAnswer: allAnswered ? question.correctAnswer : null,
          progress,
          gameId,
          contestQuestionId,
        };
      });

      // On construit l'event seulement si cette action vient de fermer la question.
      if (
        result.closed &&
        (result.accepted || result.reason === "QUESTION_TIMEOUT")
      ) {
        return {
          ...result,
          event: {
            name: "question:closed",
            room: `game:${gameId}`,
            payload: {
              contestQuestionId,
              correctAnswer: result.correctAnswer,
              progress: result.progress,
            },
          },
        };
      }

      return result;
    },
  };
}

function checkAnswerCorrectness(question, answer) {
  return normalizeAnswer(answer) === normalizeAnswer(question.correctAnswer);
}

function calculateEarnedPoints(points, firstBlood) {
  return Number(points) + (firstBlood ? 5 : 0);
}

function secondsSince(date) {
  const elapsed = (Date.now() - new Date(date).getTime()) / 1000;
  return Number(Math.max(0, elapsed).toFixed(2));
}
