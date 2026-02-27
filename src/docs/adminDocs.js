/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: System administration and reporting
 */

/**
 * @swagger
 * /admin/overview-report:
 *   get:
 *     summary: Get Admin Overview Report
 *     description: Aggregated system-wide data across users, transactions, and logs for a given date range.
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date (YYYY-MM-DD)
 *         example: "2024-01-01"
 *       - in: query
 *         name: endDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: End date (YYYY-MM-DD)
 *         example: "2024-12-31"
 *     responses:
 *       200:
 *         description: Report generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     period:
 *                       type: object
 *                       properties:
 *                         startDate: { type: string }
 *                         endDate: { type: string }
 *                     userActivity:
 *                       type: object
 *                       properties:
 *                         totalUsers: { type: integer }
 *                         newRegistrations: { type: integer }
 *                         activeUsers: { type: integer }
 *                         deactivatedUsers: { type: integer }
 *                     financialPerformance:
 *                       type: object
 *                       properties:
 *                         platformTotalIncome: { type: number }
 *                         platformTotalExpenses: { type: number }
 *                         platformNetBalance: { type: number }
 *                         totalTransactionsCount: { type: integer }
 *                     securityAndLogs:
 *                       type: object
 *                       properties:
 *                         totalLoginAttempts: { type: integer }
 *                         successfulLogins: { type: integer }
 *                         failedLogins: { type: integer }
 *                         uniqueUsersLoggedIn: { type: integer }
 *                     topCategoriesSystemWide:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           name: { type: string }
 *                           total: { type: number }
 *       400:
 *         description: Missing required parameters
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
