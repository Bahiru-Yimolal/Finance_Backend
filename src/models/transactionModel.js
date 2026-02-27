const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Transaction = sequelize.define(
    "Transaction",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: "Users",
                key: "id",
            },
        },
        amount: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: false,
            validate: {
                min: 0.01,
            },
        },
        type: {
            type: DataTypes.ENUM("income", "expense"),
            allowNull: false,
        },
        category_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: "Categories",
                key: "id",
            },
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        date: {
            type: DataTypes.DATEONLY,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
        is_deleted: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
    },
    {
        timestamps: true,
        tableName: "Transactions",
        underscored: true,
    }
);

module.exports = Transaction;
