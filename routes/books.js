"use strict";

/** Routes for books. */

const express = require("express");
const jsonschema = require("jsonschema");
const { ensureLoggedIn } = require("../middleware/auth");
const { BadRequestError } = require("../expressError");
const Book = require("../models/book");
const bookAddSchema = require("../schemas/bookAdd.json");
const commentUpdateSchema = require("../schemas/commentUpdate.json");

const router = express.Router();

/** POST / { book } => { book }
 *
 * Adds a new book to the saved_books table for the logged-in user.
 *
 * Authorization required: logged in
 **/

router.post("/", ensureLoggedIn, async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, bookAddSchema);
    if (!validator.valid) {
      const errs = validator.errors.map((e) => e.stack);
      throw new BadRequestError(errs);
    }
    console.log(res.locals.user)

    const book = await Book.add({
      userId: res.locals.user.id,
      bookId: req.body.book_id,
      title: req.body.title,
      authors: req.body.authors,
      thumbnailUrl: req.body.thumbnail_url,
      comment: req.body.comment,
    });
    return res.status(201).json({ book });
  } catch (err) {
    return next(err);
  }
});

/** PATCH /:id/comment { comment } => { book }
 *
 * Updates the comment for a saved book1.
 *
 * Authorization required: logged in
 **/

router.patch("/:id/comment", ensureLoggedIn, async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, commentUpdateSchema);
    if (!validator.valid) {
      const errs = validator.errors.map((e) => e.stack);
      throw new BadRequestError(errs);
    }

    const updatedBook = await Book.addOrUpdateComment(
      req.params.id,
      res.locals.user.id,
      req.body.comment
    );
    return res.json({ updatedBook });
  } catch (err) {
    return next(err);
  }
});

/** GET /search?q=searchTerm => { books }
 *
 * Searches for books via the Google Books API.
 *
 * Authorization required: logged in
 **/

router.get("/search", ensureLoggedIn, async function (req, res, next) {
  try {
    const searchTerm = req.query.q;
    if (!searchTerm) {
      throw new BadRequestError("Search term is required.");
    }

    const books = []; 
    return res.json({ books });
  } catch (err) {
    return next(err);
  }
});

/** GET /books/saved => { books: [ { bookId, title, authors, thumbnailUrl }, ... ] }
 *
 * Fetch all books saved by the currently logged-in user.
 *
 * Authorization required: logged in
 */
router.get("/saved", ensureLoggedIn, async function (req, res, next) {
  try {
    const books = await Book.getSavedBooks(res.locals.user.id);
    return res.json({ books });
  } catch (err) {
    return next(err);
  }
});

/** DELETE /:bookId => { deleted: id }
 *
 * Deletes a saved book.
 *
 * Authorization required: logged in
 **/

router.delete("/:bookId", ensureLoggedIn, async function (req, res, next) {
  try {
    await Book.remove(req.params.bookId, res.locals.user.id);
    return res.json({ deleted: req.params.bookId });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
