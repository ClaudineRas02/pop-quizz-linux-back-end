import { query } from "./db.js";
import { BusinessError } from "../../../domain/errors/business-error.js";

export function createPostgresPlayerRepository() {
  return {
    async create({ username, email, passwordHash, avatarUrl }) {
      const { rows } = await queryWithBusinessErrors(
        `
        INSERT INTO public.player (
          username,
          email,
          password_hash,
          avatar_url
        )
        VALUES ($1, $2, $3, $4)
        RETURNING *
        `,
        [username, email, passwordHash, avatarUrl],
      );

      return toPlayer(rows[0]);
    },

    async findById(playerId) {
      const { rows } = await query(
        `
        SELECT *
        FROM public.player
        WHERE player_id = $1
        `,
        [playerId],
      );

      return rows[0] ? toPlayer(rows[0]) : null;
    },

    async findByEmail(email) {
      const { rows } = await query(
        `
        SELECT *
        FROM public.player
        WHERE email = $1
        `,
        [email],
      );

      return rows[0] ? toPlayer(rows[0]) : null;
    },

    async findByUsername(username) {
      const { rows } = await query(
        `
        SELECT *
        FROM public.player
        WHERE username = $1
        `,
        [username],
      );

      return rows[0] ? toPlayer(rows[0]) : null;
    },

    async findAll() {
      const { rows } = await query(
        `
        SELECT *
        FROM public.player
        ORDER BY created_at DESC
        `,
      );

      return rows.map(toPlayer);
    },

    async updateAvatar(playerId, avatarUrl) {
      const { rows } = await queryWithBusinessErrors(
        `
        UPDATE public.player
        SET avatar_url = $2
        WHERE player_id = $1
        RETURNING *
        `,
        [playerId, avatarUrl],
      );

      return rows[0] ? toPlayer(rows[0]) : null;
    },

    async update(playerId, { username, email, avatarUrl }) {
      const { rows } = await queryWithBusinessErrors(
        `
        UPDATE public.player
        SET
          username = COALESCE($2, username),
          email = COALESCE($3, email),
          avatar_url = COALESCE($4, avatar_url)
        WHERE player_id = $1
        RETURNING *
        `,
        [playerId, username, email, avatarUrl],
      );

      return rows[0] ? toPlayer(rows[0]) : null;
    },

    async updatePassword(playerId, passwordHash) {
      const { rows } = await queryWithBusinessErrors(
        `
        UPDATE public.player
        SET password_hash = $2
        WHERE player_id = $1
        RETURNING *
        `,
        [playerId, passwordHash],
      );

      return rows[0] ? toPlayer(rows[0]) : null;
    },

    async delete(playerId) {
      const { rowCount } = await queryWithBusinessErrors(
        `
        DELETE FROM public.player
        WHERE player_id = $1
        `,
        [playerId],
      );

      return rowCount > 0;
    },
  };
}

function toPlayer(row) {
  return {
    playerId: row.player_id,
    username: row.username,
    email: row.email,
    avatarUrl: row.avatar_url,
    passwordHash: row.password_hash,
    createdAt: row.created_at,
  };
}

async function queryWithBusinessErrors(sql, params) {
  try {
    return await query(sql, params);
  } catch (error) {
    if (error.code === "23505") {
      throw new BusinessError(
        "Email ou nom d'utilisateur déjà utilisé.",
        409,
      );
    }

    if (error.code === "23514") {
      throw new BusinessError(
        "Violation de contrainte de données.",
        400,
      );
    }

    throw error;
  }
}