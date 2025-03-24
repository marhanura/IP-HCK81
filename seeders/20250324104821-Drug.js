"use strict";
const fs = require("fs").promises;
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    let drugs = JSON.parse(await fs.readFile("./data/drugs.json", "utf8")).map(
      (drug) => {
        delete drug.id;
        drug.createdAt = new Date();
        drug.updatedAt = new Date();
        return drug;
      }
    );
    await queryInterface.bulkInsert("Drugs", drugs);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("Drugs", drugs);
  },
};
