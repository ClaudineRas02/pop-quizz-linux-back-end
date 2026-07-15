import { beginTransaction, query } from "./db.js";
import { toGame, toParticipant } from "./mappers/game.mapper.js";
import { autoCreateRoundsForContest } from "../../../application/services/game-round-generator.service.js";
import { queryWithBusinessErrors } from "./postgres-error.js";
import { BusinessError } from "../../../domain/errors/business-error.js";

export function createPostgresGameRepository() {
  return {
    async create({ title, totalQuestions, status, createdBy }) {
      console.log("totalQuestions", totalQuestions);
      const client = await beginTransaction();
      // créer la partie
      try {
        const { rows } = await client.query(
          `
          INSERT INTO public.contest (title, total_questions, status, created_by)
          VALUES ($1, $2, $3, $4)
          RETURNING *
          `,
          [title, totalQuestions, status, createdBy],
        );

        const contest = rows[0];
        // auto créer les rounds et les questions pour la partie
        await autoCreateRoundsForContest(
          client,
          contest.contest_id,
          Number(totalQuestions ?? 0),
        );
        // récupérer la partie avec le nombre total de questions mis à jour
        const refreshedContest = await fetchContestById(
          client,
          contest.contest_id,
        );

        await client.query("COMMIT");
        return toGame(refreshedContest ?? contest);
      } catch (error) {
        await client.query("ROLLBACK");
        if (error.code == "23503") {
          throw new BusinessError(
            "Impossible de créer la partie. L'administrateur qui a créé la partie n'existe pas.",
            400,
          );
        }
        throw error;
      } finally {
        client.release();
      }
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

    // demarre une partie : on met à jour le status de la partie en cours et on met à jour le start_time
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

      return rows.map((row) => ({
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
      }));
    },

    //leaderboard + validation 2FA
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
      // enlever si l implementation 2fa n'est pas encore faite
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

async function fetchContestById(client, gameId) {
  const { rows } = await client.query(
    `
    SELECT *
    FROM public.contest
    WHERE contest_id = $1
    LIMIT 1
    `,
    [gameId],
  );

  return rows[0] ?? null;
}
