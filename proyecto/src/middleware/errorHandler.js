// Middleware de gestión de errores centralizado
export const errorHandler = (err, req, res, next) => {
  console.error(`[ERROR] ${req.method} ${req.path}:`, err.message);

  const status = err.status || 500;
  const message = err.message || "Error interno del servidor";

  res.status(status).json({
    error: true,
    message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

// Wrapper asíncrono para evitar try/catch en cada controlador
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
