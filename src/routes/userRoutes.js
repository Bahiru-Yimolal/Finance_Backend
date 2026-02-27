const express = require("express");
const { protect, verifyAdmin } = require("../middlewares/authMiddleware");
const {
  userRegistrationController,
  getAllUsersController,
  updateUserController,
  updateUserPasswordController,
  authUserController,
  forgotPasswordController,
  resetPasswordController,
  deleteUserController,
  getUserByIdController,
  getProfileController,
  adminResetPasswordController,
  getLoginInfoController,
  updateUserStatusController
} = require("../controllers/userControllers");
const {
  validateUser,
  validateLogin,
  validateUserUpdate,
  validatePassword,
  validateEmail,
  validateResetPassword,
} = require("../validators/userValidators");

const router = express.Router();

// Public routes
router.post("/register", validateUser, userRegistrationController);
router.post("/login", validateLogin, authUserController);
router.post("/forgot-password", validateEmail, forgotPasswordController);
router.post("/reset-password", validateResetPassword, resetPasswordController);

// Protected routes
router.use(protect);

router.get("/", verifyAdmin, getAllUsersController); // Admin should be checked in controller or middleware
router.post("/reset-password-admin", verifyAdmin, adminResetPasswordController);
router.patch("/status", verifyAdmin, updateUserStatusController);
router.get("/profile", getProfileController);
router.get("/profile/login-info", getLoginInfoController);
router.get("/:id", getUserByIdController);

router.patch("/update-info", validateUserUpdate, updateUserController);
router.patch("/update-password", validatePassword, updateUserPasswordController);
router.delete("/", deleteUserController);

module.exports = router;
