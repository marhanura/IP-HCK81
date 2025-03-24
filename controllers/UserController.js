const { User } = require("../models");
const { comparePassword } = require("../helpers/bcrypt");
const { signToken } = require("../helpers/jwt");

class UserController {
  static async register(req, res, next) {
    try {
      const user = await User.create(req.body);
      if (!user) {
        throw {
          name: "BadRequest",
          message: "Please check your input",
        };
      }
      res.status(201).json({
        id: user.id,
        email: user.email,
      });
    } catch (error) {
      console.log("🐄 - UserController - register - error:", error);
      next(error);
    }
  }

  static async login(req, res, next) {
    try {
      const { email, password } = req.body;
      if (!email) {
        throw { name: "BadRequest", message: "Email required" };
      }
      if (!password) {
        throw { name: "BadRequest", message: "Password required" };
      }
      const user = await User.findOne({ where: { email } });
      if (!user) {
        throw { name: "Unauthorized", message: "User not found" };
      }
      const isValidPassword = comparePassword(password, user.password);
      if (!isValidPassword) {
        throw { name: "Unauthorized", message: "Password not matched" };
      }
      const access_token = signToken({ id: user.id });
      res.status(200).json({ access_token, email, role: user.role });
    } catch (error) {
      console.log("🐄 - UserController - login - error:", error);
      next(error);
    }
  }
}

module.exports = UserController;
