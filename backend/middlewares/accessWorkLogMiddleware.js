module.exports = function accessWorkLogMiddleware(req, res, next) {
  const user = req.user;
  const { driverId, logId } = req.params;

  // Debug logs
  console.log("User:", user);
  console.log("Method:", req.method);
  console.log("Path:", req.path);
  console.log("OriginalUrl:", req.originalUrl);

  // Compute relative path if router is mounted at /worklogs
  const relativePath = req.originalUrl.replace(/^\/worklogs/, "") || req.path;

  if (!user) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized: No user in request",
    });
  }

  if (user.role === "admin") {
    return next();
  }

  if (user.role === "driver") {
    if (req.method === "POST" && relativePath === "/") {
      return next();
    }

    if (req.method === "GET" && relativePath === "/me") {
      return next();
    }

    if (driverId && driverId === String(user.id)) {
      return next();
    }

    if (logId) {
      const DailyWorkLog = require("../models/dailyWorkLog");
      return DailyWorkLog.findById(logId)
        .then((log) => {
          if (!log) {
            return res.status(404).json({
              success: false,
              message: "Work log not found",
            });
          }
          if (String(log.driverId) === String(user.id)) {
            return next();
          }
          return res.status(403).json({
            success: false,
            message: "Access denied: You cannot access someone else's log",
          });
        })
        .catch((err) => {
          console.error("Middleware log check error:", err);
          return res.status(500).json({
            success: false,
            message: "Server error while checking log access",
          });
        });
    }

    return res.status(403).json({
      success: false,
      message: "Access denied: Drivers can only access their own logs",
    });
  }

  return res.status(403).json({
    success: false,
    message: "Access denied",
  });
};
