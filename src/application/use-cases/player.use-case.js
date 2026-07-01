import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import { BusinessError } from "../../domain/errors/business-error.js";
import {
  verifyLoginData,
  verifyRegisterData,
} from "../../domain/entities/player.js";

export function createPlayerUseCases({ playerRepository }) {
  return {

    async register(playerData) {
      const verifiedPlayer = verifyRegisterData(playerData);

      const emailExists = await playerRepository.findByEmail(
        verifiedPlayer.email,
      );

      if (emailExists) {
        throw new BusinessError(
          "Cette adresse email est déjà utilisée.",
          409,
        );
      }

      const usernameExists = await playerRepository.findByUsername(
        verifiedPlayer.username,
      );

      if (usernameExists) {
        throw new BusinessError(
          "Ce nom d'utilisateur est déjà utilisé.",
          409,
        );
      }

      const passwordHash = await bcrypt.hash(
        verifiedPlayer.password,
        10,
      );

      const player = await playerRepository.create({
        username: verifiedPlayer.username,
        email: verifiedPlayer.email,
        passwordHash,
        avatarUrl: verifiedPlayer.avatarUrl,
      });

      return {
        player,
      };
    },

    async login(loginData) {
      const verifiedLogin = verifyLoginData(loginData);

      const player = await playerRepository.findByEmail(
        verifiedLogin.email,
      );

      if (!player) {
        throw new BusinessError(
          "Email ou mot de passe incorrect.",
          401,
        );
      }

      const passwordMatches = await bcrypt.compare(
        verifiedLogin.password,
        player.passwordHash,
      );

      if (!passwordMatches) {
        throw new BusinessError(
          "Email ou mot de passe incorrect.",
          401,
        );
      }

      const token = jwt.sign(
        {
          playerId: player.playerId,
          email: player.email,
        },
        process.env.JWT_SECRET,
        {
          expiresIn: "24h",
        },
      );

      return {
        player: sanitizePlayer(player),
        token,
      };
    },

    async getAllPlayers() {
      const players = await playerRepository.findAll();
      return players.map(sanitizePlayer);
    },

    async getPlayerById(playerId) {
      const player = await playerRepository.findById(playerId);

      if (!player) {
        throw new BusinessError("Player introuvable", 404);
      }

      return sanitizePlayer(player);
    },

    async updatePlayerAvatar(playerId, avatarUrl) {
      if (!avatarUrl) {
        throw new BusinessError("Avatar invalide", 400);
      }

      const updated = await playerRepository.updateAvatar(
        playerId,
        avatarUrl,
      );

      if (!updated) {
        throw new BusinessError("Player introuvable", 404);
      }

      return sanitizePlayer(updated);
    },

    async deletePlayer(playerId) {
      const deleted = await playerRepository.delete(playerId);

      if (!deleted) {
        throw new BusinessError("Player introuvable", 404);
      }

      return { success: true };
    },
  };
}

function sanitizePlayer(player) {
  return {
    playerId: player.playerId,
    username: player.username,
    email: player.email,
    avatarUrl: player.avatarUrl,
    createdAt: player.createdAt,
  };
}