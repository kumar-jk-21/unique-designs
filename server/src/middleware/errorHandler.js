const { failure } = require('../utils/apiResponse');

function notFoundHandler(req, res) {
  return failure(res, 'Route not found', 404);
}

// Express recognizes error-handling middleware by its 4-argument signature.
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  console.error('[ERROR]', err.message);
  if (process.env.NODE_ENV === 'development') {
    console.error(err.stack);
  }

  // Prisma known errors
  if (err.code === 'P2002') {
    const field = Array.isArray(err.meta?.target) ? err.meta.target.join(', ') : 'field';
    return failure(res, `A record with this ${field} already exists`, 409);
  }
  if (err.code === 'P2025') {
    return failure(res, 'Requested record was not found', 404);
  }

  // Multer file size / type errors
  if (err.name === 'MulterError') {
    return failure(res, `Upload error: ${err.message}`, 400);
  }

  if (err.status) {
    return failure(res, err.message || 'Request failed', err.status);
  }

  // Never leak raw internals to the client
  return failure(res, 'Something went wrong. Please try again later.', 500);
}

module.exports = { notFoundHandler, errorHandler };
