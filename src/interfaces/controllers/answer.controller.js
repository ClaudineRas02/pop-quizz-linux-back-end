import { created } from "../utils/success.js";

export function createAnswerController({ answerUseCases }) {
  return {
    async submitAnswer({ params, body, user }) {
      const result = await answerUseCases.submitAnswer({
        gameId: params.gameId,
        contestQuestionId: params.questionId,
        playerId: user.playerId,
        answer: body.answer ?? body.answerValue,
        answerType: body.answerType,
      });

      return created(result);
    },
  };
}
