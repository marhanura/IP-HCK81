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
  await sequelize.queryInterface.bulkInsert("Users", users);
  await sequelize.queryInterface.bulkInsert("Drugs", drugs);
  const nakes = await User.findOne({ where: { role: "tenaga kesehatan" } });
  accessTokenNakes = signToken({ id: nakes.id });
  const pasien = await User.findOne({ where: { role: "pasien" } });
  accessTokenPasien = signToken({ id: pasien.id });
});

afterAll(async () => {
  await User.destroy({
    truncate: true,
    restartIdentity: true,
    cascade: true,
  });
  await Drug.destroy({
    truncate: true,
    restartIdentity: true,
    cascade: true,
  });
});

describe("POST /register", () => {
  test("Successfully register a new user", async () => {
    const newUser = {
      username: "test123",
      email: "test@mail.com",
      password: "test123",
    };

    const res = await request(app).post("/register").send(newUser);

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("username", newUser.username);
    expect(res.body).toHaveProperty("email", newUser.email);
  });

  // test("should return 400 if input is invalid", async () => {
  //   User.create.mockResolvedValue(null);

  //   const res = await request(app).post("/register").send({});

  //   expect(res.status).toBe(400);
  //   expect(res.body.message).toBe("Please check your input");
  // });
});
