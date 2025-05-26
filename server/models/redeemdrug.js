"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class RedeemDrug extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      RedeemDrug.belongsTo(models.Disease, { foreignKey: "DiseaseId" });
      // define association here
    }
  }
  RedeemDrug.init(
    {
      DiseaseId: DataTypes.INTEGER,
      totalPrice: DataTypes.INTEGER,
      midtransToken: DataTypes.STRING,
      paymentStatus: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "RedeemDrug",
    }
  );
  return RedeemDrug;
};
