import { createAdminUseCases } from "../../application/use-cases/admin.use-case.js";
import { createAdminController } from "../../interfaces/controllers/admin.controller.js";
import { createAdminRoutes } from "../../interfaces/routes/admin-admin.routes.js";
import { createPostgresAdminRepository } from "../persistence/postgres/postgres-admin.repository.js";

/**
 * Module admin
 * repository -> usecases -> controller -> routes
 */
export function createAdminModule() {
  const adminRepository = createPostgresAdminRepository();

  const adminUseCases = createAdminUseCases({
    adminRepository,
  });

  const adminController = createAdminController(adminUseCases);

  return {
    adminRoutes: createAdminRoutes(adminController),
    publicRoutes: null,
  };
}