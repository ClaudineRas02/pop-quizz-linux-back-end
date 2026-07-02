import { createPlayerController } from "../../interfaces/controllers/player.controller.js";
import { createPlayerUseCases } from "../../application/use-cases/player.use-case.js";
import { createPostgresPlayerRepository } from "../persistence/postgres/postgres-player.repository.js";
import { createAuthRoutes } from "../../interfaces/routes/auth.routes.js";

// Module Auth (Player)
// Assemble repository -> use cases -> controller -> routes

export function createAuthModule() {
    const playerRepository = createPostgresPlayerRepository();
  
    const playerUseCases = createPlayerUseCases({
      playerRepository,
    });
  
    const playerController = createPlayerController(playerUseCases);
  
    return {
      publicRoutes: createAuthRoutes(playerController),
      adminRoutes: null,
    };
  }