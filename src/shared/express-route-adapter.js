// Adapte nos controllers a Express.
// Les controllers retournent { statusCode, body } pour rester independants du framework.
// Cette fonction transforme ce retour en reponse Express : res.status(...).json(...).
export function adaptRoute(controllerAction) {
    return async (req, res, next) => {
      try {
        const result = await controllerAction({
          body: req.body,
          params: req.params,
          query: req.query,
          user: req.user,
          headers: req.headers,
        });
  
        if (result?.filePath) {
          return res.download(result.filePath);
        }
  
        res.status(result.statusCode).json(result.body);
      } catch (error) {
        next(error);
      }
    };
  }
  