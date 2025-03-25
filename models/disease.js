"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Disease extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Disease.belongsTo(models.User, { foreignKey: "UserId" });
      Disease.hasMany(models.DiseaseDrug, { foreignKey: "DiseaseId" });
      // define association here
    }
  }
  Disease.init(
    {
      symptoms: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: { msg: "Symptoms is required" },
          notNull: { msg: "Symptoms is required" },
        },
      },
      diagnose: DataTypes.STRING,
      recommendation: DataTypes.STRING,
      UserId: DataTypes.INTEGER,
      // DiseaseDrugId: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "Disease",
    }
  );
  return Disease;
};
