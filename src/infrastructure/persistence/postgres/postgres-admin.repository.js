import { query } from "./db.js";
import { BusinessError } from "../../../domain/errors/business-error.js";

/**
 * Repository PostgreSQL des admins.
 * Implémente la couche persistence des admins.
 */
export function createPostgresAdminRepository() {
  return {
    /**
     * Retourne tous les admins.
     */
    async findAll() {
      const result = await query(`
        SELECT
          admin_id,
          email,
          password_hash,
          created_at
        FROM public.admin
        ORDER BY created_at DESC
      `);

      return result.rows.map(toAdmin);
    },

    /**
     * Trouve un admin par ID.
     */
    async findById(adminId) {
      const result = await query(
        `
        SELECT
          admin_id,
          email,
          password_hash,
          created_at
        FROM public.admin
        WHERE admin_id = $1
        `,
        [adminId],
      );

      return result.rows[0] ? toAdmin(result.rows[0]) : null;
    },

    /**
     * Trouve un admin par email.
     */
    async findByEmail(email) {
      const result = await query(
        `
        SELECT
          admin_id,
          email,
          password_hash,
          created_at
        FROM public.admin
        WHERE email = $1
        `,
        [email],
      );

      return result.rows[0] ? toAdmin(result.rows[0]) : null;
    },

    /**
     * Sauvegarde un nouvel admin.
     */
    async save(admin) {
      try {
        const result = await query(
          `
          INSERT INTO public.admin (email, password_hash)
          VALUES ($1, $2)
          RETURNING admin_id, email, password_hash, created_at
          `,
          [admin.email, admin.password_hash],
        );

        return toAdmin(result.rows[0]);
      } catch (error) {
        // Email unique violation
        if (error.code === "23505") {
          throw new BusinessError(
            "Un admin avec cet email existe deja.",
            409,
          );
        }

        throw error;
      }
    },

    /**
     * Mise à jour partielle d’un admin.
     */
    async update(adminId, payload) {
      const result = await query(
        `
        UPDATE public.admin
        SET
          email = COALESCE($2::text, email)
        WHERE admin_id = $1
        RETURNING admin_id, email, password_hash, created_at
        `,
        [adminId, payload.email ?? null],
      );

      return result.rows[0] ? toAdmin(result.rows[0]) : null;
    },

    /**
     * Mise à jour du password hash uniquement.
     */
    async setPasswordHash(adminId, passwordHash) {
      const result = await query(
        `
        UPDATE public.admin
        SET password_hash = $2
        WHERE admin_id = $1
        RETURNING admin_id
        `,
        [adminId, passwordHash],
      );

      return result.rows.length > 0;
    },

    /**
     * Suppression d’un admin.
     */
    async delete(adminId) {
      const result = await query(
        `
        DELETE FROM public.admin
        WHERE admin_id = $1
        RETURNING admin_id
        `,
        [adminId],
      );

      return result.rows.length > 0;
    },
  };
}

/**
 * Convertit SQL snake_case → objet métier camelCase
 */
function toAdmin(row) {
  return {
    adminId: row.admin_id,
    email: row.email,
    passwordHash: row.password_hash,
    createdAt: row.created_at,
  };
}