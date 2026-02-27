const { Transaction, Category, User } = require("../models");
const { AppError } = require("../middlewares/errorMiddleware");
const { Op } = require("sequelize");

/**
 * Create a new transaction
 * @param {number} userId - ID of the user creating the transaction
 * @param {object} data - Transaction data (amount, type, category, description, date)
 */
const createTransactionService = async (userId, data) => {
    try {
        const { amount, type, category: categoryName, description, date } = data;

        // 1. Find or create the category
        // Look for a global category (user_id: null) or a user-specific one (user_id: userId)
        let category = await Category.findOne({
            where: {
                name: { [Op.iLike]: categoryName }, // Case-insensitive search
                [Op.or]: [{ user_id: userId }, { user_id: null }],
            },
        });

        if (!category) {
            // If not found, create a new user-specific category
            category = await Category.create({
                name: categoryName,
                user_id: userId,
            });
        }

        // 2. Create the transaction
        const transaction = await Transaction.create({
            user_id: userId,
            amount: amount,
            type: type,
            category_id: category.id,
            description: description,
            date: date,
        });

        // 3. Return the transaction with category info
        const result = await Transaction.findByPk(transaction.id, {
            include: [
                {
                    model: Category,
                    as: "category",
                    attributes: ["id", "name"],
                },
            ],
        });

        return result;
    } catch (error) {
        if (error instanceof AppError) throw error;
        console.error("Error in createTransactionService:", error);
        throw new AppError("Failed to create transaction", 500);
    }
};

/**
 * Get all transactions for a user with optional filters
 * @param {number} userId - ID of the user
 * @param {object} query - Query parameters (type, category, startDate, endDate)
 */
const getAllUserTransactionsService = async (userId, query) => {
    try {
        const { type, category, startDate, endDate, search, page = 1, limit = 10 } = query;
        const offset = (page - 1) * limit;
        const where = { user_id: userId, is_deleted: false };

        // Global search (across description and category name)
        if (search) {
            where[Op.or] = [
                { description: { [Op.iLike]: `%${search}%` } },
                { "$category.name$": { [Op.iLike]: `%${search}%` } },
            ];
        }

        // Filter by type (income/expense)
        if (type) {
            where.type = type;
        }

        // Filter by date range
        if (startDate || endDate) {
            where.date = {};
            if (startDate) where.date[Op.gte] = startDate;
            if (endDate) where.date[Op.lte] = endDate;
        }

        const include = [
            {
                model: Category,
                as: "category",
                attributes: ["id", "name"],
            },
        ];

        // Filter by category name (if provided)
        if (category) {
            // If search is also provided, we wrap both in Op.and to ensure both conditions are met
            const categoryFilter = { name: { [Op.iLike]: `%${category}%` } };
            if (include[0].where) {
                include[0].where = { [Op.and]: [include[0].where, categoryFilter] };
            } else {
                include[0].where = categoryFilter;
            }
        }

        const { count, rows: transactions } = await Transaction.findAndCountAll({
            where,
            include,
            order: [["date", "DESC"], ["created_at", "DESC"]],
            limit: parseInt(limit),
            offset: parseInt(offset),
        });

        return {
            transactions,
            totalItems: count,
            totalPages: Math.ceil(count / limit),
            currentPage: parseInt(page),
        };
    } catch (error) {
        if (error instanceof AppError) throw error;
        console.error("Error in getAllUserTransactionsService:", error);
        throw new AppError("Failed to fetch transactions", 500);
    }
};

/**
 * Get all transactions from all users (Admin only)
 * @param {object} query - Query parameters (type, category, startDate, endDate, username)
 */
const getAllTransactionsAdminService = async (query) => {
    try {
        const { type, category, startDate, endDate, username, search, page = 1, limit = 10 } = query;
        const offset = (page - 1) * limit;
        const where = { is_deleted: false };

        if (type) where.type = type;
        if (startDate || endDate) {
            where.date = {};
            if (startDate) where.date[Op.gte] = startDate;
            if (endDate) where.date[Op.lte] = endDate;
        }

        // Global search for admins (Description, Category Name, Username, Email)
        if (search) {
            where[Op.or] = [
                { description: { [Op.iLike]: `%${search}%` } },
                { "$category.name$": { [Op.iLike]: `%${search}%` } },
                { "$user.username$": { [Op.iLike]: `%${search}%` } },
                { "$user.email$": { [Op.iLike]: `%${search}%` } },
            ];
        }

        const include = [
            {
                model: Category,
                as: "category",
                attributes: ["id", "name"],
            },
            {
                model: User,
                as: "user",
                attributes: ["id", "username", "email"],
                where: username ? { username: { [Op.iLike]: `%${username}%` } } : {},
            },
        ];

        if (category) {
            const categoryFilter = { name: { [Op.iLike]: `%${category}%` } };
            if (include[0].where) {
                include[0].where = { [Op.and]: [include[0].where, categoryFilter] };
            } else {
                include[0].where = categoryFilter;
            }
        }

        const { count, rows: transactions } = await Transaction.findAndCountAll({
            where,
            include,
            order: [["date", "DESC"], ["created_at", "DESC"]],
            limit: parseInt(limit),
            offset: parseInt(offset),
        });

        return {
            transactions,
            totalItems: count,
            totalPages: Math.ceil(count / limit),
            currentPage: parseInt(page),
        };
    } catch (error) {
        console.error("Error in getAllTransactionsAdminService:", error);
        throw new AppError("Failed to fetch all transactions", 500);
    }
};

/**
 * Delete a transaction (Soft Delete)
 * @param {number} userId - ID of the user owning the transaction
 * @param {number} transactionId - ID of the transaction to delete
 */
