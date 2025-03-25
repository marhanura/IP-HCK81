const { User, Drug, Disease, DiseaseDrug, RedeemDrug } = require("../models");
const { comparePassword } = require("../helpers/bcrypt");
const { signToken } = require("../helpers/jwt");
const { OAuth2Client } = require("google-auth-library");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const midtransClient = require("midtrans-client");
const { isProduction } = require("midtrans-client/lib/snapBi/snapBiConfig");
const drug = require("../models/drug");

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

  // static async updateUserStatus(req, res, next) {
  //   try {
  //     const { id } = req.params;
  //     const { status } = req.body;
  //     console.log("🐄 - Controller - updateUserStatus - status:", status);
  //     const user = await User.findByPk(id);
  //     if (!user) {
  //       throw { name: "NotFound", message: "User not found" };
  //     }
  //     if (!status) {
  //       throw { name: "BadRequest", message: "Status is required" };
  //     }
  //     await user.update({ status });
  //     res.status(200).json({ message: "User status updated" });
  //   } catch (error) {
  //     console.log("🐄 - Controller - updateStatus - error:", error);
  //     next(error);
  //   }
  // }

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
      let drugsData = await Drug.findAll({ attributes: ["id", "name"] });
      let drugsSorted = drugsData.map((drug) => {
        return { id: drug.id, name: drug.name };
      });
      const prompt = `Based on the following symptoms: ${symptoms}, analyze the disease and recommend the medication guideline based on drugs available in ${JSON.stringify(
        drugsSorted
      )}. Do not include drugs outside this drug list.
      Strictly return response following the format below with this response without additional comment before or after:
      {
        "diagnose": "string" (only mention the disease name),
        "recommendation": "string" (non-pharmaceutical therapy recommendation, maximum 3 sentences),
        "drugs": "string" (drugs based on the drug list, maximum 3 drugs)
        "DrugId": "string" (drug id based on the drug list)
      }
      Example:
      {
        "diagnose": "Stomach Ulcer",
        "recommendation": "Do dietary adjusment, quit smoking, and manage stress",
        "drugs": "Omeprazole, Sucralfate",
        "DrugId": "6, 43"
      }
      If unable to analyze, return response:
      {
        "diagnose": "unknown"
      }`;
      let result = await model.generateContent(prompt);
      console.log(
        "🐄 - Controller - addDisease - result:",
        result.response.text()
      );
      let response = result.response
        .text()
        .replace(/```json|```/g, "")
        .trim();
      response = JSON.parse(response);
      console.log("🐄 - Controller - addDisease - response:", response.DrugId);
      if (response.diagnose === "unknown") {
        throw {
          name: "BadRequest",
          message: "Please specify the symptoms",
        };
      }
      const newDisease = await Disease.create({
        symptoms,
        diagnose: response.diagnose,
        recommendation: response.recommendation,
        UserId: userId,
      });
      const drugs = response.DrugId.split(", ").map((drug) => {
        let diseaseDrug = DiseaseDrug.create({
          DiseaseId: newDisease.id,
          DrugId: +drug,
        });
        return diseaseDrug;
      });

      const redeemDrug = await RedeemDrug.create({
        DiseaseId: newDisease.id,
        redeemStatus: "not redeemed",
        paymentStatus: "unpaid",
      });
      res.status(201).json(newDisease);
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
      let { redeemId } = req.params;
      let prescribedDrugs = await DiseaseDrug.findAll({
        where: { DiseaseId: redeemId },
        include: Drug,
      });
      if (!prescribedDrugs) {
        throw {
          name: "BadRequest",
          message: "No drugs prescribed for this disease",
        };
      }
      let totalPrice = prescribedDrugs
        .map((drug) => drug.Drug.price)
        .reduce((acc, curr) => acc + curr);
      console.log("🐄 - Controller - redeemDrug - totalPrice:", totalPrice);

      let redeemDrug = await RedeemDrug.findByPk(redeemId);

      let snap = new midtransClient.Snap({
        isProduction: false,
        serverKey: process.env.MIDTRANS_SERVER_KEY,
        clientKey: process.env.MIDTRANS_CLIENT_KEY,
      });

      let parameter = {
        transaction_details: {
          order_id: "PRSC-" + new Date() + req.user.email,
          gross_amount: totalPrice,
        },
        credit_card: {
          secure: true,
        },
        customer_details: {
          email: req.user.email,
        },
      };

      const midtransToken = await snap.createTransaction(parameter);

      await redeemDrug.update({
        totalPrice,
        midtransToken: midtransToken.token,
      });
      res.send(redeemDrug);
      // res.status(200).json(prescribedDrugs);
    } catch (error) {
      console.log("🐄 - Controller - redeemDrug - error:", error);
      next(error);
    }
  }
}

module.exports = Controller;
