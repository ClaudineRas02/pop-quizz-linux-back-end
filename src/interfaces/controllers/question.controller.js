import { ok, created, noContent } from "../utils/success.js";

export function createQuestionController({ questionUseCases }) {
  return {
    // ==================== CRUD QUESTIONS ====================

    async listQuestions() {
      const questions = await questionUseCases.listQuestions();
      return ok(questions);
    },

    async getQuestionById({ params }) {
      const question = await questionUseCases.getQuestionById(params.questionId);
      return ok(question);
    },

    async createQuestion({ body }) {
      const question = await questionUseCases.createQuestion(body);
      return created(question);
    },

    async updateQuestion({ params, body }) {
      const question = await questionUseCases.updateQuestion(params.questionId, body);
      return ok(question);
    },

    async deleteQuestion({ params }) {
      await questionUseCases.deleteQuestion(params.questionId);
      return noContent();
    },

    // ==================== GAME QUESTION OPERATIONS ====================

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
