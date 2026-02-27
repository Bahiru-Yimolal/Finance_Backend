const { User, Transaction, Category, LoginLog } = require("../models");
const { Op } = require("sequelize");
const sequelize = require("sequelize");

/**
 * Get Admin Overview Report Data
 */
const getAdminOverviewReportService = async (startDate, endDate) => {
    try {
        const dateFilter = {
            [Op.between]: [startDate, endDate],
        };

        // 1. User Activity
        const totalUsers = await User.count({ where: { is_deleted: false } });
        const newRegistrations = await User.count({
            where: {
                created_at: dateFilter,
                is_deleted: false,
            },
        });
        const activeUsers = await User.count({
            where: {
                status: "ACTIVE",
                is_deleted: false,
            },
        });
        const deactivatedUsers = await User.count({
            where: {
                status: "DEACTIVATED",
                is_deleted: false,
            },
        });

        // 2. Financial Performance
        const platformTotalIncome = await Transaction.sum("amount", {
            where: {
                type: "income",
                date: dateFilter,
                is_deleted: false,
            },
        }) || 0;

        const platformTotalExpenses = await Transaction.sum("amount", {
            where: {
                type: "expense",
                date: dateFilter,
                is_deleted: false,
            },
        }) || 0;

        const totalTransactionsCount = await Transaction.count({
            where: {
                date: dateFilter,
                is_deleted: false,
            },
        });

        // 3. Security and Logs
        const totalLoginAttempts = await LoginLog.count({
            where: {
                created_at: dateFilter,
            },
        });

        const successfulLogins = await LoginLog.count({
            where: {
                status: "SUCCESS",
                created_at: dateFilter,
            },
        });

        const failedLogins = await LoginLog.count({
            where: {
                status: "FAILED",
                created_at: dateFilter,
            },
        });

        const uniqueUsersLoggedIn = await LoginLog.count({
            distinct: true,
            col: "user_id",
            where: {
                status: "SUCCESS",
                created_at: dateFilter,
                user_id: { [Op.ne]: null }
            },
        });

        // 4. Top Categories System Wide (Expense only)
        const topCategories = await Transaction.findAll({
            where: {
                type: "expense",
                date: dateFilter,
                is_deleted: false,
            },
            attributes: [
                [sequelize.fn("SUM", sequelize.col("amount")), "total_amount"],
            ],
            include: [
                {
                    model: Category,
                    as: "category",
                    attributes: ["name"],
                },
            ],
            group: ["category.id", "category.name"],
            order: [[sequelize.literal("total_amount"), "DESC"]],
            limit: 5,
        });

        const formattedTopCategories = topCategories.map((cat) => ({
            name: cat.category ? cat.category.name : "Uncategorized",
            total: parseFloat(cat.getDataValue("total_amount")),
        }));

        return {
            period: {
                startDate,
                endDate,
            },
            userActivity: {
                totalUsers,
                newRegistrations,
                activeUsers,
                deactivatedUsers,
            },
            financialPerformance: {
                platformTotalIncome: parseFloat(platformTotalIncome),
                platformTotalExpenses: parseFloat(platformTotalExpenses),
                platformNetBalance: parseFloat(platformTotalIncome) - parseFloat(platformTotalExpenses),
                totalTransactionsCount,
            },
            securityAndLogs: {
                totalLoginAttempts,
                successfulLogins,
                failedLogins,
                uniqueUsersLoggedIn,
            },
            topCategoriesSystemWide: formattedTopCategories,
        };
    } catch (error) {
        console.error("Error in getAdminOverviewReportService:", error);
        throw error;
    }
};

module.exports = {
    getAdminOverviewReportService,
};
