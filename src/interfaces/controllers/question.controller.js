import { ok } from "../utils/success.js";

export function createQuestionController({ questionUseCases }) {
  return {
    async openNextQuestion({ params }) {
      const result = await questionUseCases.openNextQuestion(params.gameId);

      return ok(result);
    },

    async closeCurrentQuestion({ params }) {
      const result = await questionUseCases.closeCurrentQuestion(params.gameId);

      return ok(result);
    },

    async getQuestionStats({ params }) {
      const stats = await questionUseCases.getQuestionStats(
        params.gameId,
        params.questionId,
      );

      return ok(stats);
    },

    async markStatsViewed({ params }) {
      const question = await questionUseCases.markStatsViewed(params.questionId);

      return ok(question);
    },
  };
}
