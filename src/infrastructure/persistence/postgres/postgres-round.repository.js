import { query, beginTransaction } from "./db.js";
import { toContestQuestion } from "./mappers/question.mapper.js";

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
              contest_id, question_id, round_number, order_index
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

    async addQuestionToRound(gameId, { roundNumber, questionId }) {
      const client = await beginTransaction();

      try {
        const { rows: maxRow } = await client.query(
          `
          SELECT COALESCE(MAX(order_index), 0) + 1 AS next_order
          FROM public.contest_question
          WHERE contest_id = $1 AND round_number = $2
          `,
          [gameId, roundNumber],
        );

        const nextOrder = maxRow[0]?.next_order ?? 1;

        const { rows } = await client.query(
          `
          INSERT INTO public.contest_question (
            contest_id, question_id, round_number, order_index
          )
          VALUES ($1, $2, $3, $4)
          RETURNING *
          `,
          [gameId, questionId, roundNumber, nextOrder],
        );

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
        return toContestQuestion(rows[0]);
      } catch (error) {
        await client.query("ROLLBACK");
        throw error;
      } finally {
        client.release();
      }
    },

    async getRoundsByGame(gameId) {
      const { rows } = await query(
        `
        SELECT
          cq.*,
          q.statement,
          q.category,
          q.type,
          q.duration,
          q.points,
          q.difficulty
        FROM public.contest_question cq
        JOIN public.question q ON q.question_id = cq.question_id
        WHERE cq.contest_id = $1
        ORDER BY cq.round_number ASC, cq.order_index ASC
        `,
        [gameId],
      );

      return rows.map((row) => ({
        ...toContestQuestion(row),
        statement: row.statement,
        category: row.category,
        type: row.type,
        duration: row.duration,
        points: row.points,
        difficulty: row.difficulty,
      }));
    },
  };
}