const deleteTransactionService = async (userId, transactionId) => {
    try {
        const transaction = await Transaction.findOne({
            where: { id: transactionId, user_id: userId },
        });

        if (!transaction) {
            throw new AppError("Transaction not found or unauthorized", 404);
        }

        transaction.is_deleted = true;
        await transaction.save();

        return { message: "Transaction deleted successfully" };
    } catch (error) {
        if (error instanceof AppError) throw error;
        console.error("Error in deleteTransactionService:", error);
        throw new AppError("Failed to delete transaction", 500);
    }
};

/**
 * Update a transaction
 * @param {number} userId - ID of the user owning the transaction
 * @param {number} transactionId - ID of the transaction to update
 * @param {object} data - Updated transaction data
 */
const updateTransactionService = async (userId, transactionId, data) => {
    try {
        const { amount, type, category: categoryName, description, date } = data;

        // 1. Find the transaction
        const transaction = await Transaction.findOne({
            where: { id: transactionId, user_id: userId, is_deleted: false },
        });

        if (!transaction) {
            throw new AppError("Transaction not found or unauthorized", 404);
        }

        // 2. Handle category update if provided
        if (categoryName) {
            let category = await Category.findOne({
                where: {
                    name: { [Op.iLike]: categoryName },
                    [Op.or]: [{ user_id: userId }, { user_id: null }],
                },
            });

            if (!category) {
                category = await Category.create({
                    name: categoryName,
                    user_id: userId,
                });
            }
            transaction.category_id = category.id;
        }

        // 3. Update other fields
        if (amount !== undefined) transaction.amount = amount;
        if (type) transaction.type = type;
        if (description !== undefined) transaction.description = description;
        if (date) transaction.date = date;

        await transaction.save();

        // 4. Return the updated transaction with category info
        const result = await Transaction.findByPk(transaction.id, {
            include: [
                {
                    model: Category,
                    as: "category",
                    attributes: ["id", "name"],
                },
            ],
        });

        return result;
    } catch (error) {
        if (error instanceof AppError) throw error;
        console.error("Error in updateTransactionService:", error);
        throw new AppError("Failed to update transaction", 500);
    }
};

/**
 * Get transaction summary (totals and category breakdown)
 * @param {number} userId - ID of the user
 * @param {object} query - Query parameters (startDate, endDate)
 */
const getTransactionSummaryService = async (userId, query) => {
    try {
        const { startDate, endDate } = query;
        const where = { user_id: userId, is_deleted: false };

        if (startDate || endDate) {
            where.date = {};
            if (startDate) where.date[Op.gte] = startDate;
            if (endDate) where.date[Op.lte] = endDate;
        }

        // 1. Calculate Total Income
        const totalIncome = await Transaction.sum("amount", {
            where: { ...where, type: "income" },
        }) || 0;

        // 2. Calculate Total Expenses
        const totalExpenses = await Transaction.sum("amount", {
            where: { ...where, type: "expense" },
        }) || 0;

        // 3. Calculate Category Breakdown (Expenses only)
        const categoryBreakdown = await Transaction.findAll({
            where: { ...where, type: "expense" },
            attributes: [
                [Transaction.sequelize.fn("SUM", Transaction.sequelize.col("amount")), "total"],
            ],
            include: [
                {
                    model: Category,
                    as: "category",
                    attributes: ["name"],
                },
            ],
            group: ["category.id", "category.name"],
            raw: true,
        });

        // Format category breakdown for easier frontend use
        const formattedCategories = categoryBreakdown.map((item) => ({
            name: item["category.name"],
            total: parseFloat(item.total),
        }));

        return {
            totalIncome: parseFloat(totalIncome),
            totalExpenses: parseFloat(totalExpenses),
            balance: parseFloat((totalIncome - totalExpenses).toFixed(2)),
            categories: formattedCategories,
            period: {
                startDate: startDate || "All Time",
                endDate: endDate || "All Time",
            }
        };
    } catch (error) {
        console.error("Error in getTransactionSummaryService:", error);
        throw new AppError("Failed to fetch transaction summary", 500);
    }
};

/**
 * Get a single transaction by ID
 * @param {number} userId - ID of the user owning the transaction
 * @param {number} transactionId - ID of the transaction to fetch
 */
const getTransactionByIdService = async (userId, transactionId) => {
    try {
        const transaction = await Transaction.findOne({
            where: { id: transactionId, user_id: userId, is_deleted: false },
            include: [
                {
                    model: Category,
                    as: "category",
                    attributes: ["id", "name"],
                },
            ],
        });

        if (!transaction) {
            throw new AppError("Transaction not found", 404);
        }

        return transaction;
    } catch (error) {
        if (error instanceof AppError) throw error;
        console.error("Error in getTransactionByIdService:", error);
        throw new AppError("Failed to fetch transaction", 500);
    }
};

/**
 * Get all categories available for a user (global + user-specific)
 * @param {number} userId - ID of the user
 */
const getAllCategoriesService = async (userId) => {
    try {
        const categories = await Category.findAll({
            where: {
                [Op.or]: [{ user_id: userId }, { user_id: null }],
            },
            order: [["name", "ASC"]],
        });
        return categories;
    } catch (error) {
        console.error("Error in getAllCategoriesService:", error);
        throw new AppError("Failed to fetch categories", 500);
    }
};

module.exports = {
    createTransactionService,
    getAllUserTransactionsService,
    getAllTransactionsAdminService,
    deleteTransactionService,
    updateTransactionService,
    getTransactionByIdService,
    getTransactionSummaryService,
    getAllCategoriesService,
};
