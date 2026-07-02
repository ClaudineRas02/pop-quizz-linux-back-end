export function createAdminController(adminUseCases) {
  return {
    // POST /admin/register
    async register({ body }) {
      const result = await adminUseCases.register(body);
      return created(result);
    },

    // POST /admin/login
    async login({ body }) {
      const result = await adminUseCases.login(body);
      return ok(result);
    },

    // GET /admin
    async getAdmins() {
      const result = await adminUseCases.getAllAdmins();
      return ok(result);
    },

    // GET /admin/:id
    async getAdminById({ params }) {
      const result = await adminUseCases.getAdminById(params.adminId);
      return ok(result);
    },

    // GET /admin/me
    async getMe({ user }) {
      if (!user || user.role !== "admin") {
        throw new Error("Unauthorized");
      }

      const result = await adminUseCases.getAdminById(user.adminId);
      return ok(result);
    },

    // DELETE /admin/:id
    async deleteAdmin({ params, user }) {
      if (!user || user.role !== "admin") {
        throw new Error("Unauthorized");
      }

      const result = await adminUseCases.deleteAdmin(params.adminId);
      return ok(result);
    },
  };
}

function ok(data) {
  return {
    statusCode: 200,
    body: { data },
  };
}

function created(data) {
  return {
    statusCode: 201,
    body: { data },
  };
}