const User = require("./userModel");
const Transaction = require("./transactionModel");
const Category = require("./categoryModel");
const LoginLog = require("./loginLogModel");

// Define associations
User.hasMany(Transaction, {
    foreignKey: "user_id",
    as: "transactions",
});

Transaction.belongsTo(User, {
    foreignKey: "user_id",
    as: "user",
});

// Category associations
User.hasMany(Category, {
    foreignKey: "user_id",
    as: "categories",
});

Category.belongsTo(User, {
    foreignKey: "user_id",
    as: "user",
});

Category.hasMany(Transaction, {
    foreignKey: "category_id",
    as: "transactions",
});

Transaction.belongsTo(Category, {
    foreignKey: "category_id",
    as: "category",
});

// LoginLog associations
User.hasMany(LoginLog, {
    foreignKey: "user_id",
    as: "loginLogs",
});

LoginLog.belongsTo(User, {
    foreignKey: "user_id",
    as: "user",
});

module.exports = {
    User,
    Transaction,
    Category,
    LoginLog,
};
