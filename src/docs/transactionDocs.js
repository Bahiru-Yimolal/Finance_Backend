/**
 * @swagger
 * /transactions:
 *   post:
 *     summary: Create a new transaction
 *     tags: [Transaction]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [amount, type, category, date]
 *             properties:
 *               amount:
 *                 type: number
 *                 example: 50.75
 *               type:
 *                 type: string
 *                 enum: [income, expense]
 *                 example: "expense"
 *               category:
 *                 type: string
 *                 example: "Food & Dining"
 *               description:
 *                 type: string
 *                 example: "Lunch at Cafe"
 *               date:
 *                 type: string
 *                 format: date
 *                 example: "2026-02-26"
 *     responses:
 *       201:
 *         description: Transaction created successfully
 *       400:
 *         description: Validation error or invalid category
 *       401:
 *         description: Unauthorized
 *   get:
 *     summary: Get all user transactions
 *     tags: [Transaction]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [income, expense]
 *         description: Filter by transaction type
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category name
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by start date (YYYY-MM-DD)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by end date (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: A list of transactions
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
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       amount:
 *                         type: number
 *                       type:
 *                         type: string
 *                       description:
 *                         type: string
 *                       date:
 *                         type: string
 *                       category:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           name:
 *                             type: string
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     totalItems:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *                     currentPage:
 *                       type: integer
 *       401:
 *         description: Unauthorized - Valid JWT token required
 *
 * /transactions/admin/all:
 *   get:
 *     summary: Get all transactions from all users (Admin only)
 *     tags: [Transaction]
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
 *         description: Items per page
 *       - in: query
 *         name: username
 *         schema:
 *           type: string
 *         description: Search by username
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [income, expense]
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: List of all transactions retrieved successfully
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
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       amount:
 *                         type: number
 *                       type:
 *                         type: string
 *                       description:
 *                         type: string
 *                       date:
 *                         type: string
 *                       category:
 *                         type: object
 *                         properties:
 *                           name:
 *                             type: string
 *                       user:
 *                         type: object
 *                         properties:
 *                           username:
 *                             type: string
 *                           email:
 *                             type: string
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
 *
 * /transactions/summary:
 *   get:
 *     summary: Get balance and expense breakdown by category
 *     tags: [Transaction]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date (YYYY-MM-DD)
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Global search (matches description or category name)
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Global search (matches description, category, username, or email)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Summary retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalIncome:
 *                       type: number
 *                     totalExpenses:
 *                       type: number
 *                     balance:
 *                       type: number
 *                     categories:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           name:
 *                             type: string
 *                           total:
 *                             type: number
 *                     period:
 *                       type: object
 *                       properties:
 *                         startDate:
 *                           type: string
 *                         endDate:
 *                           type: string
 *
 * /transactions/{id}:
 *   get:
 *     summary: Get a specific transaction by ID
 *     tags: [Transaction]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the transaction to fetch
 *     responses:
 *       200:
 *         description: Transaction retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     amount:
 *                       type: number
 *                     type:
 *                       type: string
 *                     description:
 *                       type: string
 *                     date:
 *                       type: string
 *                     category:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                         name:
 *                           type: string
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Transaction not found or unauthorized
 *
 *   patch:
 *     summary: Update an existing transaction
 *     tags: [Transaction]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the transaction to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                 type: number
 *                 example: 75.00
 *               type:
 *                 type: string
 *                 enum: [income, expense]
 *               category:
 *                 type: string
 *                 example: "Groceries"
 *               description:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date
 *     responses:
 *       200:
 *         description: Transaction updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Transaction not found or unauthorized
 *   delete:
 *     summary: Delete a transaction (Soft Delete)
 *     tags: [Transaction]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the transaction to delete
 *     responses:
 *       200:
 *         description: Transaction deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Transaction not found or unauthorized
 */
