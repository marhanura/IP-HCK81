const { User, Drug, Disease, DiseaseDrug, RedeemDrug } = require("../models");
const { comparePassword } = require("../helpers/bcrypt");
const { signToken } = require("../helpers/jwt");
const { OAuth2Client } = require("google-auth-library");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const midtransClient = require("midtrans-client");
const { isProduction } = require("midtrans-client/lib/snapBi/snapBiConfig");
const { Op } = require("sequelize");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

class Controller {
  static async register(req, res, next) {
    try {
      const user = await User.create(req.body);
      res.status(201).json({
        id: user.id,
        email: user.email,
      });
    } catch (error) {
      next(error);
    }
  }

  static async login(req, res, next) {
    try {
      const { email, password } = req.body;
      if (!email) {
        throw { name: "BadRequest", message: "Email is required" };
      }
      if (!password) {
        throw { name: "BadRequest", message: "Password is required" };
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
      res.status(200).json({ access_token, email, id: user.id });
    } catch (error) {
      next(error);
    }
  }

  static async googleLogin(req, res, next) {
    try {
      const { googleToken } = req.body;
      console.log("🐄 - Controller - googleLogin - req:", req.body);
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
          role: "pasien",
        },
      });
      const access_token = signToken({ id: user.id });
      res.status(200).json({ access_token, email: user.email });
    } catch (error) {
      next(error);
    }
  }

  static async getAllDrugs(req, res, next) {
    try {
      const { search, page } = req.query;

      const options = {
        limit: 9,
        offset: 0,
        where: {},
      };

      if (search) {
        options.where.name = {
          [Op.iLike]: `%${search}%`,
        };
      }

      if (page) {
        if (page.size) {
          options.limit = page.size;
        }

        if (page.number) {
          options.offset = page.number * options.limit - options.limit;
        }
      }

      const { rows, count } = await Drug.findAndCountAll(options);

      res.status(200).json({
        data: rows,
        totalPages: Math.ceil(count / options.limit),
        currentPage: Number(page?.number || 1),
        totalData: count,
        dataPerPage: +options.limit,
      });
    } catch (error) {
      console.log("🐄 - Controller - getAllDrugs - error:", error);
      next(error);
    }
  }

  static async redeemDrug(req, res, next) {
    try {
      let { diseaseId } = req.params;
      let prescribedDrugs = await DiseaseDrug.findAll({
        where: { DiseaseId: diseaseId },
        include: Drug,
      });
      if (!prescribedDrugs || prescribedDrugs.length === 0) {
        throw {
          name: "BadRequest",
          message: "Disease not found or no drug prescribed",
        };
      }
      let totalPrice = prescribedDrugs
        .map((drug) => drug.Drug.price)
        .reduce((acc, curr) => acc + curr);

      let snap = new midtransClient.Snap({
        isProduction: false,
        serverKey: process.env.MIDTRANS_SERVER_KEY,
      });

      let parameter = {
        transaction_details: {
          order_id: "STYLE-" + new Date().getTime(),
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
      let redeemDrug = await RedeemDrug.findOne({
        where: { DiseaseId: diseaseId },
      });
      if (redeemDrug) {
        await redeemDrug.update({
          totalPrice,
          midtransToken: midtransToken.token,
          paymentStatus: "pending",
        });
      } else {
        redeemDrug = await RedeemDrug.create({
          DiseaseId: diseaseId,
          totalPrice,
          midtransToken: midtransToken.token,
          paymentStatus: "pending",
        });
      }
      res.status(200).json(redeemDrug);
    } catch (error) {
      console.log("🐄 - redeemDrug - error:", error);
      next(error);
    }
  }

  static async updateStatus(req, res, next) {
    try {
      let { diseaseId } = req.params;
      let { paymentStatus, status } = req.body;
      let redeemDrug = await RedeemDrug.findOne({
        where: { DiseaseId: diseaseId },
      });
      if (!redeemDrug || redeemDrug.length === 0) {
        throw { name: "NotFound", message: "Redeem Drug not found" };
      }
      let disease = await Disease.findByPk(diseaseId);
      if (!disease || disease.length === 0) {
        throw { name: "NotFound", message: "Disease not found" };
      }
      if (req.body.length === 0) {
        throw { name: "BadRequest", message: "Please specify the status" };
      }
      await disease.update({ status });
      await redeemDrug.update({
        paymentStatus,
      });
      res.status(200).json({ redeemDrug, disease });
    } catch (error) {
      next(error);
    }
  }

  static async getDiseasebyUser(req, res, next) {
    try {
      const { userId } = req.params;
      let data = await User.findByPk(userId, {
        include: Disease,
        attributes: { exclude: ["password"] },
      });
      if (!data || data.length === 0) {
        throw { name: "NotFound", message: "Disease not found" };
      }
      res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  }

  static async getAllDiseases(req, res, next) {
    try {
      const { filter } = req.query;

      const options = {
        where: {},
        include: User,
        order: [["createdAt", "desc"]],
      };

      if (filter) {
        options.where.status = filter;
      }

      let data = await Disease.findAll(options);
      res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  }

  static async addDisease(req, res, next) {
    try {
      const { userId } = req.params;
      let { symptoms } = req.body;
      if (!symptoms) {
        throw { name: "BadRequest", message: "Symptoms is required" };
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
      let response = result.response
        .text()
        .replace(/```json|```/g, "")
        .trim();
      response = JSON.parse(response);
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
        status: "not redeemed",
      });
      console.log("🐄 - Controller - addDisease - newDisease:", newDisease);
      const drugs = response.DrugId.split(", ").map((drug) => {
        let diseaseDrug = DiseaseDrug.create({
          DiseaseId: newDisease.id,
          DrugId: +drug,
        });
        return diseaseDrug;
      });
      res.status(201).json(newDisease);
    } catch (error) {
      console.log("🐄 - Controller - addDisease - error:", error);
      next(error);
    }
  }

  static async getDiseaseById(req, res, next) {
    try {
      const { diseaseId } = req.params;
      let disease = await Disease.findAll({
        where: { id: diseaseId },
        include: [
          {
            model: User,
          },
          {
            model: DiseaseDrug,
            attributes: ["DrugId"],
            include: {
              model: Drug,
              attributes: ["name", "price", "category"],
            },
          },
        ],
      });
      if (!disease) {
        throw { name: "NotFound", message: "Disease not found" };
      }
      res.status(200).json(disease);
    } catch (error) {
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
      res.status(200).json({ message: `Disease deleted` });
    } catch (error) {
      next(error);
    }
  }

  static async addDrugToDisease(req, res, next) {
    try {
      let { diseaseId, drugId } = req.params;
      let disease = await Disease.findByPk(diseaseId);
      if (!disease) {
        throw { name: "NotFound", message: "Disease not found" };
      }
      let drug = await Drug.findByPk(drugId);
      if (!drug) {
        throw { name: "NotFound", message: "Drug not found" };
      }
      let diseaseDrug = await DiseaseDrug.create({
        DiseaseId: diseaseId,
        DrugId: drugId,
      });
      res.status(201).json(diseaseDrug);
    } catch (error) {
      next(error);
    }
  }

  static async getAllUsers(req, res, next) {
    try {
      const users = await User.findAll({
        attributes: { exclude: ["password"] },
        order: [["createdAt", "desc"]],
      });
      res.status(200).json(users);
    } catch (error) {
      next(error);
    }
  }

  static async getLoggedUser(req, res, next) {
    try {
      const user = await User.findOne({ where: { email: req.user.email } });
      if (!user) {
        throw { name: "NotFound", message: "User not found" };
      }
      res.status(200).json(user);
    } catch (error) {
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
}

module.exports = Controller;
