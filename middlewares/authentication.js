const { User } = require("../models");
const { verifyToken } = require("../helpers/jwt");

async function authentication(req, res, next) {
  try {
    const bearerToken = req.headers.authorization;
    if (!bearerToken) {
      throw {
        name: "Unauthorized",
        message: "Invalid Token",
      };
    }
    const [, accessToken] = req.headers.authorization.split(" ");
    if (!accessToken) {
      throw {
        name: "Unauthorized",
        message: "Invalid Token",
      };
    }

    const data = verifyToken(accessToken);
    const user = await User.findByPk(data.id);
    if (!user) {
      throw {
        name: "Unauthorized",
        message: "Invalid Token",
      };
    }
    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
}

module.exports = { authentication };
