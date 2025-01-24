"use strict";

const {
  NotFoundError,
  BadRequestError,
  UnauthorizedError,
} = require("../expressError");
const db = require("../db.js");
const User = require("./user.js");
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** authenticate */

describe("authenticate", function () {
  test("works", async function () {
    const user = await User.authenticate("u1", "password1");
    expect(user).toEqual({
      id: expect.any(Number),
      username: "u1",
      email: "u1@email.com",
    });
  });

  test("unauth if no such user", async function () {
    try {
      await User.authenticate("nope", "password");
      fail();
    } catch (err) {
      expect(err instanceof UnauthorizedError).toBeTruthy();
    }
  });

  test("unauth if wrong password", async function () {
    try {
      await User.authenticate("u1", "wrong");
      fail();
    } catch (err) {
      expect(err instanceof UnauthorizedError).toBeTruthy();
    }
  });
});

/************************************** register */

describe("register", function () {
  const newUser = {
    username: "new",
    email: "test@test.com",
  };

  test("works", async function () {
    let user = await User.register({
      ...newUser,
      password: "password",
    });
    expect(user).toEqual({
      id: expect.any(Number),
      username: "new",
      email: "test@test.com",
      createdAt: expect.any(Date),
    });
    const found = await db.query("SELECT * FROM users WHERE username = 'new'");
    expect(found.rows.length).toEqual(1);
    expect(found.rows[0].password.startsWith("$2b$")).toEqual(true);
  });

  test("bad request with dup data", async function () {
    try {
      await User.register({
        ...newUser,
        password: "password",
      });
      await User.register({
        ...newUser,
        password: "password",
      });
      fail();
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});

/************************************** findAll */

describe("findAll", function () {
  test("works", async function () {
    const result = await User.findAll();
    const { users, totalPages, totalUsers } = result;

    // Validate the users array
    expect(users).toEqual([
      {
        id: expect.any(Number),
        username: "u1",
        email: "u1@email.com",
        createdAt: expect.any(Date),
      },
      {
        id: expect.any(Number),
        username: "u2",
        email: "u2@email.com",
        createdAt: expect.any(Date),
      },
    ]);

    // Validate totalPages and totalUsers
    expect(totalPages).toEqual(expect.any(Number));
    expect(totalUsers).toEqual(expect.any(Number));
  });
});

/************************************** update */

describe("update", function () {
  const updateData = {
    username: "updatedUser",
    email: "updated@email.com",
  };

  test("works", async function () {
    let user = await User.update("u1", updateData);
    expect(user).toEqual({
      id: expect.any(Number),
      username: "updatedUser",
      email: "updated@email.com",
      createdAt: expect.any(Date),
    });
  });

  test("works: set password", async function () {
    let user = await User.update("u1", {
      password: "newpassword",
    });
    expect(user).toEqual({
      id: expect.any(Number),
      username: "u1",
      email: "u1@email.com",
      createdAt: expect.any(Date),
    });
    const found = await db.query("SELECT * FROM users WHERE username = 'u1'");
    expect(found.rows[0].password.startsWith("$2b$")).toEqual(true);
  });

  test("not found if no such user", async function () {
    try {
      await User.update("nope", {
        username: "test",
      });
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });

  test("bad request if no data", async function () {
    try {
      await User.update("u1", {});
      fail();
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});

/************************************** remove */

describe("remove", function () {
  test("works", async function () {
    await User.remove("u1");
    const res = await db.query("SELECT * FROM users WHERE username='u1'");
    expect(res.rows.length).toEqual(0);
  });

  test("not found if no such user", async function () {
    try {
      await User.remove("nope");
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});
