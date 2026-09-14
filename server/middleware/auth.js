const jwt = require('jsonwebtoken');

// Requires a valid token. Use on routes only logged-in users/admins can hit.
function verifyToken(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' });
  }
  try {
    req.user = jwt.verify(header.split(' ')[1], process.env.JWT_SECRET); // { id, role }
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
}

// Attaches req.user if a valid token is present, but doesn't block guests.
// Used so order creation still works for guests, but tags the order to a
// logged-in customer's account when one is present.
function optionalAuth(req, res, next) {
  const header = req.headers.authorization;
  if (header && header.startsWith('Bearer ')) {
    try {
      req.user = jwt.verify(header.split(' ')[1], process.env.JWT_SECRET);
    } catch (err) {
      // invalid/expired token on an optional route — just proceed as a guest
    }
  }
  next();
}

// Use after verifyToken to additionally require the admin role.
function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
}

module.exports = { verifyToken, optionalAuth, requireAdmin };