/**
 * Controleur des admins.
 * Traduit les requetes HTTP en appels aux cas d'usage admin.
 */
export function createAdminController(adminUseCases) {
  return {
    /**
     * GET /api/admin
     */
    async listAdmins() {
      const admins = await adminUseCases.listAdmins();

      return {
        statusCode: 200,
        body: { data: admins },
      };
    },

    /**
     * GET /api/admin/:adminId
     */
    async getAdminById({ params }) {
      const admin = await adminUseCases.getAdminById(params.adminId);

      return {
        statusCode: 200,
        body: { data: admin },
      };
    },

    /**
     * GET /api/admin/email/:email
     */
    async getAdminByEmail({ params }) {
      const admin = await adminUseCases.getAdminByEmail(params.email);

      return {
        statusCode: 200,
        body: { data: admin },
      };
    },

    /**
     * POST /api/admin
     */
    async createAdmin({ body }) {
      const admin = await adminUseCases.createAdmin(body);

      return {
        statusCode: 201,
        body: { data: admin },
      };
    },

    /**
     * PATCH /api/admin/:adminId
     */
    async updateAdmin({ params, body }) {
      const admin = await adminUseCases.updateAdmin({
        adminId: params.adminId,
        ...body,
      });

      return {
        statusCode: 200,
        body: { data: admin },
      };
    },

    /**
     * PATCH /api/admin/:adminId/password
     */
    async changeAdminPassword({ params, body }) {
      await adminUseCases.changeAdminPassword({
        adminId: params.adminId,
        password: body.password,
      });

      return {
        statusCode: 200,
        body: { success: true },
      };
    },

    /**
     * DELETE /api/admin/:adminId
     */
    async deleteAdmin({ params }) {
      await adminUseCases.deleteAdmin(params.adminId);

      return {
        statusCode: 204,
        body: null,
      };
    },
  };
}