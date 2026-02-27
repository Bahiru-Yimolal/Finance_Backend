const { User, Role, LoginLog } = require("../models");
const bcrypt = require("bcrypt");
const { AppError } = require("../middlewares/errorMiddleware");
const { Op } = require("sequelize");
const generateToken = require("../utils/tokenUtil");
const jwt = require("jsonwebtoken");
const sendEmail = require("../utils/emailUtil");

/**
 * Register a new user
 */
const registerUserService = async (username, email, password, profileData = {}) => {
  try {
    // Check if user already exists
    const existingUser = await User.findOne({
      where: {
        [Op.or]: [{ username }, { email }],
      },
    });

    if (existingUser) {
      if (existingUser.username === username) {
        throw new AppError("Username is already taken", 400);
      }
      throw new AppError("Email is already registered", 400);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      first_name: profileData.first_name,
      last_name: profileData.last_name,
      sex: profileData.sex,
      date_of_birth: profileData.date_of_birth,
      role: "USER",
      status: "ACTIVE",
    });

    return user;
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError("Database error: Unable to create user", 500);
  }
};

/**
 * Login user
 */
const loginService = async (identifier, password, ipAddress, userAgent) => {
  let user = null;
  try {
    user = await User.findOne({
      where: {
        [Op.or]: [{ email: identifier }, { username: identifier }],
        is_deleted: false,
      },
    });

    if (!user) {
      await LoginLog.create({
        user_id: null,
        ip_address: ipAddress,
        user_agent: userAgent,
        status: "FAILED",
      });
      throw new AppError("Invalid email/username or password", 401);
    }

    if (user.status === "DEACTIVATED") {
      await LoginLog.create({
        user_id: user.id,
        ip_address: ipAddress,
        user_agent: userAgent,
        status: "FAILED",
      });
      throw new AppError("Your account has been deactivated. Please contact admin.", 403);
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      await LoginLog.create({
        user_id: user.id,
        ip_address: ipAddress,
        user_agent: userAgent,
        status: "FAILED",
      });
      throw new AppError("Invalid email or password", 401);
    }

    const token = generateToken({
      userId: user.id,
      role: user.role,
    });

    await LoginLog.create({
      user_id: user.id,
      ip_address: ipAddress,
      user_agent: userAgent,
      status: "SUCCESS",
    });

    return {
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        sex: user.sex,
        date_of_birth: user.date_of_birth,
        role: user.role,
      },
    };
  } catch (error) {
    if (error instanceof AppError) throw error;

    // For unexpected errors, still try to log if we have user info
    try {
      if (user || identifier) {
        await LoginLog.create({
          user_id: user ? user.id : null,
          ip_address: ipAddress,
          user_agent: userAgent,
          status: "FAILED",
        });
      }
    } catch (logError) {
      console.error("Failed to record login log:", logError);
    }

    throw new AppError("Login failed", 500);
  }
};

/**
 * Get all users (Admin only) with search and pagination
 */
