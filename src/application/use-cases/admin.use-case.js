import { BusinessError } from "../../domain/errors/business-error.js";
import {
  verifyAdmin,
  verifyAdminUpdate,
  normalizeAdminEmail,
} from "../../domain/entities/admin.js";
import bcrypt from "bcrypt";

/**
 * Regroupe les actions possibles autour des admins.
 * Le repository est injecté pour garder une persistance interchangeable.
 */
export function createAdminUseCases({ adminRepository }) {
  return {
    /**
     * Retourne tous les admins.
     */
    listAdmins() {
      return adminRepository.findAll();
    },

    /**
     * Retourne un admin par ID.
     */
    async getAdminById(adminId) {
      const admin = await adminRepository.findById(adminId);

      if (!admin) {
        throw new BusinessError("L'admin demandé n'existe pas.", 404);
      }

      return admin;
    },

    /**
     * Retourne un admin par email.
     */
    async getAdminByEmail(email) {
      const admin = await adminRepository.findByEmail(
        normalizeAdminEmail(email),
      );

      if (!admin) {
        throw new BusinessError("L'admin demandé n'existe pas.", 404);
      }

      return admin;
    },

    /**
     * Création d’un admin.
     */
    async createAdmin(payload) {
      const admin = verifyAdmin(payload);

      const existing = await adminRepository.findByEmail(admin.email);

      if (existing) {
        throw new BusinessError(
          "Un admin avec cet email existe déjà.",
          409,
        );
      }

      const passwordHash = await bcrypt.hash(admin.password, 10);

      return adminRepository.save({
        email: admin.email,
        password_hash: passwordHash,
        role: admin.role,
      });
    },

    /**
     * Mise à jour partielle d’un admin.
     */
    async updateAdmin({ adminId, ...payload }) {
      const update = verifyAdminUpdate(payload);

      const updated = await adminRepository.update(adminId, update);

      if (!updated) {
        throw new BusinessError("L'admin demandé n'existe pas.", 404);
      }

      return updated;
    },

    /**
     * Modification du mot de passe admin.
     */
    async changeAdminPassword({ adminId, password }) {
      const admin = await adminRepository.findById(adminId);

      if (!admin) {
        throw new BusinessError("L'admin demandé n'existe pas.", 404);
      }

      if (!password || password.length < 6) {
        throw new BusinessError("Mot de passe invalide.", 400);
      }

      const password_hash = await bcrypt.hash(password, 10);

      await adminRepository.setPasswordHash(adminId, password_hash);

      return true;
    },

    /**
     * Suppression d’un admin.
     */
    async deleteAdmin(adminId) {
      const deleted = await adminRepository.delete(adminId);

      if (!deleted) {
        throw new BusinessError("L'admin demandé n'existe pas.", 404);
      }

      return deleted;
    },
  };
}