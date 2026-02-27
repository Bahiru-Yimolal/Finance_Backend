const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const LoginLog = sequelize.define(
    "LoginLog",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: "Users",
                key: "id",
            },
        },
        login_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
        ip_address: {
            type: DataTypes.STRING(45), // Supports IPv6
            allowNull: true,
        },
        user_agent: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        status: {
            type: DataTypes.ENUM("SUCCESS", "FAILED"),
            allowNull: false,
        },
    },
    {
        timestamps: true,
        tableName: "LoginLogs",
        underscored: true,
    }
);

module.exports = LoginLog;
