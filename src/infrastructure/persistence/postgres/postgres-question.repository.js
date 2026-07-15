import { toContestQuestion } from "./mappers/question.mapper.js";
import { query } from "./db.js";

export function createPostgresQuestionRepository() {
  return {
    // nb reponses / nb participants
    async getQuestionProgress(contestQuestionId) {
      const { rows } = await query(
        `
    SELECT
      COUNT(DISTINCT cp.player_id)::integer AS total_participants,
      COUNT(DISTINCT a.player_id)::integer AS answered_count
    FROM public.contest_question cq
    LEFT JOIN public.contest_player cp ON cp.contest_id = cq.contest_id
    LEFT JOIN public.answer a ON a.contest_question_id = cq.contest_question_id
    WHERE cq.contest_question_id = $1
    GROUP BY cq.contest_question_id
    `,
        [contestQuestionId],
      );

      return {
        totalParticipants: rows[0]?.total_participants ?? 0,
        answeredCount: rows[0]?.answered_count ?? 0,
      };
    },

    async closeQuestion(contestQuestionId) {
      const { rows } = await query(
        `
    UPDATE public.contest_question
    SET status = 'closed'::public.contest_question_status,
        closed_at = NOW()
    WHERE contest_question_id = $1
      AND status = 'opened'::public.contest_question_status
    RETURNING *
    `,
        [contestQuestionId],
      );

      return rows[0] ? toContestQuestion(rows[0]) : null;
    },

    async findQuestionDetails(client, contestQuestionId, gameId = null) {
      const params = gameId ? [contestQuestionId, gameId] : [contestQuestionId];
      const gameFilter = gameId ? "AND cq.contest_id = $2" : "";
      const { rows } = await client.query(
        `
    SELECT
      cq.*,
      q.statement,
      q.category,
      q.type,
      q.duration,
      q.points,
      q.explanation,
      qc.content AS correct_answer
    FROM public.contest_question cq
    JOIN public.question q ON q.question_id = cq.question_id
    LEFT JOIN public.question_choice qc
      ON qc.question_id = q.question_id
     AND qc.is_correct = true
    WHERE cq.contest_question_id = $1
      ${gameFilter}
    ORDER BY qc.order_index ASC
    LIMIT 1
    `,
        params,
      );

      return rows[0] ?? null;
    },

    // trouve la question courante pour les statistiques (la dernière question fermée ou en résultats)
    async findCurrentQuestionForStatistics(gameId) {
      const { rows } = await query(
        `
            SELECT
              cq.*,
              q.statement,
              q.category,
              q.type,
              q.duration,
              q.points,
              q.explanation,
              qc.content AS correct_answer
            FROM public.contest_question cq
            JOIN public.question q ON q.question_id = cq.question_id
            LEFT JOIN public.question_choice qc
              ON qc.question_id = q.question_id
             AND qc.is_correct = true
            WHERE cq.contest_id = $1
              AND cq.status IN (
                'closed'::public.contest_question_status,
                'results'::public.contest_question_status
              )
            ORDER BY
              CASE WHEN cq.status = 'closed'::public.contest_question_status THEN 0 ELSE 1 END,
              cq.round_number ASC,
              cq.order_index ASC
            LIMIT 1
            `,
        [gameId],
      );

      return rows[0] ? toContestQuestion(rows[0]) : null;
    },

    async findNextWaitingQuestion(gameId) {
      const { rows } = await query(
        `
    SELECT
      cq.contest_question_id,
      cq.contest_id,
      cq.question_id,
      cq.round_number,
      cq.order_index,
      q.statement,
      q.category,
      q.type,
      q.duration,
      q.points
    FROM public.contest_question cq
    JOIN public.question q
      ON q.question_id = cq.question_id
    WHERE cq.contest_id = $1
      AND cq.status = 'waiting'::public.contest_question_status
    ORDER BY
      cq.round_number ASC,
      cq.order_index ASC
    LIMIT 1
    `,
        [gameId],
      );

      return rows[0] ? toContestQuestion(rows[0]) : null;
    },

    async openQuestion(contestQuestionId) {
      await query(
        `
    UPDATE public.contest_question
    SET
      status = 'opened'::public.contest_question_status,
      opened_at = NOW(),
      closed_at = NULL
    WHERE contest_question_id = $1
    `,
        [contestQuestionId],
      );
    },

    async closeExpiredQuestions(client, gameId) {
      await client.query(
        `
    UPDATE public.contest_question cq
    SET status = 'closed'::public.contest_question_status,
        closed_at = NOW()
    FROM public.question q
    WHERE cq.question_id = q.question_id
      AND cq.contest_id = $1
      AND cq.status = 'opened'::public.contest_question_status
      AND cq.opened_at IS NOT NULL
      AND EXTRACT(EPOCH FROM (NOW() - cq.opened_at)) > q.duration
    `,
        [gameId],
      );
    },

    async findOpenedQuestion(gameId) {
      const { rows } = await query(
        `
    SELECT
      cq.*,
      q.statement,
      q.category,
      q.type,
      q.duration,
      q.points,
      q.explanation,
      qc.content AS correct_answer
    FROM public.contest_question cq
    JOIN public.question q ON q.question_id = cq.question_id
    LEFT JOIN public.question_choice qc
      ON qc.question_id = q.question_id
     AND qc.is_correct = true
    WHERE cq.contest_id = $1
      AND cq.status = 'opened'::public.contest_question_status
    ORDER BY qc.order_index ASC
    LIMIT 1
    `,
        [gameId],
      );

      return rows[0]
        ? {
            ...toContestQuestion(rows[0]),
            statement: rows[0].statement,
            category: rows[0].category,
            type: rows[0].type,
            duration: rows[0].duration,
            points: rows[0].points,
            explanation: rows[0].explanation,
            correctAnswer: rows[0].correct_answer,
          }
        : null;
    },
  };
}
