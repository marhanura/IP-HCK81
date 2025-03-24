const { Cuisine } = require("../models");

async function authorization(req, res, next) {
  try {
    let { id } = req.params;
    let cuisine = await Cuisine.findByPk(id);
    if (!cuisine) {
      throw {
        name: "NotFound",
        message: `Cuisine not found`,
      };
    }
    if (req.user.role === "Staff" && cuisine.authorId !== req.user.id) {
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
