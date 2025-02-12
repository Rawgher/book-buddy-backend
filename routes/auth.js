"use strict";

/** Routes for authentication. */

const jsonschema = require("jsonschema");
const express = require("express");
const User = require("../models/user");
const router = new express.Router();
const { createToken } = require("../helpers/tokens");
const userAuthSchema = require("../schemas/userAuth.json");
const userRegisterSchema = require("../schemas/userRegister.json");
const { BadRequestError } = require("../expressError");

/** POST /auth/token:  { username, password } => { token }
 *
 * Returns JWT token which can be used to authenticate further requests.
 *
 * Authorization required: none
 */
router.post("/token", async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, userAuthSchema);
    if (!validator.valid) {
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    }

    const { username, password } = req.body;
    const user = await User.authenticate(username, password);
    const token = createToken(user);
    return res.json({ token });
  } catch (err) {
    return next(err);
  }
});

/** POST /auth/register:   { username, password, email } => { token }
 *
 * Registers a new user.
 *
 * Returns JWT token which can be used to authenticate further requests.
 *
 * Authorization required: none
 */
router.post("/register", async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, userRegisterSchema);
    if (!validator.valid) {
      const errs = validator.errors.map((e) => {
        const field = e.path[0];
        let message;
        if (field === "email") {
          message = "Please enter a valid email address.";
        } else if (field === "password") {
          message = "Password must be at least 8 characters long.";
        } else {
          message = e.stack;
        }
        return { field, message };
      });
      throw new BadRequestError(errs);
    }

    const newUser = await User.register(req.body);
    const token = createToken(newUser);
    return res.status(201).json({ token });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
