"use strict";

/** Routes for users. */

const express = require("express");
const jsonschema = require("jsonschema");
const { ensureLoggedIn, ensureCorrectUser } = require("../middleware/auth");
const { BadRequestError } = require("../expressError");
const User = require("../models/user");
const userUpdateSchema = require("../schemas/userUpdate.json");

const router = express.Router();

/** GET / => { users: [ { username, email }, ... ] }
 *
 * Returns a list of all users.
 *
 * Authorization required: logged in
 */
router.get("/", ensureLoggedIn, async function (req, res, next) {
  try {
    const { page = 1, limit = 8 } = req.query;

    // Call the `findAll` method in the User model
    const { users, totalPages } = await User.findAll(page, limit);

    return res.json({ users, totalPages });
  } catch (err) {
    return next(err);
  }
});

/** GET /:username => { user }
 *
 * Returns details about a specific user, including their saved books.
 *
 * Authorization required: logged in
 */
router.get("/:username", ensureLoggedIn, async function (req, res, next) {
  try {
    const user = await User.get(req.params.username);
    return res.json({ user });
  } catch (err) {
    return next(err);
  }
});

/** PATCH /:username { user } => { user }
 *
 * Updates a user's data. Only the user themselves can update their data.
 *
 * Authorization required: correct user
 */
router.patch("/:username", ensureCorrectUser, async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, userUpdateSchema);
    if (!validator.valid) {
      const errs = validator.errors.map((e) => e.stack);
      throw new BadRequestError(errs);
    }

    const user = await User.update(req.params.username, req.body);
    return res.json({ user });
  } catch (err) {
    return next(err);
  }
});

/** DELETE /:username => { deleted: username }
 *
 * Deletes a user. Only the user themselves can delete their account.
 *
 * Authorization required: correct user
 */
router.delete("/:username", ensureCorrectUser, async function (req, res, next) {
  try {
    await User.remove(req.params.username);
    return res.json({ deleted: req.params.username });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