const getAllUsersService = async (query = {}) => {
  try {
    const { search, page = 1, limit = 10 } = query;
    const offset = (page - 1) * limit;
    const where = { is_deleted: false };

    if (search) {
      where[Op.or] = [
        { username: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
        { first_name: { [Op.iLike]: `%${search}%` } },
        { last_name: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const { count, rows: users } = await User.findAndCountAll({
      where,
      attributes: ["id", "username", "first_name", "last_name", "sex", "date_of_birth", "email", "role", "status", "created_at"],
      order: [["created_at", "DESC"]], // Show newest users first
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    return {
      users,
      totalItems: count,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
    };
  } catch (error) {
    console.error("Error in getAllUsersService:", error);
    throw new AppError("Unable to fetch users", 500);
  }
};

/**
 * Update user basic info
 */
const updateUserService = async (userId, updateData) => {
  try {
    const user = await User.findByPk(userId);
    if (!user) throw new AppError("User not found", 404);

    if (updateData.username && updateData.username !== user.username) {
      const existing = await User.findOne({ where: { username: updateData.username } });
      if (existing) throw new AppError("Username already taken", 400);
      user.username = updateData.username;
    }

    if (updateData.email && updateData.email !== user.email) {
      const existing = await User.findOne({ where: { email: updateData.email } });
      if (existing) throw new AppError("Email already registered", 400);
      user.email = updateData.email;
    }

    if (updateData.first_name !== undefined) user.first_name = updateData.first_name;
    if (updateData.last_name !== undefined) user.last_name = updateData.last_name;
    if (updateData.sex !== undefined) user.sex = updateData.sex;
    if (updateData.date_of_birth !== undefined) user.date_of_birth = updateData.date_of_birth;

    await user.save();
    return user;
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError("Update failed", 500);
  }
};

/**
 * Update password
 */
const updatePasswordService = async (userId, currentPassword, newPassword) => {
  try {
    const user = await User.findByPk(userId);
    if (!user) throw new AppError("User not found", 404);

    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) throw new AppError("Incorrect current password", 400);

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    return { message: "Password updated successfully" };
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError("Password update failed", 500);
  }
};

/**
 * Forgot password service
 */
const forgotPasswordService = async (email) => {
  const user = await User.findOne({ where: { email, is_deleted: false } });

  if (!user) {
    throw new AppError("No user found with this email", 404);
  }

  // Generate reset token
  const token = jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.RESET_PASSWORD_TOKEN_EXPIRY || "15m" }
  );

  const resetLink = `${process.env.CLIENT_URL}/reset-password/${token}`;

  const subject = "Password Reset Request";
  const html = `
  <!DOCTYPE html>
  <html>
  <head>
      <style>
          body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: #f9f9f9;
          }
          .header {
              text-align: center;
              padding: 10px 0;
              background-color: #2C3E50;
              color: white;
              border-radius: 8px 8px 0 0;
          }
          .logo {
              font-size: 24px;
              font-weight: bold;
              color: #F39C12;
          }
          .content {
              background-color: white;
              padding: 20px;
              border-radius: 0 0 8px 8px;
              box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          }
          .button {
              display: inline-block;
              padding: 12px 24px;
              background-color: #F39C12 !important;
              color: white !important;
              text-decoration: none !important;
              border-radius: 5px;
              font-weight: bold;
              margin: 15px 0;
              text-align: center;
          }
          .footer {
              text-align: center;
              margin-top: 20px;
              font-size: 12px;
              color: #777;
          }
          .highlight {
              color: #E74C3C;
              font-weight: bold;
          }
      </style>
  </head>
  <body>
      <div class="header">
          <div class="logo">Personal Finance Tracker</div>
          <p>Take control of your finances</p>
      </div>
      <div class="content">
          <p>Hello <strong>${user.username}</strong>,</p>
          
          <p>We received a request to reset your password for your <strong>Personal Finance Tracker</strong> account. Let’s get you back on track!</p>
          
          <p style="text-align: center;">
              <a href="${resetLink}" class="button">Reset Your Password</a>
          </p>
          
          <p>For security reasons, this link will <span class="highlight">expire in 15 minutes</span>. If you didn’t request this, please ignore this email—your account is still safe with us.</p>
          
          <p>Best regards,<br>The Finance Tracker Team</p>
      </div>
      <div class="footer">
          <p>© ${new Date().getFullYear()} Personal Finance Tracker. All rights reserved.</p>
      </div>
  </body>
  </html>
  `;

  try {
    await sendEmail(user.email, subject, html);
  } catch (error) {
    console.error("Email sending failed:", error.message);
    throw new AppError("Error sending email. Please try again later.", 500);
  }

  return { message: "Reset email sent successfully" };
};

/**
 * Reset password service
 */
const resetPasswordService = async (token, newPassword) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.id);

    if (!user || user.is_deleted) {
      throw new AppError("Invalid or expired token", 400);
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    return { message: "Password reset successfully" };
  } catch (error) {
    if (error instanceof AppError) throw error;
    if (error.name === "TokenExpiredError") {
      throw new AppError("Reset token has expired", 400);
    }
    throw new AppError("Invalid reset token", 400);
  }
};

/**
 * Delete user account (Soft Delete)
 */
const deleteUserService = async (userId) => {
  try {
    const user = await User.findByPk(userId);
    if (!user) throw new AppError("User not found", 404);

    user.is_deleted = true;
    user.status = "DEACTIVATED";
    await user.save();

    return { message: "Account deleted successfully" };
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError("Account deletion failed", 500);
  }
};

/**
 * Get user by ID
 */
const getUserByIdService = async (id) => {
  try {
    const user = await User.findOne({
      where: { id, is_deleted: false },
      attributes: ["id", "username", "first_name", "last_name", "sex", "date_of_birth", "email", "role", "status", "created_at"],
    });

    if (!user) {
      throw new AppError("User not found", 404);
    }

    return user;
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError("Unable to fetch user details", 500);
  }
};

/**
 * Get login information for a user (count and last login)
 */
const getUserLoginInfoService = async (userId) => {
  try {
    const successCount = await LoginLog.count({
      where: { user_id: userId, status: "SUCCESS" },
    });

    const failedCount = await LoginLog.count({
      where: { user_id: userId, status: "FAILED" },
    });

    const lastSuccess = await LoginLog.findOne({
      where: { user_id: userId, status: "SUCCESS" },
      order: [["created_at", "DESC"]],
      attributes: ["id", "login_at", "ip_address", "user_agent"],
    });

    const lastFailed = await LoginLog.findOne({
      where: { user_id: userId, status: "FAILED" },
      order: [["created_at", "DESC"]],
      attributes: ["id", "login_at", "ip_address", "user_agent"],
    });

    return {
      success_count: successCount,
      failed_count: failedCount,
      last_successful_login: lastSuccess,
      last_failed_login: lastFailed,
    };
  } catch (error) {
    throw new AppError("Unable to fetch login information", 500);
  }
};

/**
 * Admin: Update user status (ACTIVE/DEACTIVATED)
 */
const updateUserStatusService = async (adminId, targetUserId, newStatus) => {
  try {
    if (!["ACTIVE", "DEACTIVATED"].includes(newStatus)) {
      throw new AppError("Invalid status. Must be ACTIVE or DEACTIVATED", 400);
    }

    if (adminId.toString() === targetUserId.toString()) {
      throw new AppError("You cannot deactivate or activate your own account.", 403);
    }

    const user = await User.findByPk(targetUserId);
    if (!user) {
      throw new AppError("User not found", 404);
    }

    user.status = newStatus;
    await user.save();

    return { message: `User status updated to ${newStatus} successfully.` };
  } catch (error) {
    if (error instanceof AppError) throw error;
    console.error("Error in updateUserStatusService:", error);
    throw new AppError("Status update failed", 500);
  }
};

/**
 * Admin: Reset user password to a default value
 */
const adminResetPasswordService = async (userId, defaultPassword) => {
  try {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new AppError("User not found", 404);
    }

    const hashedPassword = await bcrypt.hash(defaultPassword, 10);
    user.password = hashedPassword;
    await user.save();

    return { message: `Password for user ${user.username} has been reset successfully.` };
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError("Admin password reset failed", 500);
  }
};

module.exports = {
  registerUserService,
  loginService,
  getAllUsersService,
  updateUserService,
  updatePasswordService,
  forgotPasswordService,
  resetPasswordService,
  deleteUserService,
  getUserByIdService,
  getUserLoginInfoService,
  adminResetPasswordService,
  updateUserStatusService,
};
