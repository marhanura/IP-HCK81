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
      const user = await User.findByPk(id);
      if (!user) {
        throw { name: "NotFound", message: "User not found" };
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
      const { id } = req.params;
      const user = await User.findByPk(id);
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

  static async addSymptoms(req, res, next) {
    try {
      const { symptoms } = req.body;
      const disease = await Disease.create({
        symptoms,
        UserId: req.user.id,
      });
      res.status(201).json(disease);
    } catch (error) {
      console.log("🐄 - Controller - addSymptoms - error:", error);
      next(error);
    }
  }

  static async analyzeDisease(req, res, next) {
    try {
      const symptoms = await Disease.findOne({
        where: { UserId: req.user.id },
        attributes: ["symptoms"],
      });
      console.log("🐄 - Controller - analyzeDisease - symptoms:", symptoms);
      const drugs = await Drug.findAll({ attributes: ["name"] });
      console.log("🐄 - Controller - analyzeDisease - drugs:", drugs);
      const prompt = `
                Based on the following symptoms: ${JSON.stringify(
                  symptoms
                )}, analyse the disease and recommend the medication guideline based on drugs available in ${JSON.stringify(
        drugs
      )}. 
                Do not include drugs outside this drugs list.

                Respond strictly in the format:
                
                    {
                        "diagnose": "string",
                        "prescription": "string",
                    }
                

                If no recommendations, return [].`;
      console.log("🐄 - Controller - analyzeDisease - prompt:", prompt);
      const response = await model.generateContent(prompt);
      console.log("🐄 - Controller - analyzeDisease - response:", response);
    } catch (error) {
      console.log("🐄 - Controller - analyzeDisease - error:", error);
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

  static async getPrescribedDrug(req, res, next) {
    try {
      let { drugId, diseaseId } = req.params;
      let drug = await Drug.findByPk(drugId);
      if (!drug) {
        throw { name: "NotFound", message: "Drug not found" };
      }
      let disease = await Disease.findByPk(diseaseId);
      if (!disease) {
        throw { name: "NotFound", message: "Disease not found" };
      }
      await disease.update({ DrugId: drugId });
      res.status(200).json({ message: `${drug} successfully prescribed` });
    } catch (error) {
      console.log("🐄 - Controller - getDrugForUser - error:", error);
      next(error);
    }
  }
}

module.exports = Controller;
