import { query } from "./db.js";
import { BusinessError } from "../../../domain/errors/business-error.js";

export function createPostgresAdminRepository() {
  return {
    async create({ adminId, email, passwordHash }) {
      const { rows } = await queryWithBusinessErrors(
        `
        INSERT INTO public.admin (
          admin_id,
          email,
          password_hash
        )
        VALUES ($1, $2, $3)
        RETURNING *
        `,
        [adminId, email, passwordHash],
      );

      return toAdmin(rows[0]);
    },

    async findById(adminId) {
      const { rows } = await query(
        `
        SELECT *
        FROM public.admin
        WHERE admin_id = $1
        `,
        [adminId],
      );

      return rows[0] ? toAdmin(rows[0]) : null;
    },

    async findByEmail(email) {
      const { rows } = await query(
        `
        SELECT *
        FROM public.admin
        WHERE email = $1
        `,
        [email],
      );

      return rows[0] ? toAdmin(rows[0]) : null;
    },

    async findAll() {
      const { rows } = await query(
        `
        SELECT *
        FROM public.admin
        ORDER BY created_at DESC
        `,
      );

      return rows.map(toAdmin);
    },

    async delete(adminId) {
      const { rowCount } = await query(
        `
        DELETE FROM public.admin
        WHERE admin_id = $1
        `,
        [adminId],
      );

      return rowCount > 0;
    },
  };
}

function toAdmin(row) {
  return {
    adminId: row.admin_id,
    email: row.email,
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
        "Email ou identifiant déjà utilisé.",
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