const jwt = require('jsonwebtoken');

/**
 * Middleware: verify JWT from httpOnly cookie.
 * Attaches decoded payload to req.user.
 */
function authenticate(req, res, next) {
  const token = req.cookies?.token;
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized: no token provided' });
  }
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Unauthorized: token invalid or expired' });
  }
}

module.exports = authenticate;
