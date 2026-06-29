// Middleware d'erreur Express.
// Express l'appelle automatiquement quand un controller ou une route fait next(error).
// export function errorMiddleware(error, req, res, next) {
//   const statusCode = error.statusCode ?? error.status ?? 500;
//   const message = statusCode < 500 ? error.message : 'Erreur interne du serveur.';

//   res.status(statusCode).json({ message });
// }

export function errorMiddleware(err, req, res, next) {
    console.error("ERROR STACK:", err);
  
    res.status(err.statusCode || 500).json({
      message: err.message || "Erreur interne du serveur.",
      stack: err.stack, // uniquement en dev
    });
  }
  