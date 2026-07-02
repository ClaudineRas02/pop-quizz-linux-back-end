import { Router } from "express";
import { adaptRoute } from "../../shared/express-route-adapter.js";
import { requireAuth } from "../../infrastructure/http/middlewares/auth.middleware.js";
import { requireAdmin } from "../../infrastructure/http/middlewares/admin-auth.middleware.js";

export function createAdminRoutes(adminController) {
  const router = Router();

  /**
   * PUBLIC ADMIN AUTH ROUTES
   * (pas besoin de token)
   */

  router.post(
    "/register",
    adaptRoute(adminController.register)
  );

  router.post(
    "/login",
    adaptRoute(adminController.login)
  );

  /**
   * PROTECTED ADMIN ROUTES
   * JWT + role admin obligatoire
   */
  router.use(requireAuth);
  router.use(requireAdmin);

  /**
   * GET current admin
   * GET /admin/me
   */
  router.get(
    "/me",
    adaptRoute(adminController.getMe)
  );

  /**
   * LIST ALL ADMINS
   * GET /admin
   */
  router.get(
    "/list",
    adaptRoute(adminController.getAdmins)
  );

  /**
   * GET admin by id
   * GET /admin/:adminId
   */
  router.get(
    "/:adminId",
    adaptRoute(adminController.getAdminById)
  );

  /**
   * DELETE admin
   * DELETE /admin/:adminId
   */
  router.delete(
    "/:adminId",
    adaptRoute(adminController.deleteAdmin)
  );

  return router;
}