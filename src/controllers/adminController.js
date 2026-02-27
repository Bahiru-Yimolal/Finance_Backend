const { getAdminOverviewReportService } = require("../services/adminService");

/**
 * Handle Admin Overview Report
 */
const getAdminOverviewReportController = async (req, res, next) => {
    try {
        const { startDate, endDate } = req.query;

        if (!startDate || !endDate) {
            return res.status(400).json({
                success: false,
                message: "startDate and endDate are required query parameters (YYYY-MM-DD).",
            });
        }

        const report = await getAdminOverviewReportService(startDate, endDate);

        res.status(200).json({
            success: true,
            message: "Admin overview report generated successfully",
            data: report,
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAdminOverviewReportController,
};
