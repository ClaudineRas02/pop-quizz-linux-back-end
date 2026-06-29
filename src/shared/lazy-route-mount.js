// Monte un routeur Express de facon paresseuse.
// Le routeur est charge seulement lors de la premiere requete qui atteint ce chemin,
// puis il est garde en cache pour les requetes suivantes.
export function lazyRouteMount(loadRouter) {
    let routerPromise;
  
    return async (req, res, next) => {
      try {
        if (!routerPromise) {
          routerPromise = Promise.resolve(loadRouter());
        }
  
        const router = await routerPromise;
        router(req, res, next);
      } catch (error) {
        next(error);
      }
    };
  }
  