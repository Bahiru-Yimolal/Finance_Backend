const express = require("express");
const { protect, verifyAdmin } = require("../middlewares/authMiddleware");
const {
    createTransactionController,
    getAllUserTransactionsController,
    getAllTransactionsAdminController,
    deleteTransactionController,
    updateTransactionController,
    getTransactionByIdController,
    getTransactionSummaryController,
    getAllCategoriesController,
} = require("../controllers/transactionController");
const { validateTransaction } = require("../validators/transactionValidators");

const router = express.Router();

// All transaction routes are protected
router.use(protect);

router.post("/", validateTransaction, createTransactionController);
router.get("/", getAllUserTransactionsController);
router.get("/categories", getAllCategoriesController);
router.get("/summary", getTransactionSummaryController);
router.get("/:id", getTransactionByIdController);
// Admin only route
router.get("/admin/all", verifyAdmin, getAllTransactionsAdminController);

router.delete("/:id", deleteTransactionController);
router.patch("/:id", validateTransaction, updateTransactionController);

module.exports = router;
