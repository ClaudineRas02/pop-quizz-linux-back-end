import { created } from "../utils/success.js";

export function createAnswerController({ answerUseCases }) {
  return {
    async submitAnswer({ params, body }) {
      const result = await answerUseCases.submitAnswer(
        params.gameId,
        params.questionId,
        body,
      );

      return created(result);
    },
  };
}
