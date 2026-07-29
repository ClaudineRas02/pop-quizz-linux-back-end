import { createAuthUseCases } from "../../application/use-cases/auth.use-case.js";
import { createAuthController } from "../../interfaces/controllers/auth.controller.js";
import { createPostgresAdminRepository } from "../persistence/postgres/postgres-admin.repository.js";
import { createPostgresPlayerRepository } from "../persistence/postgres/postgres-player.repository.js";
import { createAuthRoutes } from "../../interfaces/routes/auth.routes.js";

export function createAuthModule() {
  const adminRepository = createPostgresAdminRepository();
  const playerRepository = createPostgresPlayerRepository();

  const authUseCases = createAuthUseCases({
    adminRepository,
    playerRepository,
  });

  const authController = createAuthController(authUseCases);

  return {
    publicRoutes: createAuthRoutes(authController),
    adminRoutes: null,
  };
}
