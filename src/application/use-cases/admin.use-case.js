import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import { BusinessError } from "../../domain/errors/business-error.js";
import {
  verifyLoginData,
  verifyRegisterData,
} from "../../domain/entities/admin.js";

export function createAdminUseCases({ adminRepository }) {
  return {
    async register(adminData) {
      const verifiedAdmin = verifyRegisterData(adminData);

      const emailExists = await adminRepository.findByEmail(
        verifiedAdmin.email,
      );

      if (emailExists) {
        throw new BusinessError(
          "Cette adresse email est déjà utilisée.",
          409,
        );
      }

      const passwordHash = await bcrypt.hash(
        verifiedAdmin.password,
        10,
      );

      const admin = await adminRepository.create({
        email: verifiedAdmin.email,
        passwordHash,
      });

      return {
        admin: sanitizeAdmin(admin),
      };
    },

    async login(loginData) {
      const verifiedLogin = verifyLoginData(loginData);

      const admin = await adminRepository.findByEmail(
        verifiedLogin.email,
      );

      if (!admin) {
        throw new BusinessError(
          "Email ou mot de passe incorrect.",
          401,
        );
      }

      const passwordMatches = await bcrypt.compare(
        verifiedLogin.password,
        admin.passwordHash,
      );

      if (!passwordMatches) {
        throw new BusinessError(
          "Email ou mot de passe incorrect.",
          401,
        );
      }

      const token = jwt.sign(
        {
          adminId: admin.adminId, 
          email: admin.email,
          role: "admin",
        },
        process.env.JWT_SECRET,
        {
          expiresIn: process.env.ACCESS_TOKEN_EXP || "24h",
        },
      );

      return {
        admin: sanitizeAdmin(admin),
        token,
      };
    },

    async getAllAdmins() {
      const admins = await adminRepository.findAll();
      return admins.map(sanitizeAdmin);
    },

    async getAdminById(adminId) {
      if (!adminId) {
        throw new BusinessError("adminId invalide", 400);
      }

      const admin = await adminRepository.findById(adminId);

      if (!admin) {
        throw new BusinessError(
          "Administrateur introuvable",
          404,
        );
      }

      return sanitizeAdmin(admin);
    },

    async deleteAdmin(adminId) {
      if (!adminId) {
        throw new BusinessError("adminId invalide", 400);
      }

      const deleted = await adminRepository.delete(adminId);

      if (!deleted) {
        throw new BusinessError(
          "Administrateur introuvable",
          404,
        );
      }

      return { success: true };
    },
  };
}

function sanitizeAdmin(admin) {
  if (!admin) return null;

  return {
    adminId: admin.adminId, 
    email: admin.email,
    createdAt: admin.createdAt,
  };
}