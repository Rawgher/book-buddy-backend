"use strict";

const db = require("../db");
const bcrypt = require("bcrypt");
const { sqlForPartialUpdate } = require("../helpers/sql");
const {
  NotFoundError,
  BadRequestError,
  UnauthorizedError,
} = require("../expressError");

const { BCRYPT_WORK_FACTOR } = require("../config.js");

/** Related functions for users. */

class User {
  /** Authenticate user with username and password.
   *
   * Returns { id, username, email, createdAt }
   *
   * Throws UnauthorizedError if user not found or wrong password.
   **/
  static async authenticate(username, password) {
    // Try to find the user first
    const result = await db.query(
      `SELECT id, 
              username,
              password,
              email
       FROM users
       WHERE username = $1`,
      [username]
    );

    const user = result.rows[0];

    if (user) {
      // Compare hashed password to a new hash from password
      const isValid = await bcrypt.compare(password, user.password);
      if (isValid) {
        delete user.password;
        return user;
      }
    }

    throw new UnauthorizedError("Invalid username/password");
  }

  /** Register user with data.
   *
   * Returns { id, username, email, createdAt }
   *
   * Throws BadRequestError on duplicates.
   **/
  static async register({ username, password, email }) {
    const duplicateCheck = await db.query(
      `SELECT username
       FROM users
       WHERE username = $1`,
      [username]
    );

    if (duplicateCheck.rows[0]) {
      throw new BadRequestError(`Duplicate username: ${username}`);
    }

    const hashedPassword = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);

    const result = await db.query(
      `INSERT INTO users
       (username, password, email)
       VALUES ($1, $2, $3)
       RETURNING id, username, email, created_at AS "createdAt"`,
      [username, hashedPassword, email]
    );

    return result.rows[0];
  }

  /** Find all users.
   *
   * Returns [{ id, username, email, createdAt }, ...]
   **/
  static async findAll(page = 1, limit = 8) {
    const offset = (page - 1) * limit;
  
    const usersRes = await db.query(
      `SELECT id,
              username,
              email,
              created_at AS "createdAt"
       FROM users
       ORDER BY username
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
  
    const totalRes = await db.query(`SELECT COUNT(*) AS total FROM users`);
    const totalUsers = parseInt(totalRes.rows[0].total);
  
    return {
      users: usersRes.rows,
      totalUsers,
      totalPages: Math.ceil(totalUsers / limit),
    };
  }

  /** Given a username, return data about user.
   *
   * Returns { id, username, email, createdAt }
   *
   * Throws NotFoundError if user not found.
   **/
  static async get(username) {
    const userRes = await db.query(
      `SELECT id,
              username,
              email,
              created_at AS "createdAt"
       FROM users
       WHERE username = $1`,
      [username]
    );
  
    const user = userRes.rows[0];
  
    if (!user) throw new NotFoundError(`No user: ${username}`);
  
    // Fetch saved books for the user
    const booksRes = await db.query(
      `SELECT id, 
              book_id AS "bookId", 
              title, 
              authors, 
              thumbnail_url AS "thumbnailUrl", 
              comment, 
              saved_at AS "savedAt"
       FROM saved_books
       WHERE user_id = $1`,
      [user.id]
    );
  
    user.savedBooks = booksRes.rows;
    return user;
  }

  /** Update user data with `data`.
   *
   * This is a "partial update" --- it's fine if data doesn't contain
   * all the fields; this only changes provided ones.
   *
   * Data can include:
   *   { username, email, password }
   *
   * Returns { id, username, email, createdAt }
   *
   * Throws NotFoundError if not found.
   **/
  static async update(username, data) {
    if (data.password) {
      data.password = await bcrypt.hash(data.password, BCRYPT_WORK_FACTOR);
    }

    const { setCols, values } = sqlForPartialUpdate(data, {});
    const usernameVarIdx = "$" + (values.length + 1);

    const querySql = `UPDATE users 
                      SET ${setCols} 
                      WHERE username = ${usernameVarIdx} 
                      RETURNING id,
                                username,
                                email,
                                created_at AS "createdAt"`;
    const result = await db.query(querySql, [...values, username]);
    const user = result.rows[0];

    if (!user) throw new NotFoundError(`No user: ${username}`);

    return user;
  }

  /** Delete given user from database; returns undefined. */
  static async remove(username) {
    const result = await db.query(
      `DELETE
       FROM users
       WHERE username = $1
       RETURNING username`,
      [username]
    );
    const user = result.rows[0];

    if (!user) throw new NotFoundError(`No user: ${username}`);
  }
}

module.exports = User;
