// postgres-answer.repository.js
import { pool } from "./db.js";
import { toAnswer } from "./mappers/answer.mapper.js";

export function createPostgresAnswerRepository() {
  return {
    async withTransaction(work) {
      const client = await pool.connect();
      try {
        await client.query("BEGIN");
        const result = await work(client);
        await client.query("COMMIT");
        return result;
      } catch (error) {
        await client.query("ROLLBACK");
        throw error;
      } finally {
        client.release();
      }
    },

    async findQuestionForUpdate(client, gameId, contestQuestionId) {
      const { rows } = await client.query(
        `
        SELECT
          cq.contest_question_id,
          cq.contest_id,
          cq.question_id,
          cq.status,
          cq.opened_at,
          q.type,
          q.points,
          q.duration,
          qc.content AS correct_answer
        FROM public.contest_question cq
        JOIN public.question q ON q.question_id = cq.question_id
        LEFT JOIN public.question_choice qc
          ON qc.question_id = q.question_id
         AND qc.is_correct = true
        WHERE cq.contest_question_id = $1
          AND cq.contest_id = $2
        ORDER BY qc.order_index ASC
        LIMIT 1
        FOR UPDATE OF cq
        `,
        [contestQuestionId, gameId],
      );
      return rows[0] ? toQuestion(rows[0]) : null;
    },

    async findExistingAnswer(client, contestQuestionId, playerId) {
      const { rows } = await client.query(
        `SELECT * FROM public.answer
         WHERE contest_question_id = $1 AND player_id = $2`,
        [contestQuestionId, playerId],
      );
      return rows[0] ? toAnswer(rows[0]) : null;
    },

    async hasFirstBlood(client, contestQuestionId) {
      const { rows } = await client.query(
        `SELECT EXISTS (
           SELECT 1 FROM public.answer
           WHERE contest_question_id = $1 AND first_blood = true
         ) AS exists`,
        [contestQuestionId],
      );
      return rows[0]?.exists === true;
    },

    async insertAnswer(client, payload) {
      const { rows } = await client.query(
        `INSERT INTO public.answer (
           contest_question_id, player_id, answer_value, answer_type,
           is_correct, response_time, first_blood, earned_points
         )
         VALUES ($1, $2, $3::jsonb, $4, $5, $6, $7, $8)
         RETURNING *`,
        [
          payload.contestQuestionId,
          payload.playerId,
          JSON.stringify(payload.answer),
          payload.answerType,
          payload.isCorrect,
          payload.responseTime,
          payload.firstBlood,
          payload.earnedPoints,
        ],
      );
      return toAnswer(rows[0]);
    },

    async getQuestionProgress(client, contestQuestionId) {
      const { rows } = await client.query(
        `
        SELECT
          COUNT(DISTINCT a.player_id)::integer AS answered_count,
          COUNT(DISTINCT cp.player_id)::integer AS total_participants
        FROM public.contest_question cq
        LEFT JOIN public.contest_player cp ON cp.contest_id = cq.contest_id
        LEFT JOIN public.answer a ON a.contest_question_id = cq.contest_question_id
        WHERE cq.contest_question_id = $1
        GROUP BY cq.contest_question_id
        `,
        [contestQuestionId],
      );
      return toProgress(rows[0]);
    },

    async closeQuestion(client, contestQuestionId) {
      await client.query(
        `
        UPDATE public.contest_question
        SET status = 'closed'::public.contest_question_status,
            closed_at = NOW()
        WHERE contest_question_id = $1
          AND status = 'opened'::public.contest_question_status
        `,
        [contestQuestionId],
      );
    },
  };
}

function toQuestion(row) {
  return {
    contestQuestionId: row.contest_question_id,
    gameId: row.contest_id,
    questionId: row.question_id,
    status: row.status,
    openedAt: row.opened_at,
    type: row.type,
    points: row.points,
    duration: row.duration,
    correctAnswer: row.correct_answer,
  };
}

function toProgress(row = {}) {
  return {
    answeredCount: Number(row.answered_count ?? 0),
    totalParticipants: Number(row.total_participants ?? 0),
  };
}
