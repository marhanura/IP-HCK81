"use strict";
const { hashPassword } = require("../helpers/bcrypt");
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      User.hasMany(models.Disease, { foreignKey: "UserId" });
      // define association here
    }
  }
  User.init(
    {
      username: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: { msg: "Username is required" },
          notNull: { msg: "Username is required" },
        },
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: { msg: "Email is required" },
          notNull: { msg: "Email is required" },
          isEmail: { msg: "Email is not valid" },
        },
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: { msg: "Password is required" },
          notNull: { msg: "Password is required" },
          len: {
            args: [5],
            msg: "Password must be at least 5 characters",
          },
        },
      },
      role: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: { msg: "Role is required" },
          notNull: { msg: "Role is required" },
        },
      },
      status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "status",
        validate: {
          notEmpty: { msg: "Status is required" },
          notNull: { msg: "Status is required" },
        },
      },
    },
    {
      sequelize,
      modelName: "User",
    }
  );
  User.beforeCreate((user) => {
    user.password = hashPassword(user.password);
    user.status = "active";
  });
  User.beforeUpdate((user) => {
    user.password = hashPassword(user.password);
  });
  return User;
};
