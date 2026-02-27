const express = require("express");
const { protect, verifyAdmin } = require("../middlewares/authMiddleware");
const { getAdminOverviewReportController } = require("../controllers/adminController");

const router = express.Router();

// All admin routes require authentication and admin role
router.use(protect);
router.use(verifyAdmin);

/**
 * GET /api/admin/overview-report
 * Get aggregated system-wide report
 */
router.get("/overview-report", getAdminOverviewReportController);

module.exports = router;
