import { beginTransaction, query } from "./db.js";
import { BusinessError } from "../../../domain/errors/business-error.js";

export function createPostgresGameRepository() {
  return {
    async create({ title, totalQuestions, status, createdBy }) {
      const { rows } = await query(
        `
        INSERT INTO public.contest (title, total_questions, status, created_by)
        VALUES ($1, $2, $3, $4)
        RETURNING *
        `,
        [title, totalQuestions, status, createdBy],
      );

      return toGame(rows[0]);
    },

    async findAll() {
      const { rows } = await query(`
        SELECT *
        FROM public.contest
        ORDER BY created_at DESC
      `);

      return rows.map(toGame);
    },

    async findById(gameId) {
      const { rows } = await query(
        `
        SELECT *
        FROM public.contest
        WHERE contest_id = $1
        `,
        [gameId],
      );

      return rows[0] ? toGame(rows[0]) : null;
    },

    async update(gameId, { title, totalQuestions, status }) {
      const { rows } = await queryWithBusinessErrors(
        `
        UPDATE public.contest
        SET
          title = COALESCE($2::text, title),
          total_questions = COALESCE($3::integer, total_questions),
          status = COALESCE($4::public.contest_status, status)
        WHERE contest_id = $1
        RETURNING *
        `,
        [gameId, title ?? null, totalQuestions ?? null, status ?? null],
      );

      return rows[0] ? toGame(rows[0]) : null;
    },

    async start(gameId) {
      const { rows } = await query(
        `
        UPDATE public.contest
        SET status = 'running'::public.contest_status,
            start_time = COALESCE(start_time, NOW()),
            end_time = NULL
        WHERE contest_id = $1
          AND status = 'waiting'::public.contest_status
        RETURNING *
        `,
        [gameId],
      );

      return rows[0] ? toGame(rows[0]) : null;
    },

    async end(gameId) {
      const { rows } = await query(
        `
        UPDATE public.contest
        SET status = 'finished'::public.contest_status,
            end_time = NOW()
        WHERE contest_id = $1
          AND status = 'running'::public.contest_status
          AND start_time IS NOT NULL
        RETURNING *
        `,
        [gameId],
      );

      return rows[0] ? toGame(rows[0]) : null;
    },

    async delete(gameId) {
      const { rowCount } = await query(
        `
        DELETE FROM public.contest
        WHERE contest_id = $1
        `,
        [gameId],
      );

      return rowCount > 0;
    },

    async join(gameId, playerId) {
      const { rows } = await query(
        `
        INSERT INTO public.contest_player (contest_id, player_id, is_connected, last_seen)
        VALUES ($1, $2, true, NOW())
        ON CONFLICT (contest_id, player_id)
        DO UPDATE SET is_connected = true,
                      last_seen = NOW()
        RETURNING *
        `,
        [gameId, playerId],
      );

      return toParticipant(rows[0]);
    },

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

    async openNextQuestion(gameId) {
      const client = await beginTransaction();

      try {
        await closeExpiredQuestions(client, gameId);

        const openedQuestion = await findOpenedQuestion(client, gameId);
        if (openedQuestion) {
          const progress = await getQuestionProgress(
            client,
            openedQuestion.contest_question_id,
          );

          if (progress.answeredCount < progress.totalParticipants) {
            await client.query("COMMIT");
            return {
              blockedByOpenQuestion: true,
              question: toOpenedQuestion(openedQuestion, progress),
            };
          }

          await closeQuestion(client, openedQuestion.contest_question_id);
        }

        const { rows } = await client.query(
          `
          UPDATE public.contest_question cq
          SET status = 'opened'::public.contest_question_status,
              opened_at = NOW(),
              closed_at = NULL
          WHERE cq.contest_question_id = (
            SELECT contest_question_id
            FROM public.contest_question
            WHERE contest_id = $1
              AND status = 'waiting'::public.contest_question_status
            ORDER BY round_number ASC, order_index ASC
            LIMIT 1
          )
          RETURNING cq.*
          `,
          [gameId],
        );

        if (!rows[0]) {
          await client.query("COMMIT");
          return null;
        }

        const question = await findQuestionDetails(
          client,
          rows[0].contest_question_id,
        );
        const progress = await getQuestionProgress(
          client,
          rows[0].contest_question_id,
        );

        await client.query("COMMIT");
        return {
          blockedByOpenQuestion: false,
          question: toOpenedQuestion(question, progress),
        };
      } catch (error) {
        await client.query("ROLLBACK");
        throw error;
      } finally {
        client.release();
      }
    },

    async submitAnswer(gameId, contestQuestionId, answerData) {
      const client = await beginTransaction();
      // verifier si la question est ouverte et si le temps n'est pas ecoule
      try {
        const question = await findQuestionDetails(
          client,
          contestQuestionId,
          gameId,
        );
        if (!question) {
          await client.query("COMMIT");
          return null;
        }

        const progressBefore = await getQuestionProgress(
          client,
          contestQuestionId,
        );
        // compte le temps ecoule depuis l'ouverture de la question
        // si le temps est ecoule ou si la question est fermee, on ferme la question et on retourne que la reponse n'est pas acceptee
        const elapsedSeconds = secondsSince(question.opened_at);
        const timeExpired = elapsedSeconds > Number(question.duration);

        if (question.status !== "opened" || timeExpired) {
          if (question.status === "opened") {
            await closeQuestion(client, contestQuestionId);
          }

          await client.query("COMMIT");
          return {
            accepted: false,
            closed: true,
            reason: "QUESTION_CLOSED",
            correctAnswer: question.correct_answer,
            progress: toProgress(progressBefore),
          };
        }
        // si la question est ouverte et que le temps n'est pas ecoule, on enregistre la reponse
        // verif si firstblood answer
        const isCorrect = answerData.isCorrect;
        const firstBlood =
          isCorrect && !(await hasFirstBlood(client, contestQuestionId));
        const earnedPoints = calculateEarnedPoints(question.points, firstBlood);

        const { rows } = await client.query(
          `
          INSERT INTO public.answer (
            contest_question_id,
            player_id,
            answer_value,
            answer_type,
            is_correct,
            response_time,
            first_blood,
            earned_points
          )
          VALUES ($1, $2, $3::jsonb, $4, $5, $6, $7, $8)
          RETURNING *
          `,
          [
            contestQuestionId,
            answerData.playerId,
            JSON.stringify(answerData.answer),
            answerData.answerType,
            isCorrect,
            elapsedSeconds,
            firstBlood,
            earnedPoints,
          ],
        );

        const progressAfter = await getQuestionProgress(
          client,
          contestQuestionId,
        );
        const allAnswered =
          progressAfter.totalParticipants > 0 &&
          progressAfter.answeredCount >= progressAfter.totalParticipants;

        if (allAnswered) {
          await closeQuestion(client, contestQuestionId);
        }

        await client.query("COMMIT");
        return {
          accepted: true,
          closed: allAnswered,
          answer: toAnswer(rows[0]),
          correctAnswer: allAnswered ? question.correct_answer : null,
          progress: toProgress(progressAfter),
        };
      } catch (error) {
        await client.query("ROLLBACK");
        throw error;
      } finally {
        client.release();
      }
    },

    async findQuestionForAnswer(gameId, contestQuestionId) {
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
          AND cq.contest_question_id = $2
        ORDER BY qc.order_index ASC
        LIMIT 1
        `,
        [gameId, contestQuestionId],
      );

      return rows[0] ? toQuestionForAnswer(rows[0]) : null;
    },

    // taux des reponses correctes et incorrectes pour une question
    async getQuestionStats(gameId, contestQuestionId) {
      const { rows } = await query(
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

      return rows[0] ? toQuestionStats(rows[0]) : null;
    },

    async getLeaderboard(gameId) {
      const { rows } = await query(
        `
        SELECT *
        FROM public.v_contest_player_score
        WHERE contest_id = $1
        ORDER BY rank ASC, score DESC, avg_response_time ASC
        `,
        [gameId],
      );

      return rows.map(toLeaderboardRow);
    },

    async getResults(gameId, playerId) {
      const { rows } = await query(
        `
        SELECT EXISTS (
          SELECT 1
          FROM public.two_factor_challenge
          WHERE player_id = $2
            AND validated = true
            AND expires_at > NOW()
        ) AS two_factor_validated
        `,
        [gameId, playerId],
      );

      if (!rows[0]?.two_factor_validated) {
        return { twoFactorValidated: false, leaderboard: [] };
      }

      return {
        twoFactorValidated: true,
        leaderboard: await this.getLeaderboard(gameId),
      };
    },
  };
}

async function closeExpiredQuestions(client, gameId) {
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
}

async function findOpenedQuestion(client, gameId) {
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
    WHERE cq.contest_id = $1
      AND cq.status = 'opened'::public.contest_question_status
    ORDER BY qc.order_index ASC
    LIMIT 1
    `,
    [gameId],
  );

  return rows[0] ?? null;
}

async function findQuestionDetails(client, contestQuestionId, gameId = null) {
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
}

// nb reponses / nb participants
async function getQuestionProgress(client, contestQuestionId) {
  const { rows } = await client.query(
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
}

async function closeQuestion(client, contestQuestionId) {
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
}
// si la question a deja une reponse avec first_blood = true, alors on retourne true, sinon false
async function hasFirstBlood(client, contestQuestionId) {
  const { rows } = await client.query(
    `
    SELECT EXISTS (
      SELECT 1
      FROM public.answer
      WHERE contest_question_id = $1
        AND first_blood = true
    ) AS exists
    `,
    [contestQuestionId],
  );

  return rows[0]?.exists === true;
}

// si la question est correcte, on ajoute 5 points pour le first blood
function calculateEarnedPoints(points, firstBlood) {
  return Number(points) + (firstBlood ? 5 : 0);
}

function secondsSince(date) {
  return Number(((Date.now() - new Date(date).getTime()) / 1000).toFixed(2));
}

function toGame(row) {
  return {
    gameId: row.contest_id,
    title: row.title,
    status: row.status,
    createdBy: row.created_by,
    totalQuestions: row.total_questions,
    startTime: row.start_time,
    endTime: row.end_time,
    createdAt: row.created_at,
  };
}

function toParticipant(row) {
  return {
    contestPlayerId: row.contest_player_id,
    gameId: row.contest_id,
    playerId: row.player_id,
    joinedAt: row.joined_at,
    isConnected: row.is_connected,
    lastSeen: row.last_seen,
  };
}

function toContestQuestion(row) {
  return {
    contestQuestionId: row.contest_question_id,
    gameId: row.contest_id,
    questionId: row.question_id,
    roundNumber: row.round_number,
    orderIndex: row.order_index,
    status: row.status,
    openedAt: row.opened_at,
    closedAt: row.closed_at,
  };
}

function toQuestionForAnswer(row) {
  return {
    contestQuestionId: row.contest_question_id,
    gameId: row.contest_id,
    questionId: row.question_id,
    status: row.status,
    type: row.type,
    points: row.points,
    duration: row.duration,
    openedAt: row.opened_at,
    correctAnswer: row.correct_answer,
  };
}

function toOpenedQuestion(row, progress) {
  return {
    contestQuestionId: row.contest_question_id,
    gameId: row.contest_id,
    questionId: row.question_id,
    roundNumber: row.round_number,
    orderIndex: row.order_index,
    status: row.status,
    openedAt: row.opened_at,
    closedAt: row.closed_at,
    statement: row.statement,
    category: row.category,
    type: row.type,
    duration: row.duration,
    points: row.points,
    explanation: row.explanation,
    progress: toProgress(progress),
  };
}

function toProgress(progress) {
  return {
    answeredCount: progress.answeredCount,
    totalParticipants: progress.totalParticipants,
  };
}

function toAnswer(row) {
  return {
    answerId: row.answer_id,
    contestQuestionId: row.contest_question_id,
    playerId: row.player_id,
    answerValue: row.answer_value,
    answerType: row.answer_type,
    isCorrect: row.is_correct,
    responseTime: row.response_time,
    firstBlood: row.first_blood,
    earnedPoints: row.earned_points,
    submittedAt: row.submitted_at,
  };
}

function toQuestionStats(row) {
  return {
    contestQuestionId: row.contest_question_id,
    gameId: row.contest_id,
    questionId: row.question_id,
    roundNumber: row.round_number,
    orderIndex: row.order_index,
    status: row.status,
    openedAt: row.opened_at,
    closedAt: row.closed_at,
    statement: row.statement,
    points: row.points,
    duration: row.duration,
    totalAnswers: Number(row.total_answers),
    correctAnswers: Number(row.correct_answers),
    incorrectAnswers: Number(row.total_answers) - Number(row.correct_answers),
    firstBloodCount: Number(row.first_blood_count),
    avgResponseTime: Number(row.avg_response_time),
    correctRate: Number(row.correct_rate),
    incorrectRate: Number(row.incorrect_rate),
  };
}

function toLeaderboardRow(row) {
  return {
    gameId: row.contest_id,
    playerId: row.player_id,
    username: row.username,
    avatarUrl: row.avatar_url,
    score: Number(row.score),
    correctAnswers: Number(row.correct_answers),
    wrongAnswers: Number(row.wrong_answers),
    firstBloodCount: Number(row.first_blood_count),
    avgResponseTime: Number(row.avg_response_time),
    rank: Number(row.rank),
  };
}

// Gestion des erreurs PostgreSQL les plus courantes.
async function queryWithBusinessErrors(sql, params) {
  try {
    return await query(sql, params);
  } catch (error) {
    // Violation de contrainte.
    if (error.code === "23514") {
      throw new BusinessError(
        "Violation de contrainte dans DB.Vous vous devez respecter les regles de validation definies pour cette operation.",
        409,
      );
    }

    throw error;
  }
}
