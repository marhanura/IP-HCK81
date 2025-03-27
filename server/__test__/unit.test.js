const {
  test,
  expect,
  describe,
  beforeAll,
  afterAll,
} = require("@jest/globals");
const request = require("supertest");
const app = require("../app");
const {
  User,
  Disease,
  DiseaseDrug,
  RedeemDrug,
  Drug,
  sequelize,
} = require("../models");
const { signToken } = require("../helpers/jwt");
const { hashPassword } = require("../helpers/bcrypt");
const { OAuth2Client } = require("google-auth-library");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const midtransClient = require("midtrans-client");

const genAI = new GoogleGenerativeAI("fake-api-key");
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

let accessTokenPasien;
let accessTokenNakes;

beforeAll(async () => {
  const users = [
    {
      username: "nakes1",
      email: "nakes1@mail.com",
      password: hashPassword("nakes1"),
      role: "tenaga kesehatan",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      username: "pasien1",
      email: "pasien1@mail.com",
      password: hashPassword("pasien1"),
      role: "pasien",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  const drugs = require("../data/drugs.json").map((drug) => {
    delete drug.id;
    drug.createdAt = new Date();
    drug.updatedAt = new Date();
    return drug;
  });

  const disease = [
    {
      symptoms: "fever, headache",
      diagnose: "Common Cold",
      recommendation: "Rest and drink plenty of fluids.",
      status: "not redeemed",
      createdAt: new Date(),
      updatedAt: new Date(),
      UserId: 1,
    },
  ];

  const redeemDrug = [
    {
      DiseaseId: 1,
      totalPrice: 10000,
      midtransToken: "ff114419-32c4-44b2-ae0d-27c8399bb9b9",
      paymentStatus: "pending",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  await sequelize.queryInterface.bulkInsert("Users", users);
  await sequelize.queryInterface.bulkInsert("Drugs", drugs);
  await sequelize.queryInterface.bulkInsert("Diseases", disease);
  const nakes = await User.findOne({ where: { role: "tenaga kesehatan" } });
  accessTokenNakes = signToken({ id: nakes.id });
  const pasien = await User.findOne({ where: { role: "pasien" } });
  accessTokenPasien = signToken({ id: pasien.id });
});

afterAll(async () => {
  await sequelize.queryInterface.bulkDelete("Users", null, {
    truncate: true,
    restartIdentity: true,
    cascade: true,
  });
  await sequelize.queryInterface.bulkDelete("Drugs", null, {
    truncate: true,
    restartIdentity: true,
    cascade: true,
  });
  await sequelize.queryInterface.bulkDelete("Diseases", null, {
    truncate: true,
    restartIdentity: true,
    cascade: true,
  });
});

describe("GET /", () => {
  test("Should return welcome message", async () => {
    const res = await request(app).get("/");

    expect(res.status).toBe(200);
    expect(res.text).toBe("Welcome to Zehat, your health zolution");
  });
});

describe("POST /register", () => {
  test("Successfully register a new user", async () => {
    const newUser = {
      username: "pasien2",
      email: "pasien2@mail.com",
      password: "pasien2",
      role: "pasien",
    };

    const res = await request(app).post("/register").send(newUser);
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("id");
    expect(res.body).toHaveProperty("email", newUser.email);
  });

  test("Should return 400 if username is missing", async () => {
    const newUser = {
      email: "pasien2@mail.com",
      password: "pasien2",
      role: "pasien",
    };

    const res = await request(app).post("/register").send(newUser);
    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Email is required");
  });

  test("Should return 400 if email is missing", async () => {
    const newUser = {
      username: "pasien2",
      password: "pasien2",
      role: "pasien",
    };

    const res = await request(app).post("/register").send(newUser);
    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Email is required");
  });

  test("Should return 400 if email format is invalid", async () => {
    const newUser = {
      username: "pasien2",
      email: "pasien2",
      password: "pasien2",
      role: "pasien",
    };

    const res = await request(app).post("/register").send(newUser);
    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Email format is invalid");
  });

  test("Should return 400 if email is already registered", async () => {
    const newUser = {
      username: "pasien2",
      email: "pasien1@mail.com",
      password: "pasien1",
      role: "pasien",
    };

    const res = await request(app).post("/register").send(newUser);
    expect(res.status).toBe(400);
    expect(res.body.message).toBe("email must be unique");
  });

  test("Should return 400 if password is less than 5 characters", async () => {
    const newUser = {
      username: "pasien2",
      email: "pasien2@mail.com",
      password: "pasi",
      role: "pasien",
    };

    const res = await request(app).post("/register").send(newUser);
    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Password must be at least 5 characters");
  });

  test("Should return 400 if role is empty", async () => {
    const newUser = {
      username: "pasien2",
      email: "pasien2@mail.com",
      password: "pasien2",
    };

    const res = await request(app).post("/register").send(newUser);
    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Role is required");
  });
});

describe("POST /login", () => {
  test("Successfully login", async () => {
    const user = {
      email: "nakes1@mail.com",
      password: "nakes1",
    };

    const res = await request(app).post("/login").send(user);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("access_token");
    expect(res.body).toHaveProperty("email", user.email);
  });

  test("Should return 400 if email is empty", async () => {
    const user = {
      password: "nakes1",
    };

    const res = await request(app).post("/login").send(user);
    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Email is required");
  });

  test("Should return 401 if email is not registered", async () => {
    const user = {
      email: "nakes1@mail.co",
      password: "nakes1",
    };

    const res = await request(app).post("/login").send(user);
    expect(res.status).toBe(401);
    expect(res.body.message).toBe("User not found");
  });

  test("Should return 400 if password is empty", async () => {
    const user = {
      email: "nakes1@mail.com",
    };

    const res = await request(app).post("/login").send(user);
    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Password is required");
  });

  test("Should return 401 if password not matched", async () => {
    const user = {
      email: "nakes1@mail.com",
      password: "nakes",
    };

    const res = await request(app).post("/login").send(user);
    expect(res.status).toBe(401);
    expect(res.body.message).toBe("Password not matched");
  });
});

describe(`POST /google-login`, () => {
  test("Should successfully log in an existing user with Google", async () => {
    jest.spyOn(OAuth2Client.prototype, "verifyIdToken").mockResolvedValue({
      getPayload: () => ({
        email: "existinguser@mail.com",
        name: "Existing User",
      }),
    });

    await User.create({
      username: "Existing User",
      email: "existinguser@mail.com",
      password: "randompassword",
      role: "pasien",
    });

    const res = await request(app).post("/google-login").send({
      googleToken: "valid-google-token",
    });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("access_token");
    expect(res.body).toHaveProperty("email", "existinguser@mail.com");
  });

  test("Should return 400 if Google token is missing", async () => {
    const res = await request(app).post("/google-login").send({});

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("message", "Google token required");
  });

  test("Should handle invalid Google token", async () => {
    jest
      .spyOn(OAuth2Client.prototype, "verifyIdToken")
      .mockRejectedValue(new Error("Invalid token"));

    const res = await request(app)
      .post("/google-login")
      .send({ googleToken: "invalid-token" });

    expect(res.status).toBe(500);
  });

  test("Should create a new user if not exist during Google login", async () => {
    // Ensure the user does not exist
    await User.destroy({ where: { email: "newuser@mail.com" } });

    jest.spyOn(OAuth2Client.prototype, "verifyIdToken").mockResolvedValue({
      getPayload: () => ({
        email: "newuser@mail.com",
        name: "New User",
      }),
    });

    const res = await request(app)
      .post("/google-login")
      .send({ googleToken: "new-valid-token" });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("access_token");
    expect(res.body).toHaveProperty("email", "newuser@mail.com");
  });
});

describe("GET /drugs", () => {
  test("Should retrieve all drugs successfully", async () => {
    const res = await request(app).get("/drugs");

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body).toEqual({
      totalPages: 1,
      currentPage: 1,
      dataPerPage: 9,
    });
  });

  test("Should filter drugs by search query", async () => {
    const res = await request(app).get("/drugs?search=Paracetamol");

    expect(res.status).toBe(200);
    expect(res.body.data[0]).toHaveProperty("name", "Paracetamol");
  });

  test("should return empty array if no drugs match search", async () => {
    const res = await request(app).get("/drugs?search=nonexistent");

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(0);
    expect(res.body.totalData).toBe(0);
  });

  test("should handle pagination correctly", async () => {
    const res1 = await request(app).get("/drugs?page[size]=2&page[number]=1");
    expect(res1.status).toBe(200);
    expect(res1.body.data.length).toBe(2);
    expect(res1.body.totalPages).toBe(2);
    expect(res1.body.currentPage).toBe(1);
    expect(res1.body.dataPerPage).toBe(2);

    // Second page with 2 items per page
    const res2 = await request(app).get("/drugs?page[size]=2&page[number]=2");
    expect(res2.status).toBe(200);
    expect(res2.body.data.length).toBe(1);
    expect(res2.body.currentPage).toBe(2);
  });

  test("should handle invalid page number gracefully", async () => {
    const res = await request(app).get("/drugs?page[number]=0");
    expect(res.status).toBe(200);
    expect(res.body.currentPage).toBe(1); // Should default to 1
  });

  test("should handle invalid page size gracefully", async () => {
    const res = await request(app).get("/drugs?page[size]=abc");
    expect(res.status).toBe(200);
    expect(res.body.dataPerPage).toBe(9); // Should default to 9
  });

  test("should handle case-insensitive search", async () => {
    const res = await request(app).get("/drugs?search=PARA");
    expect(res.status).toBe(200);
    expect(res.body.data[0].name).toBe("Paracetamol");
  });

  test("should return correct pagination metadata", async () => {
    const res = await request(app).get("/drugs?page[size]=1&page[number]=2");
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      currentPage: 2,
      dataPerPage: 1,
    });
  });
});

describe("GET /drugs/:drugId", () => {
  test("Should retrieve drug by its id successfully", async () => {
    const res = await request(app).get("/drugs/1");

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("name");
    expect(res.body).toHaveProperty("price");
  });

  test("Should return 404 if drug not found", async () => {
    const res = await request(app).get("/drugs/999");

    expect(res.status).toBe(404);
    expect(res.body.message).toBe("Drug not found");
  });

  test("Should handle pagination correctly", async () => {
    const res = await request(app).get("/drugs?page[number]=1&page[size]=5");

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(5);
    expect(res.body.totalPages).toBeGreaterThanOrEqual(1);
  });

  test("Should return empty array if no drugs match search", async () => {
    const res = await request(app).get("/drugs?search=nonexistentdrug");

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(0);
  });
});

describe("POST /redeem-drugs/:diseaseId", () => {
  beforeEach(async () => {
    jest
      .spyOn(midtransClient.Snap.prototype, "createTransaction")
      .mockResolvedValue({
        token: "fake-midtrans-token",
      });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("Should create a new redeemDrug if none exists and prescribed drugs are found", async () => {
    await DiseaseDrug.create({ DiseaseId: 1, DrugId: 1 });
    await RedeemDrug.destroy({ where: { DiseaseId: 1 } });

    const res = await request(app)
      .post("/redeem-drugs/1")
      .set("Authorization", `Bearer ${accessTokenNakes}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("DiseaseId", 1);
    expect(res.body).toHaveProperty("totalPrice");
    expect(res.body).toHaveProperty("midtransToken", "fake-midtrans-token");
    expect(res.body).toHaveProperty("paymentStatus", "pending");
  });

  test("Should update existing redeemDrug if found", async () => {
    await DiseaseDrug.create({ DiseaseId: 1, DrugId: 1 });

    let existing = await RedeemDrug.findOne({ where: { DiseaseId: 1 } });
    if (!existing) {
      existing = await RedeemDrug.create({
        DiseaseId: 1,
        totalPrice: 0,
        midtransToken: "old-token",
        paymentStatus: "unpaid",
      });
    }

    const res = await request(app)
      .post("/redeem-drugs/1")
      .set("Authorization", `Bearer ${accessTokenNakes}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("DiseaseId", 1);
    expect(res.body).toHaveProperty("midtransToken", "fake-midtrans-token");
    expect(res.body).toHaveProperty("paymentStatus", "pending");
    expect(res.body.totalPrice).toBeGreaterThan(0);
  });

  test("Should return 400 if no drugs are prescribed for the disease", async () => {
    const newDisease = await Disease.create({
      diagnose: "unknown",
    });

    const res = await request(app)
      .post(`/redeem-drugs/${newDisease.id}`)
      .set("Authorization", `Bearer ${accessTokenNakes}`);

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty(
      "message",
      "Disease not found or no drug prescribed"
    );
  });

  test("Should return 400 if no prescribed drugs are found", async () => {
    const newDisease = await Disease.create({
      diagnose: "No Drugs",
      symptoms: "none",
      recommendation: "none",
      status: "not redeemed",
      UserId: 1,
    });

    const res = await request(app)
      .post(`/redeem-drugs/${newDisease.id}`)
      .set("Authorization", `Bearer ${accessTokenNakes}`);

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty(
      "message",
      "Disease not found or no drug prescribed"
    );
  });

  test("should return 401 if token is invalid/no token", async () => {
    const newDisease = await Disease.create({
      diagnose: "unknown",
    });

    const res = await request(app).post(`/redeem-drugs/${newDisease.id}`);

    expect(res.status).toBe(401);
    expect(res.body.message).toHaveProperty("Invalid Token");
  });

  test("should return 404 if the disease does not exist", async () => {
    const res = await request(app)
      .post(`/redeem-drugs/9999`)
      .set("Authorization", `Bearer ${accessTokenNakes}`);

    expect(res.status).toBe(404);
    expect(res.body.message).toHaveProperty(
      "Disease not found or no drug prescribed"
    );
  });
});

describe("GET /diseases/users/:userId", () => {
  test("Should retrieve diseases by its user successfully", async () => {
    const res = await request(app)
      .get("/diseases/users/1")
      .set("Authorization", `Bearer ${accessTokenNakes}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body).toHaveProperty("Diseases");
  });

  test("should return 401 if token is invalid/no token", async () => {
    const res = await request(app).post(`/diseases/users/1`);

    expect(res.status).toBe(401);
    expect(res.body.message).toHaveProperty("Invalid Token");
  });

  test("Should return 403 if user not found", async () => {
    const res = await request(app)
      .get("/diseases/users/999")
      .set("Authorization", `Bearer ${accessTokenPasien}`);

    expect(res.status).toBe(404);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.message).toBe("Disease not found");
  });

  test("Should return 404 if user not found", async () => {
    const res = await request(app)
      .get("/diseases/users/9999")
      .set("Authorization", `Bearer ${accessTokenNakes}`);

    expect(res.status).toBe(404);
    expect(res.body.message).toBe("Disease not found");
  });
});

describe("PATCH /redeem-drugs/:diseaseId", () => {
  test("Should update disease and redeem drug status successfully", async () => {
    const res = await request(app)
      .patch("/redeem-drugs/1")
      .send({ paymentStatus: "paid", status: "redeemed" })
      .set("Authorization", `Bearer ${accessTokenNakes}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("redeemDrug");
    expect(res.body).toHaveProperty("disease");
    expect(res.body.disease).toHaveProperty("status", "redeemed");
    expect(res.body.redeemDrug).toHaveProperty("paymentStatus", "paid");
  });

  test("Should return 401 if no token", async () => {
    const res = await request(app).patch(`/redeem-drugs/1`);

    expect(res.status).toBe(401);
    expect(res.body.message).toHaveProperty("Invalid Token");
  });

  test("Should return 401 if invalid token", async () => {
    const res = await request(app)
      .patch(`/redeem-drugs/1`)
      .set("Authorization", `Bearer token ngaco`);

    expect(res.status).toBe(401);
    expect(res.body.message).toHaveProperty("Invalid Token");
  });

  test("Should return 403 if unauthorized", async () => {
    const res = await request(app)
      .patch(`/redeem-drugs/1`)
      .set("Authorization", `Bearer ${accessTokenPasien}`);

    expect(res.status).toBe(403);
    expect(res.body.message).toHaveProperty(
      "You are not authorized to do this action"
    );
  });

  test("Should return 404 if redeemDrug or disease not found", async () => {
    const res = await request(app)
      .patch("/redeem-drugs/9999")
      .send({ paymentStatus: "paid", status: "redeemed" })
      .set("Authorization", `Bearer ${accessTokenNakes}`);

    expect(res.status).toBe(404);
  });

  test("Should update disease and redeem drug status successfully", async () => {
    const res = await request(app)
      .patch("/redeem-drugs/1")
      .send({ paymentStatus: "paid", status: "redeemed" })
      .set("Authorization", `Bearer ${accessTokenNakes}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("redeemDrug");
    expect(res.body).toHaveProperty("disease");
    expect(res.body.disease).toHaveProperty("status", "redeemed");
    expect(res.body.redeemDrug).toHaveProperty("paymentStatus", "paid");
  });

  test("Should return 400 if request body is empty", async () => {
    const res = await request(app)
      .patch("/redeem-drugs/1")
      .send({}) // kosong
      .set("Authorization", `Bearer ${accessTokenNakes}`);

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Please specify the status");
  });

  test("Should return 404 if redeemDrug or disease not found", async () => {
    const res = await request(app)
      .patch("/redeem-drugs/9999")
      .send({ paymentStatus: "paid", status: "redeemed" })
      .set("Authorization", `Bearer ${accessTokenNakes}`);

    expect(res.status).toBe(404);
  });
});

describe("GET /diseases", () => {
  test("Should retrieve all diseases successfully", async () => {
    const res = await request(app)
      .get("/diseases")
      .set("Authorization", `Bearer ${accessTokenNakes}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test("Should filter diseases by status", async () => {
    const res = await request(app)
      .get("/diseases?filter=redeemed")
      .set("Authorization", `Bearer ${accessTokenNakes}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0].status).toBe("redeemed");
  });

  test("Should return 401 if token is invalid or missing", async () => {
    const res = await request(app).get("/diseases");

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty("message", "Invalid Token");
  });

  test("Should return 403 if token is unauthorized", async () => {
    const res = await request(app)
      .get("/diseases")
      .set("Authorization", `Bearer ${accessTokenPasien}`);

    expect(res.status).toBe(403);
    expect(res.body).toHaveProperty(
      "message",
      "You are not authorized to do this action"
    );
  });
});

describe("POST /diseases/add/:userId", () => {
  beforeEach(() => {
    // Mock AI response untuk addDisease
    jest.spyOn(model, "generateContent").mockResolvedValue({
      response: {
        text: () =>
          JSON.stringify({
            diagnose: "Common Cold",
            recommendation: "Rest and drink plenty of fluids.",
            drugs: "Paracetamol, Ibuprofen",
            DrugId: "1, 2",
          }),
      },
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("Should successfully add a disease for a user", async () => {
    const symptoms = "fever, headache";
    const res = await request(app)
      .post("/diseases/add/1")
      .set("Authorization", `Bearer ${accessTokenNakes}`)
      .send({ symptoms });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("symptoms", symptoms);
    expect(res.body).toHaveProperty("diagnose", "Common Cold");
    expect(res.body).toHaveProperty(
      "recommendation",
      "Rest and drink plenty of fluids."
    );
    // Pastikan status default
    expect(res.body).toHaveProperty("status", "not redeemed");
  });

  test("Should return 400 if symptoms are missing", async () => {
    const res = await request(app)
      .post("/diseases/add/1")
      .set("Authorization", `Bearer ${accessTokenNakes}`)
      .send({});

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("message", "Symptoms is required");
  });

  test("Should return 403 if token is unauthorized", async () => {
    const res = await request(app)
      .post("/diseases/add/1")
      .set("Authorization", `Bearer ${accessTokenPasien}`)
      .send({ symptoms: "fever, headache" });

    expect(res.status).toBe(403);
    expect(res.body).toHaveProperty(
      "message",
      "You are not authorized to do this action"
    );
  });

  test("Should return 404 if user is not found", async () => {
    const res = await request(app)
      .post("/diseases/add/9999")
      .set("Authorization", `Bearer ${accessTokenNakes}`)
      .send({ symptoms: "fever, headache" });

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty("message", "User not found");
  });

  test("Should return 400 if AI cannot analyze the symptoms", async () => {
    // Mock response AI gagal menganalisis (diagnose unknown)
    jest.spyOn(model, "generateContent").mockResolvedValue({
      response: {
        text: () =>
          JSON.stringify({
            diagnose: "unknown",
          }),
      },
    });

    const res = await request(app)
      .post("/diseases/add/1")
      .set("Authorization", `Bearer ${accessTokenNakes}`)
      .send({ symptoms: "unknown symptoms" });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("message", "Please specify the symptoms");
  });
});

describe("GET /diseases/:diseaseId", () => {
  test("Should retrieve disease by its id", async () => {
    const res = await request(app)
      .get("/diseases/1")
      .set("Authorization", `Bearer ${accessTokenNakes}`);
    expect(res.status).toBe(200);
    // Karena getDiseaseById mengembalikan array hasil findAll
    expect(Array.isArray(res.body)).toBe(true);
    if (res.body.length > 0) {
      expect(res.body[0]).toHaveProperty("diagnose");
    }
  });

  test("Should return 401 if no token", async () => {
    const res = await request(app).get("/diseases/1");

    expect(res.status).toBe(401);
    expect(res.body.message).toBe("Invalid Token");
  });

  test("Should return 401 if invalid token", async () => {
    const res = await request(app)
      .get("/diseases/1")
      .set("Authorization", `Bearer access token ngaco`);

    expect(res.status).toBe(401);
    expect(res.body.message).toBe("Invalid Token");
  });

  test("Should return 403 if token is unauthorized", async () => {
    const res = await request(app)
      .get("/diseases/1")
      .set("Authorization", `Bearer ${accessTokenPasien}`);

    expect(res.status).toBe(403);
    expect(res.body.message).toBe("You are not authorized to do this action");
  });

  test("Should return 404 if disease not found", async () => {
    const res = await request(app)
      .get("/diseases/9999")
      .set("Authorization", `Bearer ${accessTokenNakes}`);
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty("message", "Disease not found");
  });
});

describe("DELETE /diseases/:diseaseId", () => {
  test("Should delete a disease successfully", async () => {
    // Tambahkan disease baru agar tidak menghapus data untuk test lainnya
    const newDisease = await Disease.create({
      symptoms: "cough",
      diagnose: "Flu",
      recommendation: "Rest",
      UserId: 1,
      status: "not redeemed",
    });
    const res = await request(app)
      .delete(`/diseases/${newDisease.id}`)
      .set("Authorization", `Bearer ${accessTokenNakes}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("message", "Disease deleted");
  });

  test("Should return 401 if invalid/no token", async () => {
    const res = await request(app).delete("/diseases/1");

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty("message", "Invalid Token");
  });

  test("Should return 403 if token is unauthorized", async () => {
    const res = await request(app)
      .delete("/diseases/1")
      .set("Authorization", `Bearer ${accessTokenPasien}`);

    expect(res.status).toBe(403);
    expect(res.body).toHaveProperty(
      "message",
      "You are not authorized to do this action"
    );
  });

  test("Should return 404 if disease not found", async () => {
    const res = await request(app)
      .delete("/diseases/9999")
      .set("Authorization", `Bearer ${accessTokenNakes}`);
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty("message", "Disease not found");
  });
});

describe("POST /diseases/:diseaseId/:drugId", () => {
  test("Should add a drug to a disease successfully", async () => {
    const res = await request(app)
      .post("/diseases/1/1")
      .set("Authorization", `Bearer ${accessTokenNakes}`);
    expect(res.status).toBe(201);
    // Karena controller mengembalikan objek diseaseDrug, periksa field-nya
    expect(res.body).toHaveProperty("DiseaseId", 1);
    expect(res.body).toHaveProperty("DrugId", 1);
  });

  test("Should return 401 if no token", async () => {
    const res = await request(app).post(`/diseases/1/1`);

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty("message", "Invalid Token");
  });

  test("Should return 401 if no token", async () => {
    const res = await request(app)
      .post(`/diseases/1/1`)
      .set("Authorization", `Bearer token ngaco`);

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty("message", "Invalid Token");
  });

  test("Should return 403 if token is unauthorized", async () => {
    const res = await request(app)
      .post(`/diseases/1/1`)
      .set("Authorization", `Bearer ${accessTokenPasien}`);

    expect(res.status).toBe(403);
    expect(res.body).toHaveProperty(
      "message",
      "You are not authorized to do this action"
    );
  });

  test("Should return 404 if disease not found", async () => {
    const res = await request(app)
      .post("/diseases/9999/1")
      .set("Authorization", `Bearer ${accessTokenNakes}`);
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty("message", "Disease not found");
  });

  test("Should return 404 if drug not found", async () => {
    const res = await request(app)
      .post("/diseases/1/9999")
      .set("Authorization", `Bearer ${accessTokenNakes}`);
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty("message", "Drug not found");
  });
});

describe("GET /users", () => {
  test("Should retrieve all users successfully", async () => {
    const res = await request(app)
      .get("/users")
      .set("Authorization", `Bearer ${accessTokenNakes}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    if (res.body.length > 0) {
      expect(res.body[0]).toHaveProperty("email");
      expect(res.body[0]).toHaveProperty("role");
    }
  });

  test("Should return 401 if no token", async () => {
    const res = await request(app).get("/users");

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty("message", "Invalid Token");
  });

  test("Should return 401 if invalid token", async () => {
    const res = await request(app)
      .get("/users")
      .set("Authorization", `Bearer token ngaco`);

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty("message", "Invalid Token");
  });

  test("Should return 403 if token is unauthorized", async () => {
    const res = await request(app)
      .get("/users")
      .set("Authorization", `Bearer ${accessTokenPasien}`);

    expect(res.status).toBe(403);
    expect(res.body).toHaveProperty(
      "message",
      "You are not authorized to do this action"
    );
  });
});

describe("DELETE /users/:userId", () => {
  test("Should delete a user successfully", async () => {
    // Tambahkan user baru agar tidak menghapus data penting untuk test lainnya
    const newUser = await User.create({
      username: "tempuser",
      email: "tempuser@mail.com",
      password: hashPassword("tempuser"),
      role: "pasien",
    });
    const res = await request(app)
      .delete(`/users/${newUser.id}`)
      .set("Authorization", `Bearer ${accessTokenNakes}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("message", "User deleted");
  });

  test("Should return 401 if doesn't have access token/invalid token", async () => {
    const res = await request(app)
      .delete(`/users/1`)
      .set("Authorization", `Bearer token ngaco`);

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty("message", "Invalid Token");
  });

  test("Should return 403 if role is unauthorized", async () => {
    const res = await request(app)
      .delete(`/users/1`)
      .set("Authorization", `Bearer ${accessTokenPasien}`);

    expect(res.status).toBe(403);
    expect(res.body).toHaveProperty(
      "message",
      "You are not authorized to do this action"
    );
  });

  test("Should return 404 if user not found", async () => {
    const res = await request(app)
      .delete("/users/9999")
      .set("Authorization", `Bearer ${accessTokenNakes}`);
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty("message", "User not found");
  });
});

describe("Authentication middleware", () => {
  test("Should pass authentication with a valid token", async () => {
    const res = await request(app)
      .get("/diseases")
      .set("Authorization", `Bearer ${accessTokenNakes}`);
    expect(res.status).toBe(200);
  });

  test("Should return 401 if no token is provided", async () => {
    const res = await request(app).get("/diseases");
    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty("message", "Invalid Token");
  });

  test("Should return 401 if invalid token is provided", async () => {
    const res = await request(app)
      .get("/diseases")
      .set("Authorization", `Bearer token ngaco`);

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty("message", "Invalid Token");
  });

  test("Should return 401 if the token belongs to a non-existent user", async () => {
    const fakeToken = signToken({ id: 9999 });

    const res = await request(app)
      .get("/diseases")
      .set("Authorization", `Bearer ${fakeToken}`);

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty("message", "Invalid Token");
  });

  test("Should return 403 if token is unauthorized", async () => {
    const res = await request(app)
      .get("/diseases")
      .set("Authorization", `Bearer ${accessTokenPasien}`);

    expect(res.status).toBe(403);
    expect(res.body).toHaveProperty(
      "message",
      "You are not authorized to do this action"
    );
  });
});
