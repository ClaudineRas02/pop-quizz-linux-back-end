import { ok, created } from "../utils/success.js";

export function createAuthController(authUseCases) {
  return {
    async login({ body }) {
      const result = await authUseCases.login(body);
      return ok(result);
    },

    async register({ body }) {
      const result = await authUseCases.register(body);
      return created(result);
    },
  };
}
