const {
  test,
  expect,
  describe,
  beforeAll,
  afterAll,
} = require("@jest/globals");
const request = require("supertest");
const app = require("../app");
const { User, Disease, Drug, sequelize } = require("../models");
const { signToken } = require("../helpers/jwt");
const { hashPassword } = require("../helpers/bcrypt");

let accessTokenPasien;
let accessTokenNakes;

beforeAll(async () => {
  const users = [
    {
      email: "nakes1@mail.com",
      password: hashPassword("nakes1"),
      role: "tenaga kesehatan",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
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
  await sequelize.queryInterface.bulkInsert("Users", users);
  await sequelize.queryInterface.bulkInsert("Drugs", drugs);
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
});

describe("POST /register", () => {
  test("Successfully register a new user", async () => {
    const newUser = {
      email: "pasien2@mail.com",
      password: "pasien2",
      role: "pasien",
    };

    const res = await request(app).post("/register").send(newUser);
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("id");
    expect(res.body).toHaveProperty("email", newUser.email);
  });

  test("Should return 400 if email is empty", async () => {
    const newUser = {
      password: "pasien2",
      role: "pasien",
    };

    const res = await request(app).post("/register").send(newUser);
    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Email is required");
  });

  test("Should return 400 if email format is invalid", async () => {
    const newUser = {
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
  test("Login successfully", async () => {
    const res = await request(app).post("/google-login");
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("access_token");
  });

  test("No google token", async () => {
    const res = await request(app).post("/google-login");
    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Google token required");
  });
});

describe("GET /drugs", () => {
  test("Should retrieve all drugs successfully", async () => {
    const res = await request(app).get("/drugs");

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("data");
    expect(res.body).toHaveProperty("totalPages");
    expect(res.body).toHaveProperty("currentPage");
    expect(Array.isArray(res.body.data)).toBe(true);
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
});

describe("POST /redeem-drug/:diseaseId", () => {
  test("should successfully redeem drugs for a disease", async () => {
    const res = await request(app)
      .post(`/redeem-drug/1`)
      .set("Authorization", `Bearer ${accessTokenNakes}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("DiseaseId", 1);
    expect(res.body).toHaveProperty("totalPrice");
    expect(res.body).toHaveProperty("midtransToken");
    expect(res.body).toHaveProperty("redeemStatus", "not redeemed");
    expect(res.body).toHaveProperty("paymentStatus", "unpaid");
  });

  test("should return 400 if no drugs are prescribed for the disease", async () => {
    const newDisease = await Disease.create({
      diagnose: "unknown",
    });

    const res = await request(app)
      .post(`/redeem-drug/${newDisease.id}`)
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

    const res = await request(app).post(`/redeem-drug/${newDisease.id}`);

    expect(res.status).toBe(401);
    expect(res.body.message).toHaveProperty("Invalid Token");
  });

  test("should return 404 if the disease does not exist", async () => {
    const res = await request(app)
      .post(`/redeem-drug/9999`)
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
  });

  test("should return 401 if token is invalid/no token", async () => {
    const res = await request(app).post(`/diseases/users/1`);

    expect(res.status).toBe(401);
    expect(res.body.message).toHaveProperty("Invalid Token");
  });

  test("Should return 404 if disease not found", async () => {
    const res = await request(app).get("/drugs/999");

    expect(res.status).toBe(404);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.message).toBe("Disease not found");
  });
});

describe("GET /diseases", () => {
  test("should retrieve all diseases successfully", async () => {
    const res = await request(app)
      .get("/diseases")
      .set("Authorization", `Bearer ${accessTokenNakes}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0]).toHaveProperty("symptoms");
    expect(res.body[0]).toHaveProperty("diagnose");
    expect(res.body[0]).toHaveProperty("recommendation");
  });

  test("should retrieve diseases sorted by creation date in ascending order", async () => {
    const res = await request(app)
      .get("/diseases?sort=ASC")
      .set("Authorization", `Bearer ${accessTokenNakes}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0].createdAt).toBe("2023-01-01T00:00:00.000Z");
  });

  test("should retrieve diseases sorted by creation date in descending order", async () => {
    const res = await request(app)
      .get("/diseases?sort=DESC")
      .set("Authorization", `Bearer ${accessTokenNakes}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0].createdAt).toBe("2023-02-01T00:00:00.000Z");
  });

  test("should return 401 if token is invalid or missing", async () => {
    const res = await request(app).get("/diseases");

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty("message", "Invalid Token");
  });

  test("should return 403 if token is unauthorized", async () => {
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

describe("POST /diseases/users/:userId", () => {
  test("should successfully add a disease for a user", async () => {
    const symptoms = "fever, headache";

    // Mock the AI model response
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

    const res = await request(app)
      .post(`/diseases/user/1`)
      .set("Authorization", `Bearer ${accessTokenNakes}`)
      .send({ symptoms });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("symptoms", symptoms);
    expect(res.body).toHaveProperty("diagnose", "Common Cold");
    expect(res.body).toHaveProperty(
      "recommendation",
      "Rest and drink plenty of fluids."
    );
  });

  test("should return 400 if symptoms are missing", async () => {
    const res = await request(app)
      .post(`/diseases/user/1`)
      .set("Authorization", `Bearer ${accessTokenNakes}`)
      .send({});

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("message", "Symptoms is required");
  });

  test("should return 403 if token is unauthorized", async () => {
    const res = await request(app)
      .post(`/diseases/user/1`)
      .set("Authorization", `Bearer ${accessTokenPasien}`)
      .send({ symptoms: "fever, headache" });

    expect(res.status).toBe(403);
    expect(res.body).toHaveProperty(
      "message",
      "You are not authorized to do this action"
    );
  });

  test("should return 404 if user is not found", async () => {
    const res = await request(app)
      .post(`/diseases/user/9999`)
      .set("Authorization", `Bearer ${accessTokenNakes}`)
      .send({ symptoms: "fever, headache" });

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty("message", "User not found");
  });

  test("should return 400 if AI cannot analyze the symptoms", async () => {
    // Mock the AI model response
    jest.spyOn(model, "generateContent").mockResolvedValue({
      response: {
        text: () =>
          JSON.stringify({
            diagnose: "unknown",
          }),
      },
    });

    const res = await request(app)
      .post(`/diseases/user/1`)
      .set("Authorization", `Bearer ${accessTokenNakes}`)
      .send({ symptoms: "unknown symptoms" });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("message", "Please specify the symptoms");
  });
});

describe("GET /diseases/:diseaseId", () => {
  test("Should retrieve disease by its id successfully", async () => {
    const res = await request(app)
      .get("/diseases/1")
      .set("Authorization", `Bearer ${accessTokenNakes}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body).toHaveProperty("symptoms");
    expect(res.body).toHaveProperty("diagnose");
    expect(res.body).toHaveProperty("recommendation");
  });

  test("Should return 401 if invalid/no token", async () => {
    const res = await request(app).get("/diseases/1");

    expect(res.status).toBe(401);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.message).toBe("Invalid Token");
  });

  test("Should return 403 if token is unauthorized", async () => {
    const res = await request(app)
      .get("/diseases/1")
      .set("Authorization", `Bearer ${accessTokenPasien}`);

    expect(res.status).toBe(403);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.message).toBe("You are not authorized to do this action");
  });

  test("Should return 404 if disease not found", async () => {
    const res = await request(app)
      .get("/drugs/999")
      .set("Authorization", `Bearer ${accessTokenNakes}`);

    expect(res.status).toBe(404);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.message).toBe("Disease not found");
  });
});

describe("DELETE /diseases/:diseaseId", () => {
  test("Should delete a disease successfully", async () => {
    const res = await request(app)
      .delete("/diseases/1")
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
      .post(`/diseases/1/1`)
      .set("Authorization", `Bearer ${accessTokenNakes}`);

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("message", "Drug added to disease");
  });

  test("Should return 401 if invalid/no token", async () => {
    const res = await request(app).post(`/diseases/1/1`);

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
      .post(`/diseases/9999/1`)
      .set("Authorization", `Bearer ${accessTokenNakes}`);

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty("message", "Disease not found");
  });

  test("Should return 404 if drug not found", async () => {
    const res = await request(app)
      .post(`/diseases/1/9999`)
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
    expect(res.body[0]).toHaveProperty("email");
    expect(res.body[0]).toHaveProperty("role");
  });

  test("Should return 401 if invalid/no token", async () => {
    const res = await request(app).get("/users");

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

describe("PUT /users/:userId", () => {
  test("Should update a user successfully", async () => {
    const updateUser = {
      role: "tenaga kesehatan",
    };

    const res = await request(app)
      .put("/users/1")
      .set("Authorization", `Bearer ${accessTokenNakes}`)
      .send(updateUser);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("message", "User updated");
  });

  test("Should return 400 if no input", async () => {
    const res = await request(app)
      .put("/users/1")
      .set("Authorization", `Bearer ${accessTokenNakes}`)
      .send({});

    expect(res.status).toBe(400);
  });

  test("Should return 401 if invalid/no token", async () => {
    const updateUser = {
      role: "tenaga kesehatan",
    };
    const res = await request(app).put("/users/1").send(updateUser);

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty("message", "Invalid Token");
  });

  test("Should return 403 if token is unauthorized", async () => {
    const res = await request(app)
      .put("/users/1")
      .set("Authorization", `Bearer ${accessTokenPasien}`)
      .send({ role: "tenaga kesehatan" });

    expect(res.status).toBe(403);
    expect(res.body).toHaveProperty(
      "message",
      "You are not authorized to do this action"
    );
  });

  test("Should return 404 if user not found", async () => {
    const updateUser = {
      role: "tenaga kesehatan",
    };
    const res = await request(app)
      .put("/users/9999")
      .set("Authorization", `Bearer ${accessTokenNakes}`)
      .send(updateUser);

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty("message", "User not found");
  });
});

describe("DELETE /user/:userId", () => {
  test("Delete a user successfully", async () => {
    const res = await request(app)
      .delete("/user/1")
      .set("Authorization", `Bearer ${accessTokenNakes}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("message", "User deleted");
  });

  test("Should return 401 if doesn't have access token/invalid token", async () => {
    const res = await request(app)
      .delete(`/user/1`)
      .set("Authorization", `Bearer ngaco`);

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty("message", "Invalid Token");
  });

  test("Should return 403 if role is unauthorized", async () => {
    const res = await request(app)
      .delete(`/user/1`)
      .set("Authorization", `Bearer ${accessTokenPasien}`);

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty(
      "message",
      "You are not authorized to do this action"
    );
  });

  test("Should return 404 if user not found", async () => {
    const res = await request(app)
      .delete(`/user/9999`)
      .set("Authorization", `Bearer ${accessTokenNakes}`);

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty("message", "User not found");
  });
});
