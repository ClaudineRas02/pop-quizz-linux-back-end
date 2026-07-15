import { beginTransaction, query } from "./db.js";
import { BusinessError } from "../../../domain/errors/business-error.js";
import {
  toContestQuestion,
  toQuestionStats,
} from "./mappers/question.mapper.js";

export function createPostgresStatisticsRepository() {
  return {
    async getQuestionStatistics(gameId, contestQuestionId) {
      const question = await findQuestionDetails(query, contestQuestionId, gameId);

      if (!question) {
        return null;
      }

      if (question.status === "waiting" || question.status === "opened") {
        throw new BusinessError(
          "Les statistiques sont disponibles uniquement apres la fin de la question.",
          409,
        );
      }

      const statsRow = await fetchQuestionStatsRow(query, gameId, contestQuestionId);
      return statsRow ? toQuestionStats(statsRow) : null;
    },

    async markStatsViewed(contestQuestionId) {
      const client = await beginTransaction();

      try {
        const question = await findQuestionDetails(
          client.query.bind(client),
          contestQuestionId,
        );

        if (!question) {
          await client.query("COMMIT");
          return null;
        }

        if (question.status === "waiting" || question.status === "opened") {
          throw new BusinessError(
            "La question doit etre fermee avant de marquer les statistiques comme vues.",
            409,
          );
        }

        if (question.status === "closed") {
          await markQuestionAsResults(client, contestQuestionId);
        }

        const updated = await findQuestionDetails(
          client.query.bind(client),
          contestQuestionId,
        );

        await client.query("COMMIT");
        return updated ? toContestQuestion(updated) : null;
      } catch (error) {
        await client.query("ROLLBACK");
        throw error;
      } finally {
        client.release();
      }
    },
  };
}

async function findQuestionDetails(runQuery, contestQuestionId, gameId = null) {
  const params = gameId ? [contestQuestionId, gameId] : [contestQuestionId];
  const gameFilter = gameId ? "AND cq.contest_id = $2" : "";
  const { rows } = await runQuery(
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
}

async function fetchQuestionStatsRow(runQuery, gameId, contestQuestionId) {
  const { rows } = await runQuery(
    `
    SELECT
      stats.*,
      CASE
        WHEN stats.total_answers = 0 THEN 0
        ELSE ROUND((stats.correct_answers::numeric / stats.total_answers) * 100, 2)
      END AS correct_rate,
      CASE
        WHEN stats.total_answers = 0 THEN 0
        ELSE ROUND(((stats.total_answers - stats.correct_answers)::numeric / stats.total_answers) * 100, 2)
      END AS incorrect_rate
    FROM public.v_contest_question_stats stats
    WHERE stats.contest_id = $1
      AND stats.contest_question_id = $2
    `,
    [gameId, contestQuestionId],
  );

  return rows[0] ?? null;
}

async function markQuestionAsResults(client, contestQuestionId) {
  await client.query(
    `
    UPDATE public.contest_question
    SET status = 'results'::public.contest_question_status
    WHERE contest_question_id = $1
      AND status = 'closed'::public.contest_question_status
    `,
    [contestQuestionId],
  );
}
