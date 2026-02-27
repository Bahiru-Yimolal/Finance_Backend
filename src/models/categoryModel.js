const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Category = sequelize.define(
    "Category",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        name: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: true, // Nullable for global categories
            references: {
                model: "Users",
                key: "id",
            },
        },
    },
    {
        timestamps: true,
        tableName: "Categories",
        underscored: true,
    }
);

module.exports = Category;
