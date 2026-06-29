// Registre des modules applicatifs.
// app.js ne connait plus les modules un par un : il recupere seulement ce registre.
// Chaque module est charge en lazy loading a la premiere requete qui en a besoin.
export function createApplicationModules() {
    return {
      //crud pour user admin
      adminuser: createLazyModule(async () => {
        const { createAdminuserModule } = await import("./admin.module.js");
        return createAdminuserModule();
      }),
      
      auth: createLazyModule(async () => {
        const { createAuthModule } = await import("./auth.module.js");
        return createAuthModule();
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
        return module.publicRoutes;
      },
  
      async getAdminRoutes() {
        const module = await getModule();
        return module.adminRoutes;
      },
    };
  }
  