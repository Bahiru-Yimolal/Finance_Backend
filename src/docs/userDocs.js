/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *       description: Please enter JWT token in the format **Bearer &lt;token&gt;** to access this endpoint.
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         username:
 *           type: string
 *           example: "johndoe"
 *         email:
 *           type: string
 *           example: "john@example.com"
 *         first_name:
 *           type: string
 *           example: "John"
 *         last_name:
 *           type: string
 *           example: "Doe"
 *         sex:
 *           type: string
 *           enum: [MALE, FEMALE, OTHER]
 *           example: "MALE"
 *         date_of_birth:
 *           type: string
 *           format: date
 *           example: "1990-01-01"
 *         role:
 *           type: string
 *           enum: [USER, ADMIN]
 *           example: "USER"
 *         status:
 *           type: string
 *           enum: [ACTIVE, DEACTIVATED]
 *           example: "ACTIVE"
 */

/**
 * @swagger
 * /users/register:
 *   post:
 *     summary: Register a new user
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [username, email, password]
 *             properties:
 *               username:
 *                 type: string
 *                 example: "johndoe"
 *               email:
 *                 type: string
 *                 example: "john@example.com"
 *               password:
 *                 type: string
 *                 example: "StrongPass123!"
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "User created successfully"
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Bad request (validation error or user exists)
 */

/**
 * @swagger
 * /users/login:
 *   post:
 *     summary: User Login
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [identifier, password]
 *             properties:
 *               identifier:
 *                 type: string
 *                 description: "User's email or username"
 *                 example: "john@example.com or johndoe"
 *               password:
 *                 type: string
 *                 example: "StrongPass123!"
 *     responses:
 *       200:
 *         description: login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 token:
 *                   type: string
 *                   example: "JWT_TOKEN_HERE"
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Invalid credentials
 */

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get all users (Admin only)
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Global search (matches username, email, first name, last name)
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     totalItems:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *                     currentPage:
 *                       type: integer
 *       403:
 *         description: Forbidden - Admin privileges required
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /users/update-info:
 *   patch:
 *     summary: Update current user info
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 example: "newjohndoe"
 *               email:
 *                 type: string
 *                 example: "newjohn@example.com"
 *               first_name:
 *                 type: string
 *                 example: "John"
 *                 nullable: true
 *               last_name:
 *                 type: string
 *                 example: "Doe"
 *                 nullable: true
 *               sex:
 *                 type: string
 *                 enum: [MALE, FEMALE, OTHER]
 *                 example: "MALE"
 *                 nullable: true
 *               date_of_birth:
 *                 type: string
 *                 format: date
 *                 example: "1990-01-01"
 *                 nullable: true
 *     responses:
 *       200:
 *         description: Update successful
 *       400:
 *         description: Bad request
 */

/**
 * @swagger
 * /users/update-password:
 *   patch:
 *     summary: Update current user password
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [currentPassword, newPassword]
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 example: "StrongPass123!"
 *               newPassword:
 *                 type: string
 *                 example: "NewStrongPass456!"
 *     responses:
 *       200:
 *         description: Incorrect old password or validation failure
 *
 * /users/forgot-password:
 *   post:
 *     summary: Request password reset email
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email:
 *                 type: string
 *                 example: "john@example.com"
 *     responses:
 *       200:
 *         description: Reset email sent successfully
 *
 * /users/reset-password:
 *   post:
 *     summary: Reset password using token
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [token, newPassword]
 *             properties:
 *               token:
 *                 type: string
 *                 description: JWT token received in email
 *               newPassword:
 *                 type: string
 *                 example: "NewStrongPass123!"
 *     responses:
 *       200:
 *         description: Password reset successfully
 *
 * /users:
 *   delete:
 *     summary: Delete user account (Soft Delete)
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Account deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 *
 * /users/profile/login-info:
 *   get:
 *     summary: Get login information for current user
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Login information retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 login_info:
 *                   type: object
 *                   properties:
 *                     success_count:
 *                       type: integer
 *                     failed_count:
 *                       type: integer
 *                     last_successful_login:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                         login_at:
 *                           type: string
 *                           format: date-time
 *                         ip_address:
 *                           type: string
 *                         user_agent:
 *                           type: string
 *                     last_failed_login:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                         login_at:
 *                           type: string
 *                           format: date-time
 *                         ip_address:
 *                           type: string
 *                         user_agent:
 *                           type: string
 *
 * /users/{id}:
 *   get:
 *     summary: Get user details by ID
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the user to retrieve
 *     responses:
 *       200:
 *         description: User details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     username:
 *                       type: string
 *                     email:
 *                       type: string
 *                     role:
 *                       type: string
 *                     status:
 *                       type: string
 *                     created_at:
 *                       type: string
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Access denied
 *       404:
 *         description: User not found
 */

/**
 * @swagger
 * /users/status:
 *   patch:
 *     summary: Update User Status (Admin)
 *     description: Allows an admin to set a user's status to ACTIVE or DEACTIVATED.
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [userId, status]
 *             properties:
 *               userId:
 *                 type: string
 *                 example: "1"
 *               status:
 *                 type: string
 *                 enum: [ACTIVE, DEACTIVATED]
 *                 example: "DEACTIVATED"
 *     responses:
 *       200:
 *         description: User status updated successfully
 *       400:
 *         description: Invalid status or missing fields
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required or cannot deactivate yourself
 *       404:
 *         description: User not found
 *
 * /users/reset-password-admin:
 *   post:
 *     summary: Admin Password Reset
 *     description: Allows an admin to reset any user's password to a default value.
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [userId, defaultPassword]
 *             properties:
 *               userId:
 *                 type: string
 *                 description: ID of the user whose password is to be reset.
 *                 example: "1"
 *               defaultPassword:
 *                 type: string
 *                 description: The new default password.
 *                 example: "DefaultPass123!"
 *     responses:
 *       200:
 *         description: Password reset successfully
 *       400:
 *         description: User ID and default password are required
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required or access denied
 *       404:
 *         description: User not found
 */

