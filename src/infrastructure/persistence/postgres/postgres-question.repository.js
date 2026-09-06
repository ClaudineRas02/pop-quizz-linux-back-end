import {
  toContestQuestion,
  toQuestion,
  toQuestionWithChoices,
} from "./mappers/question.mapper.js";
import { query, beginTransaction } from "./db.js";

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

    // ==================== CRUD QUESTIONS ====================

    async findAll() {
      const { rows } = await query(`
        SELECT *
        FROM public.question
        ORDER BY created_at DESC
      `);
      return rows.map(toQuestion);
    },

    async findById(questionId) {
      const { rows: questionRows } = await query(
        `SELECT * FROM public.question WHERE question_id = $1`,
        [questionId],
      );

      if (!questionRows[0]) return null;

      const { rows: choiceRows } = await query(
        `SELECT * FROM public.question_choice WHERE question_id = $1 ORDER BY order_index ASC`,
        [questionId],
      );

      return toQuestionWithChoices(questionRows[0], choiceRows);
    },

    async create({
      statement,
      category,
      type,
      duration,
      points,
      explanation,
      difficulty,
      choices,
    }) {
      const client = await beginTransaction();
      try {
        const { rows } = await client.query(
          `
          INSERT INTO public.question (statement, category, type, duration, points, explanation, difficulty)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
          RETURNING *
          `,
          [
            statement,
            category,
            type,
            duration,
            points,
            explanation,
            difficulty,
          ],
        );

        const question = rows[0];

        if (choices && choices.length > 0) {
          for (const choice of choices) {
            await client.query(
              `
              INSERT INTO public.question_choice (question_id, label, content, is_correct, order_index)
              VALUES ($1, $2, $3, $4, $5)
              `,
              [
                question.question_id,
                choice.label,
                choice.content,
                choice.isCorrect,
                choice.orderIndex,
              ],
            );
          }
        }

        await client.query("COMMIT");

        const { rows: allChoices } = await query(
          `SELECT * FROM public.question_choice WHERE question_id = $1 ORDER BY order_index ASC`,
          [question.question_id],
        );

        return toQuestionWithChoices(question, allChoices);
      } catch (error) {
        await client.query("ROLLBACK");
        throw error;
      } finally {
        client.release();
      }
    },

    async update(
      questionId,
      {
        statement,
        category,
        type,
        duration,
        points,
        explanation,
        difficulty,
        choices,
      },
    ) {
      const client = await beginTransaction();
      try {
        const { rows } = await client.query(
          `
          UPDATE public.question
          SET
            statement = COALESCE($2::text, statement),
            category = COALESCE($3::public.question_category, category),
            type = COALESCE($4::public.question_type, type),
            duration = COALESCE($5::integer, duration),
            points = COALESCE($6::integer, points),
            explanation = COALESCE($7::text, explanation),
            difficulty = COALESCE($8::varchar, difficulty)
          WHERE question_id = $1
          RETURNING *
          `,
          [
            questionId,
            statement ?? null,
            category ?? null,
            type ?? null,
            duration ?? null,
            points ?? null,
            explanation ?? null,
            difficulty ?? null,
          ],
        );

        if (!rows[0]) {
          await client.query("ROLLBACK");
          return null;
        }

        if (choices !== undefined) {
          await client.query(
            `DELETE FROM public.question_choice WHERE question_id = $1`,
            [questionId],
          );

          for (const choice of choices) {
            await client.query(
              `
              INSERT INTO public.question_choice (question_id, label, content, is_correct, order_index)
              VALUES ($1, $2, $3, $4, $5)
              `,
              [
                questionId,
                choice.label,
                choice.content,
                choice.isCorrect,
                choice.orderIndex,
              ],
            );
          }
        }

        await client.query("COMMIT");

        const { rows: allChoices } = await query(
          `SELECT * FROM public.question_choice WHERE question_id = $1 ORDER BY order_index ASC`,
          [questionId],
        );

        return toQuestionWithChoices(rows[0], allChoices);
      } catch (error) {
        await client.query("ROLLBACK");
        throw error;
      } finally {
        client.release();
      }
    },

    async delete(questionId) {
      const { rowCount } = await query(
        `DELETE FROM public.question WHERE question_id = $1`,
        [questionId],
      );
      return rowCount > 0;
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

    (
        SELECT qc.content
        FROM question_choice qc
        WHERE qc.question_id=q.question_id
        AND qc.is_correct=true
        LIMIT 1
    ) AS correct_answer,

    (
        SELECT json_agg(
            json_build_object(
                'choiceId',choice_id,
                'label',label,
                'content',content,
                'orderIndex',order_index
            )
            ORDER BY order_index
        )
        FROM question_choice
        WHERE question_id=q.question_id
    ) AS choices

    FROM contest_question cq
    JOIN question q
    ON q.question_id=cq.question_id

    WHERE cq.contest_id=$1
    AND cq.status='opened'

    LIMIT 1;
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
            choices: rows[0].choices ?? [],
          }
        : null;
    },
  };
}
