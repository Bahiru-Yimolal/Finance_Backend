const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    username: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    first_name: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    last_name: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    sex: {
      type: DataTypes.ENUM("MALE", "FEMALE", "OTHER"),
      allowNull: true,
    },
    date_of_birth: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM("USER", "ADMIN"),
      defaultValue: "USER",
    },
    status: {
      type: DataTypes.ENUM("ACTIVE", "DEACTIVATED"),
      defaultValue: "ACTIVE",
    },
    is_deleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    timestamps: true, // FR-1, FR-5 involve dates, having timestamps is useful
    tableName: "Users",
    underscored: true,
  }
);

// User.hasOne(Role, { foreignKey: "user_id" });
// Role.belongsTo(User, { foreignKey: "user_id" });

module.exports = User;
