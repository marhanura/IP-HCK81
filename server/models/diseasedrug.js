"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class DiseaseDrug extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      DiseaseDrug.belongsTo(models.Disease, { foreignKey: "DiseaseId" });
      DiseaseDrug.belongsTo(models.Drug, { foreignKey: "DrugId" });
      DiseaseDrug.hasMany(models.RedeemDrug, { foreignKey: "DiseaseId" });
      // define association here
    }
  }
  DiseaseDrug.init(
    {
      DiseaseId: DataTypes.INTEGER,
      DrugId: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "DiseaseDrug",
    }
  );
  return DiseaseDrug;
};
