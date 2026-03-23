/**
 * Global error handler middleware.
 * Must be the last middleware registered.
 */
function errorHandler(err, req, res, next) {
  // Default to 500
  let statusCode = err.statusCode || err.status || 500;
  let message = err.message || 'Internal Server Error';

  // Supabase errors
  if (err.code === '23505') {
    statusCode = 409;
    message = 'A record with that value already exists';
  }
  if (err.code === '23503') {
    statusCode = 400;
    message = 'Referenced record does not exist';
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  }
  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
  }

  // Log server errors only
  if (statusCode >= 500) {
    console.error(`[ERROR] ${err.message}`, err.stack);
  } else {
    console.warn(`[WARN] ${statusCode} — ${message}`);
  }

  res.status(statusCode).json({
    error: message,
    ...(process.env.NODE_ENV === 'development' && statusCode >= 500 && {
      stack: err.stack,
    }),
  });
}

module.exports = errorHandler;
