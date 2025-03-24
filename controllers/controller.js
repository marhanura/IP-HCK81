const { User, Drug, Disease } = require("../models");
const { comparePassword } = require("../helpers/bcrypt");
const { signToken } = require("../helpers/jwt");
const { OAuth2Client } = require("google-auth-library");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

class Controller {
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
      console.log("🐄 - Controller - register - error:", error);
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
      console.log("🐄 - Controller - login - error:", error);
      next(error);
    }
  }

  static async googleLogin(req, res, next) {
    try {
      const { googleToken } = req.body;
      if (!googleToken) {
        throw { name: "BadRequest", message: "Google token required" };
      }

      const client = new OAuth2Client();
      const ticket = await client.verifyIdToken({
        idToken: googleToken,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      const payload = ticket.getPayload();

      const [user] = await User.findOrCreate({
        where: {
          email: payload.email,
        },
        defaults: {
          username: payload.name,
          email: payload.email,
          password: `${Math.random().toString()}!${Date.now()}`,
          role: "user",
          status: "active",
        },
      });

      const access_token = signToken({ id: user.id });
      res.status(200).json({ access_token, email: user.email });
    } catch (error) {
      console.log("🐄 - Controller - googleLogin - error:", error);
      next(error);
    }
  }

  static async updateUserStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      console.log("🐄 - Controller - updateUserStatus - status:", status);
      const user = await User.findByPk(id);
      if (!user) {
        throw { name: "NotFound", message: "User not found" };
      }
      if (!status) {
        throw { name: "BadRequest", message: "Status is required" };
      }
      await user.update({ status });
      res.status(200).json({ message: "User status updated" });
    } catch (error) {
      console.log("🐄 - Controller - updateStatus - error:", error);
      next(error);
    }
  }

  static async deleteUser(req, res, next) {
    try {
      const { userId } = req.params;
      const user = await User.findByPk(userId);
      if (!user) {
        throw { name: "NotFound", message: "User not found" };
      }
      await user.destroy();
      res.status(200).json({ message: "User deleted" });
    } catch (error) {
      console.log("🐄 - Controller - deleteUser - error:", error);
      next(error);
    }
  }

  static async getDrugs(req, res, next) {
    try {
      let data = await Drug.findAll();
      res.status(200).json(data);
    } catch (error) {
      console.log("🐄 - Controller - getDrugs - error:", error);
      next(error);
    }
  }

  static async addDisease(req, res, next) {
    try {
      const { userId } = req.params;
      let { symptoms } = req.body;
      if (!symptoms) {
        throw { name: "BadRequest", message: "Symptoms are required" };
      }
      let user = await User.findByPk(userId);
      if (!user) {
        throw { name: "NotFound", message: "User not found" };
      }
      console.log("🐄 - Controller - addDisease - symptoms:", symptoms);
      let drugs = await Drug.findAll({ attributes: ["id", "name"] });
      let drugsSorted = drugs.map((drug) => {
        return { id: drug.id, name: drug.name };
      });
      const prompt = `Based on the following symptoms: ${symptoms}, analyze the disease and recommend the medication guideline based on drugs available in ${JSON.stringify(
        drugsSorted
      )}. Do not include drugs outside this drug list.
      Return response without additional information, strictly follow the format below with only one respond:
      {
        "diagnose": "string" (only mention the disease name),
        "prescription": "string" (only one drug),
        "DrugId": "number" (based on the drug list above)
    }
         If not able to be analyzed, return:
          {
            "diagnose": "unknown",
            "prescription": "unknown"
          }`;
      let result = await model.generateContent(prompt);
      let response = result.response
        .text()
        .replace(/```json|```/g, "")
        .trim();
      response = JSON.parse(response);
      console.log("🐄 - Controller - addDisease - response:", response);
      if (response.diagnose === "unknown") {
        throw {
          name: "BadRequest",
          message: "Please specify the symptoms",
        };
      }
      const disease = await Disease.create({
        symptoms,
        diagnose: response.diagnose,
        prescription: response.prescription,
        UserId: userId,
        DrugId: response.DrugId,
      });
      res.status(201).json(disease);
    } catch (error) {
      console.log("🐄 - Controller - addDisease - error:", error);
      next(error);
    }
  }

  static async getAllDiseases(req, res, next) {
    try {
      let data = await Disease.findAll({
        include: {
          model: User,
          attributes: ["username", "email", "status"],
        },
      });
      res.status(200).json(data);
    } catch (error) {
      console.log("🐄 - Controller - getAllDiseases - error:", error);
      next(error);
    }
  }

  static async getDiseasebyUser(req, res, next) {
    try {
      const { userId } = req.params;
      let data = await Disease.findAll({
        where: { UserId: userId },
      });
      res.status(200).json(data);
    } catch (error) {
      console.log("🐄 - Controller - getDiseasebyUser - error:", error);
      next(error);
    }
  }

  static async deleteDisease(req, res, next) {
    try {
      const { diseaseId } = req.params;
      const disease = await Disease.findByPk(diseaseId);
      if (!disease) {
        throw { name: "NotFound", message: "Disease not found" };
      }
      await disease.destroy();
      res.status(200).json({ message: `Disease ${disease.diagnose} deleted` });
    } catch (error) {
      console.log("🐄 - Controller - deleteDiasese - error:", error);
      next(error);
    }
  }

  static async redeemDrug(req, res, next) {
    try {
      let { drugId, diseaseId } = req.params;
      let drug = await Drug.findByPk(drugId);
      if (!drug) {
        throw { name: "NotFound", message: "Drug not found" };
      }
      let disease = await Disease.findByPk(diseaseId, { include: User });
      if (!disease) {
        throw { name: "NotFound", message: "Disease not found" };
      }
      let user = await User.findByPk(disease.UserId);
      if (user.status === "inactive") {
        throw {
          name: "BadRequest",
          message: "User has no prescription to redeem",
        };
      }
      if (disease.DrugId !== drug.id) {
        throw {
          name: "BadRequest",
          message: "Drug not prescribed for this disease",
        };
      }
      await User.update(
        { status: "inactive" },
        { where: { id: disease.UserId } }
      );
      res.status(200).json({ message: `Drug ${drug.name} is redeemed` });
    } catch (error) {
      console.log("🐄 - Controller - getDrugForUser - error:", error);
      next(error);
    }
  }
}

module.exports = Controller;
