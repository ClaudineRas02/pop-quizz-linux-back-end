import { createPlayerController } from "../../interfaces/controllers/player.controller.js";
import { createPlayerUseCases } from "../../application/use-cases/player.use-case.js";
import { createPostgresPlayerRepository } from "../persistence/postgres/postgres-player.repository.js";

import { createPlayerRoutes } from "../../interfaces/routes/public-player.routes.js";
import { createAdminPlayerRoutes } from "../../interfaces/routes/admin-player.routes.js";

export function createPlayerModule() {
  const playerRepository = createPostgresPlayerRepository();

  const playerUseCases = createPlayerUseCases({
    playerRepository,
  });

  const playerController = createPlayerController(playerUseCases);

  return {
    publicRoutes: createPlayerRoutes(playerController),
    adminRoutes: createAdminPlayerRoutes(playerController),
  };
}