// roleMiddleware.js

function requireAdmin(req, res, next) {
  if (req.user && req.user.role === "admin") {
    return next();
  }
  return res.status(403).json({
    success: false,
    message: "Access denied: Admins only",
  });
}

function requireDriver(req, res, next) {
  if (req.user && req.user.role === "driver") {
    return next();
  }
  return res.status(403).json({
    success: false,
    message: "Access denied: Drivers only",
  });
}

// New combined middleware:
function requireDriverOrAdmin(req, res, next) {
  if (req.user && (req.user.role === "driver" || req.user.role === "admin")) {
    return next();
  }
  return res.status(403).json({
    success: false,
    message: "Access denied",
  });
}

module.exports = {
  requireAdmin,
  requireDriver,
  requireDriverOrAdmin,
};
