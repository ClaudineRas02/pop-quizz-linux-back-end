import { query } from "./db.js";
import { BusinessError } from "../../../domain/errors/business-error.js";

export function createPostgresRoundRepository() {
  return {
    async createRound(gameId, { roundNumber, questionIds }) {
      const client = await beginTransaction();

      try {
        const inserted = [];

        for (const [index, questionId] of questionIds.entries()) {
          const { rows } = await client.query(
            `
                INSERT INTO public.contest_question (
                  contest_id,
                  question_id,
                  round_number,
                  order_index
                )
                VALUES ($1, $2, $3, $4)
                RETURNING *
                `,
            [gameId, questionId, roundNumber, index + 1],
          );
          inserted.push(toContestQuestion(rows[0]));
        }

        await client.query(
          `
              UPDATE public.contest
              SET total_questions = (
                SELECT COUNT(*)
                FROM public.contest_question
                WHERE contest_id = $1
              )
              WHERE contest_id = $1
              `,
          [gameId],
        );

        await client.query("COMMIT");
        return inserted;
      } catch (error) {
        await client.query("ROLLBACK");
        throw error;
      } finally {
        client.release();
      }
    },
  };
}
