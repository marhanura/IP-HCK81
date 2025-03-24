"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Drug extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Drug.hasMany(models.Disease, { foreignKey: "DrugId" });
      // define association here
    }
  }
  Drug.init(
    {
      name: DataTypes.STRING,
      price: DataTypes.INTEGER,
      type: DataTypes.STRING,
      category: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Drug",
    }
  );
  return Drug;
};
