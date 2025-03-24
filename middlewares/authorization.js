const { Disease } = require("../models");

async function authorization(req, res, next) {
  try {
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
