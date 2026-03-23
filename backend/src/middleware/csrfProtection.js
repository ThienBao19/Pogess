/**
 * CSRF protection middleware.
 * Validates that state-changing requests (POST, PUT, DELETE, PATCH)
 * include the `X-Requested-With: XMLHttpRequest` header.
 *
 * Browsers don't send this header on cross-origin form submissions,
 * so this prevents CSRF attacks when combined with SameSite cookies.
 * GET/HEAD/OPTIONS are always allowed (safe methods).
 */
function csrfProtection(req, res, next) {
  const safeMethods = ['GET', 'HEAD', 'OPTIONS'];
  if (safeMethods.includes(req.method)) {
    return next();
  }

  const xRequestedWith = req.headers['x-requested-with'];
  if (xRequestedWith !== 'XMLHttpRequest') {
    return res.status(403).json({
      error: 'Forbidden: missing or invalid X-Requested-With header',
    });
  }

  next();
}

module.exports = csrfProtection;
