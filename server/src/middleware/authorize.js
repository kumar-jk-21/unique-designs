const { failure } = require('../utils/apiResponse');

/**
 * Usage: authorize('ADMIN', 'SUPER_ADMIN')
 * Must run after `authenticate` so req.user is populated.
 */
function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return failure(res, 'Authentication required', 401);
    }
    if (!allowedRoles.includes(req.user.role)) {
      return failure(res, 'You do not have permission to perform this action', 403);
    }
    next();
  };
}

module.exports = { authorize };
