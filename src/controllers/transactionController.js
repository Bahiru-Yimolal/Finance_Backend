const {
    createTransactionService,
    getAllUserTransactionsService,
    getAllTransactionsAdminService,
    deleteTransactionService,
    updateTransactionService,
    getTransactionByIdService,
    getTransactionSummaryService,
    getAllCategoriesService,
} = require("../services/transactionService");

/**
 * Handle transaction creation
 */
const createTransactionController = async (req, res, next) => {
    try {
        const userId = req.user.payload.userId; // Extracted from JWT by protect middleware
        const data = req.body;

        const transaction = await createTransactionService(userId, data);

        res.status(201).json({
            success: true,
            message: "Transaction created successfully",
            data: transaction,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get all transactions for the authenticated user
 */
const getAllUserTransactionsController = async (req, res, next) => {
    try {
        const userId = req.user.payload.userId;
        const { transactions, totalItems, totalPages, currentPage } = await getAllUserTransactionsService(userId, req.query);

        res.status(200).json({
            success: true,
            data: transactions,
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
 * Get all transactions (Admin only)
 */
const getAllTransactionsAdminController = async (req, res, next) => {
    try {
        const { transactions, totalItems, totalPages, currentPage } = await getAllTransactionsAdminService(req.query);

        res.status(200).json({
            success: true,
            data: transactions,
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
 * Delete a transaction
 */
const deleteTransactionController = async (req, res, next) => {
    try {
        const userId = req.user.payload.userId;
        const { id } = req.params;

        const result = await deleteTransactionService(userId, id);

        res.status(200).json({
            success: true,
            ...result,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Update a transaction
 */
const updateTransactionController = async (req, res, next) => {
    try {
        const userId = req.user.payload.userId;
        const { id } = req.params;
        const data = req.body;

        const transaction = await updateTransactionService(userId, id, data);

        res.status(200).json({
            success: true,
            message: "Transaction updated successfully",
            data: transaction,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get a specific transaction by ID
 */
const getTransactionByIdController = async (req, res, next) => {
    try {
        const userId = req.user.payload.userId;
        const { id } = req.params;

        const transaction = await getTransactionByIdService(userId, id);

        res.status(200).json({
            success: true,
            data: transaction,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get financial summary for the authenticated user
 */
const getTransactionSummaryController = async (req, res, next) => {
    try {
        const userId = req.user.payload.userId;
        const summary = await getTransactionSummaryService(userId, req.query);

        res.status(200).json({
            success: true,
            data: summary,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get all available categories for the user
 */
const getAllCategoriesController = async (req, res, next) => {
    try {
        const userId = req.user.payload.userId;
        const categories = await getAllCategoriesService(userId);

        res.status(200).json({
            success: true,
            data: categories,
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createTransactionController,
    getAllUserTransactionsController,
    getAllTransactionsAdminController,
    deleteTransactionController,
    updateTransactionController,
    getTransactionByIdController,
    getTransactionSummaryController,
    getAllCategoriesController,
};
