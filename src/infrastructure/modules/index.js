// Registre des modules applicatifs.
// app.js ne connait plus les modules un par un : il recupere seulement ce registre.
// Chaque module est charge en lazy loading a la premiere requete qui en a besoin.
export function createApplicationModules() {
  return {
    //crud pour user admin
    admin: createLazyModule(async () => {
      const { createAdminModule } = await import("./admin.module.js");
      return createAdminModule();
    }),

    auth: createLazyModule(async () => {
      const { createAuthModule } = await import("./auth.module.js");
      return createAuthModule();
    }),

    game: createLazyModule(async () => {
      const { createGameModule } = await import("./game.module.js");
      return createGameModule();
    }),

    player: createLazyModule(async () => {
      const { createPlayerModule } = await import("./player.module.js");
      return createPlayerModule();
    }),
  };
}

function createLazyModule(loadModule) {
  let modulePromise;

  async function getModule() {
    if (!modulePromise) {
      modulePromise = loadModule();
    }

    return modulePromise;
  }

  return {
    async getPublicRoutes() {
      const module = await getModule();
      return module.publicRoutes || null;
    },

    async getAdminRoutes() {
      const module = await getModule();
      return module.adminRoutes || null;
    },
  };
}
