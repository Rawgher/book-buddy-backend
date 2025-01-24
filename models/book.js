"use strict";

const db = require("../db");
const { NotFoundError, BadRequestError } = require("../expressError");

/** Related functions for saved books. */

class Book {
  /** Add a book to the saved_books table.
   *
   * Returns { id, userId, bookId, title, authors, thumbnailUrl, savedAt, comment }
   *
   * Throws BadRequestError on duplicates.
   **/
  static async add({ userId, bookId, title, authors, thumbnailUrl, comment = null }) {
    // Check for duplicate entries
    const duplicateCheck = await db.query(
      `SELECT id
       FROM saved_books
       WHERE user_id = $1 AND book_id = $2`,
      [userId, bookId]
    );

    if (duplicateCheck.rows[0]) {
      throw new BadRequestError(`Book already saved by user.`);
    }

    const result = await db.query(
      `INSERT INTO saved_books (user_id, book_id, title, authors, thumbnail_url, comment)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, user_id AS "userId", book_id AS "bookId", title, authors, 
                 thumbnail_url AS "thumbnailUrl", saved_at AS "savedAt", comment`,
      [userId, bookId, title, authors, thumbnailUrl, comment]
    );

    return result.rows[0];
  }

  /** Find all books saved by a user.
   *
   * Returns [{ id, userId, bookId, title, authors, thumbnailUrl, savedAt, comment }, ...]
   **/
  static async findAllByUser(userId) {
    const result = await db.query(
      `SELECT id, 
              user_id AS "userId", 
              book_id AS "bookId", 
              title, 
              authors, 
              thumbnail_url AS "thumbnailUrl", 
              saved_at AS "savedAt", 
              comment
       FROM saved_books
       WHERE user_id = $1
       ORDER BY saved_at DESC`,
      [userId]
    );

    return result.rows;
  }

  /** Get a specific saved book by its ID.
   *
   * Returns { id, userId, bookId, title, authors, thumbnailUrl, savedAt, comment }
   *
   * Throws NotFoundError if book not found.
   **/
  static async get(id) {
    const result = await db.query(
      `SELECT id, 
              user_id AS "userId", 
              book_id AS "bookId", 
              title, 
              authors, 
              thumbnail_url AS "thumbnailUrl", 
              saved_at AS "savedAt", 
              comment
       FROM saved_books
       WHERE id = $1`,
      [id]
    );

    const book = result.rows[0];

    if (!book) throw new NotFoundError(`No book found with ID: ${id}`);

    return book;
  }

  /** Fetch all books saved by a user.
 *
 * Returns [{ bookId, title, authors, thumbnailUrl }, ...]
 */
  static async getSavedBooks(userId) {
    const result = await db.query(
      `SELECT book_id AS "bookId",
              title,
              authors,
              thumbnail_url AS "thumbnailUrl"
      FROM saved_books
      WHERE user_id = $1
      ORDER BY saved_at DESC`,
      [userId]
    );

    return result.rows;
  }

  /** Add or update a comment for a saved book.
   *
   * Returns { id, userId, bookId, comment }
   *
   * Throws NotFoundError if book not found.
   **/
  static async addOrUpdateComment(bookId, userId, comment) {
    const result = await db.query(
      `UPDATE saved_books
       SET comment = $1
       WHERE book_id = $2 AND user_id = $3
       RETURNING id, user_id AS "userId", book_id AS "bookId", comment`,
      [comment, bookId, userId]
    );

    const updatedBook = result.rows[0];

    if (!updatedBook) throw new NotFoundError(`No book found for user with ID: ${userId}`);

    return updatedBook;
  }

  /** Remove a saved book by its ID.
   *
   * Returns undefined.
   *
   * Throws NotFoundError if book not found.
   **/
  static async remove(bookId, userId) {
    const result = await db.query(
      `DELETE FROM saved_books
       WHERE book_id = $1 AND user_id = $2
       RETURNING book_id`,
      [bookId, userId]
    );
  
    if (!result.rows.length) throw new NotFoundError(`No book: ${bookId}`);
  }
}

module.exports = Book;
