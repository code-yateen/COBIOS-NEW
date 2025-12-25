const ApiError = require("../utils/ApiError");

const roleGuard = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ApiError(401, "Authentication required"));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new ApiError(403, "Access denied. Insufficient permissions")
      );
    }

    next();
  };
};

module.exports = roleGuard;

