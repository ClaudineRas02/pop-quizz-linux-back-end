import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import { BusinessError } from "../../domain/errors/business-error.js";
import { verifyLoginData, verifyRegisterData } from "../../domain/entities/player.js";

export function createAuthUseCases({ adminRepository, playerRepository }) {
  return {
    async login(loginData) {
      const verified = verifyLoginData(loginData);

      const admin = await adminRepository.findByEmail(verified.email);
      if (admin) {
        const passwordMatches = await bcrypt.compare(verified.password, admin.passwordHash);
        if (!passwordMatches) {
          throw new BusinessError("Email ou mot de passe incorrect.", 401);
        }

        const token = jwt.sign(
          { adminId: admin.adminId, email: admin.email, role: "admin" },
          process.env.JWT_SECRET,
          { expiresIn: process.env.ACCESS_TOKEN_EXP || "24h" },
        );

        return {
          user: { adminId: admin.adminId, email: admin.email, createdAt: admin.createdAt },
          token,
          role: "admin",
        };
      }

      const player = await playerRepository.findByEmail(verified.email);
      if (!player) {
        throw new BusinessError("Email ou mot de passe incorrect.", 401);
      }

      const passwordMatches = await bcrypt.compare(verified.password, player.passwordHash);
      if (!passwordMatches) {
        throw new BusinessError("Email ou mot de passe incorrect.", 401);
      }

      const token = jwt.sign(
        { playerId: player.playerId, email: player.email, role: "player" },
        process.env.JWT_SECRET,
        { expiresIn: process.env.ACCESS_TOKEN_EXP || "24h" },
      );

      return {
        user: {
          playerId: player.playerId,
          username: player.username,
          email: player.email,
          avatarUrl: player.avatarUrl,
          createdAt: player.createdAt,
        },
        token,
        role: "player",
      };
    },

    async register(playerData) {
      const verifiedPlayer = verifyRegisterData(playerData);

      const emailExists = await playerRepository.findByEmail(verifiedPlayer.email);
      if (emailExists) {
        throw new BusinessError("Cette adresse email est déjà utilisée.", 409);
      }

      const usernameExists = await playerRepository.findByUsername(verifiedPlayer.username);
      if (usernameExists) {
        throw new BusinessError("Ce nom d'utilisateur est déjà utilisé.", 409);
      }

      const passwordHash = await bcrypt.hash(verifiedPlayer.password, 10);

      const player = await playerRepository.create({
        username: verifiedPlayer.username,
        email: verifiedPlayer.email,
        passwordHash,
        avatarUrl: verifiedPlayer.avatarUrl,
      });

      return { player };
    },
  };
}
