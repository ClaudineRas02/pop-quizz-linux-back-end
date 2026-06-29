import { Router } from "express";
import { adaptRoute } from "../../shared/express-route-adapter.js";
import { requireAuth } from "../../infrastructure/http/middlewares/auth.middleware.js";

/**
 * Routes admin.
 * Toutes les routes sont protégées par auth + role admin.
 */
export function createAdminRoutes(adminController) {
  const router = Router();

  // Protection globale : utilisateur connecté + role admin uniquement
  router.use(requireAuth);

  /**
   * GET /api/admin
   * Liste tous les admins
   */
  router.get("/", adaptRoute(adminController.listAdmins));

  /**
   * GET /api/admin/:adminId
   */
  router.get("/:adminId", adaptRoute(adminController.getAdminById));

  /**
   * GET /api/admin/email/:email
   */
  router.get("/email/:email", adaptRoute(adminController.getAdminByEmail));

  /**
   * POST /api/admin
   */
  router.post("/", adaptRoute(adminController.createAdmin));

  /**
   * PATCH /api/admin/:adminId
   */
  router.patch("/:adminId", adaptRoute(adminController.updateAdmin));

  /**
   * PATCH /api/admin/:adminId/password
   */
  router.patch(
    "/:adminId/password",
    adaptRoute(adminController.changeAdminPassword),
  );

  /**
   * DELETE /api/admin/:adminId
   */
  router.delete("/:adminId", adaptRoute(adminController.deleteAdmin));

  return router;
}