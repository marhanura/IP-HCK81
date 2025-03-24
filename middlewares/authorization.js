const { Disease } = require("../models");

async function authorization(req, res, next) {
  try {
    // let { id } = req.params;
    // let disease = await Disease.findByPk(id);
    // if (!disease) {
    //   throw {
    //     name: "NotFound",
    //     message: `Disease not found`,
    //   };
    // }
    if (req.user.role !== "tenaga kesehatan") {
      throw {
        name: "Forbidden",
        message: "You are not authorized to do this action",
      };
    }
    next();
  } catch (error) {
    next(error);
  }
}

module.exports = { authorization };
