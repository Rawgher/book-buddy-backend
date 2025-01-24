"use strict";

const request = require("supertest");
const app = require("../app");
const db = require("../db");
const { u1Token, u2Token, commonBeforeAll, commonBeforeEach, commonAfterEach, commonAfterAll } = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

describe("GET /users", function () {
  test("works for logged in user", async function () {
    const resp = await request(app)
      .get("/users")
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(200);
    expect(resp.body).toEqual({
      totalPages: 1,
      users: [
        { id: expect.any(Number), username: "u1", email: "user1@user.com",
          createdAt: expect.any(String) },
        { id: expect.any(Number), username: "u2", email: "user2@user.com",
          createdAt: expect.any(String) },
        { id: expect.any(Number), username: "u3", email: "user3@user.com",
          createdAt: expect.any(String) },
      ],
    });
  });

  test("unauth for non-logged in user", async function () {
    const resp = await request(app).get("/users");
    expect(resp.statusCode).toEqual(401);
  });
});

describe("GET /users/:username", function () {
  test("works for logged in user", async function () {
    const resp = await request(app)
      .get("/users/u1")
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(200);
    expect(resp.body).toEqual({
      user: {
        id: expect.any(Number),
        username: "u1",
        email: "user1@user.com",
        createdAt: expect.any(String),
        savedBooks: [
          {
            id: expect.any(Number),
            bookId: "book1",
            title: "Sample Book 1",
            authors: "Author 1",
            thumbnailUrl: "http://example.com/book1.jpg",
            comment: "Great book!",
            savedAt: expect.any(String),
          },
        ]
      }
    })
  });

  test("unauth for non-logged in user", async function () {
    const resp = await request(app).get("/users/u1");
    expect(resp.statusCode).toEqual(401);
  });
});