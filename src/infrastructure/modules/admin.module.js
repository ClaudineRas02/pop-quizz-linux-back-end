import { createAdminUseCases } from "../../application/use-cases/admin.use-cases.js";
import { createAdminController } from "../../interfaces/controllers/admin.controller.js";
import { createAdminRoutes } from "../../interfaces/routes/admin.routes.js";
import { createPostgresAdminRepository } from "../persistence/postgres/postgres-admin.repository.js";

/**
 * Module admin.
 * Assemble les dépendances :
 * repository -> usecases -> controller -> routes.
 */
export function createAdminModule() {
  const adminRepository = createPostgresAdminRepository();

  const adminUseCases = createAdminUseCases({
    adminRepository,
  });

  const adminController = createAdminController(adminUseCases);

  return {
    adminRoutes: createAdminRoutes(adminController),
  };
}