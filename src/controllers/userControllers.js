const {
  registerUserService,
  getAllUsersService,
  updateUserService,
  updatePasswordService,
  loginService,
  forgotPasswordService,
  resetPasswordService,
  deleteUserService,
  getUserByIdService,
  getUserLoginInfoService,
  adminResetPasswordService,
  updateUserStatusService,
} = require("../services/userService");
const { AppError } = require("../middlewares/errorMiddleware");

/**
 * Handle user login
 */
const authUserController = async (req, res, next) => {
  const { identifier, password } = req.body;
  const ipAddress = req.ip;
  const userAgent = req.get("User-Agent");

  try {
    const result = await loginService(identifier, password, ipAddress, userAgent);
    res.json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

/**
 * Handle user registration
 */
const userRegistrationController = async (req, res, next) => {
  try {
    const { username, email, password, first_name, last_name, sex, date_of_birth } = req.body;

    const newUser = await registerUserService(username, email, password, {
      first_name,
      last_name,
      sex,
      date_of_birth,
    });

    res.status(201).json({
      success: true,
      message: "User created successfully",
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        first_name: newUser.first_name,
        last_name: newUser.last_name,
        sex: newUser.sex,
        date_of_birth: newUser.date_of_birth,
        role: newUser.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all users (Admin only)
 */
const getAllUsersController = async (req, res, next) => {
  try {
    const { users, totalItems, totalPages, currentPage } = await getAllUsersService(req.query);

    res.status(200).json({
      success: true,
      message: "Users retrieved successfully",
      data: users,
      pagination: {
        totalItems,
        totalPages,
        currentPage,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update current user info
 */
const updateUserController = async (req, res, next) => {
  try {
    const { username, email, first_name, last_name, sex, date_of_birth } = req.body;
    const userId = req.user.payload.userId;

    const updatedUser = await updateUserService(userId, {
      username,
      email,
      first_name,
      last_name,
      sex,
      date_of_birth,
    });

    return res.status(200).json({
      success: true,
      data: {
        id: updatedUser.id,
        username: updatedUser.username,
        email: updatedUser.email,
        first_name: updatedUser.first_name,
        last_name: updatedUser.last_name,
        sex: updatedUser.sex,
        date_of_birth: updatedUser.date_of_birth,
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update current user password
 */
const updateUserPasswordController = async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.user.payload.userId;

  try {
    const result = await updatePasswordService(
      userId,
      currentPassword,
      newPassword
    );
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

/**
 * Request password reset
 */
const forgotPasswordController = async (req, res, next) => {
  try {
    const { email } = req.body;
    const result = await forgotPasswordService(email);
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

/**
 * Reset password using token
 */
const resetPasswordController = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;
    const result = await resetPasswordService(token, newPassword);
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete current user account
 */
const deleteUserController = async (req, res, next) => {
  try {
    const userId = req.user.payload.userId;
    const result = await deleteUserService(userId);
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

/**
 * Get user by ID
 */
const getUserByIdController = async (req, res, next) => {
  try {
    const { id } = req.params;
    const requesterId = req.user.payload.userId;
    const requesterRole = req.user.payload.role;

    // Authorization: Only Admin or the user themselves can view the profile
    if (requesterRole !== "ADMIN" && requesterId.toString() !== id.toString()) {
      throw new AppError("Access denied. You can only view your own profile.", 403);
    }

    const user = await getUserByIdService(id);

    res.status(200).json({
      success: true,
      message: "User details retrieved successfully",
      user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get current user profile
 */
const getProfileController = async (req, res, next) => {
  try {
    const userId = req.user.payload.userId;
    const user = await getUserByIdService(userId);

    res.status(200).json({
      success: true,
      message: "User profile retrieved successfully",
      user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get login information for current user
 */
const getLoginInfoController = async (req, res, next) => {
  try {
    const userId = req.user.payload.userId;
    const loginInfo = await getUserLoginInfoService(userId);

    res.status(200).json({
      success: true,
      message: "Login information retrieved successfully",
      login_info: loginInfo,
    });
  } catch (error) {
    next(error);
  }
};


/**
 * Admin logic to reset user password
 */
const adminResetPasswordController = async (req, res, next) => {
  try {
    const { userId, defaultPassword } = req.body;

    if (!userId || !defaultPassword) {
      throw new AppError("User ID and default password are required", 400);
    }

    const result = await adminResetPasswordService(userId, defaultPassword);

    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Admin logic to update user status
 */
const updateUserStatusController = async (req, res, next) => {
  try {
    const { userId, status } = req.body;
    const adminId = req.user.payload.userId;

    if (!userId || !status) {
      throw new AppError("User ID and status are required", 400);
    }

    const result = await updateUserStatusService(adminId, userId, status);

    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
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
  getLoginInfoController,
  adminResetPasswordController,
  updateUserStatusController,
};
