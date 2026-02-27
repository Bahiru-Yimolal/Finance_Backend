const jwt = require("jsonwebtoken");
const { AppError } = require("../middlewares/errorMiddleware");

/**
 * Protect routes - Verification of JWT token
 */
const protect = (req, res, next) => {
  const token =
    req.headers.authorization && req.headers.authorization.startsWith("Bearer")
      ? req.headers.authorization.split(" ")[1]
      : null;

  if (!token) {
    return next(
      new AppError("You are not logged in! Please log in to get access.", 401)
    );
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return next(new AppError("Invalid token. Please log in again.", 401));
    }

    req.user = decoded;
    next();
  });
};

/**
 * Authorization: Admin only
 */
const verifyAdmin = (req, res, next) => {
  const role = req.user && req.user.payload ? req.user.payload.role : null;

  if (role !== "ADMIN") {
    return next(new AppError("Access denied. Admin privileges required.", 403));
  }

  next();
};

module.exports = {
  protect,
  verifyAdmin,
};
