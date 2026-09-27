const { verifyToken } = require('../utils/jwt');
const { failure } = require('../utils/apiResponse');
const prisma = require('../utils/prismaClient');

/**
 * Verifies the Authorization: Bearer <token> header and attaches req.user.
 * Also re-checks the user is still active in the DB (in case of deactivation).
 */
async function authenticate(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;

    if (!token) {
      return failure(res, 'Authentication required', 401);
    }

    let decoded;
    try {
      decoded = verifyToken(token);
    } catch (err) {
      return failure(res, 'Invalid or expired session, please log in again', 401);
    }

    const user = await prisma.user.findUnique({ where: { id: decoded.id } });
    if (!user || !user.isActive) {
      return failure(res, 'Account not found or deactivated', 401);
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      fullName: user.fullName,
    };

    next();
  } catch (err) {
    next(err);
  }
}

/**
 * Like `authenticate`, but never rejects the request. If a valid token is
 * present, req.user is populated; otherwise the request proceeds as a guest.
 * Used on public routes (e.g. product listing) that behave differently for
 * logged-in admins without requiring login for everyone else.
 */
async function optionalAuthenticate(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) return next();

    const decoded = verifyToken(token);
    const user = await prisma.user.findUnique({ where: { id: decoded.id } });
    if (user && user.isActive) {
      req.user = { id: user.id, email: user.email, role: user.role, fullName: user.fullName };
    }
    next();
  } catch {
    // Invalid/expired token on an optional route — just proceed as guest.
    next();
  }
}

module.exports = { authenticate, optionalAuthenticate };
