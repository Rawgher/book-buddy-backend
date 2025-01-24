"use strict";

const request = require("supertest");
const app = require("../app");
const db = require("../db");
const User = require("../models/user");
const { commonBeforeAll, commonBeforeEach, commonAfterEach, commonAfterAll } = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

describe("POST /auth/token", function () {
  test("works", async function () {
    const resp = await request(app)
      .post("/auth/token")
      .send({ username: "u1", password: "password1" });
    expect(resp.statusCode).toEqual(200);
    expect(resp.body).toEqual({
      token: expect.any(String),
    });
  });

  test("unauth with non-existent user", async function () {
    const resp = await request(app)
      .post("/auth/token")
      .send({ username: "nope", password: "password" });
    expect(resp.statusCode).toEqual(401);
  });

  test("unauth with wrong password", async function () {
    const resp = await request(app)
      .post("/auth/token")
      .send({ username: "u1", password: "wrong" });
    expect(resp.statusCode).toEqual(401);
  });
});

describe("POST /auth/register", function () {
  test("works for valid data", async function () {
    const resp = await request(app)
      .post("/auth/register")
      .send({
        username: "newuser",
        password: "password",
        email: "newuser@example.com",
      });
    expect(resp.statusCode).toEqual(201);
    expect(resp.body).toEqual({
      token: expect.any(String),
    });
  });

  test("bad request with missing fields", async function () {
    const resp = await request(app)
      .post("/auth/register")
      .send({ username: "newuser" });
    expect(resp.statusCode).toEqual(400);
  });

  test("bad request with invalid data", async function () {
    const resp = await request(app)
      .post("/auth/register")
      .send({
        username: "newuser",
        password: "password",
        email: "not-an-email",
      });
    expect(resp.statusCode).toEqual(400);
  });
});
