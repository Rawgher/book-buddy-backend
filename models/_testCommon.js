const bcrypt = require("bcrypt");
const db = require("../db.js");
const { BCRYPT_WORK_FACTOR } = require("../config");

async function commonBeforeAll() {
  // Clear all tables and reset IDs
  await db.query("TRUNCATE TABLE saved_books RESTART IDENTITY CASCADE");
  await db.query("TRUNCATE TABLE users RESTART IDENTITY CASCADE");

  // Insert sample users
  await db.query(`
    INSERT INTO users (username, password, email)
    VALUES ('u1', $1, 'u1@email.com'),
           ('u2', $2, 'u2@email.com')`,
    [
      await bcrypt.hash("password1", BCRYPT_WORK_FACTOR),
      await bcrypt.hash("password2", BCRYPT_WORK_FACTOR),
    ]);

  // Insert sample saved books for each user
  const userIds = await db.query("SELECT id FROM users ORDER BY id");
  const user1Id = userIds.rows[0].id;
  const user2Id = userIds.rows[1].id;

  await db.query(`
    INSERT INTO saved_books (user_id, book_id, title, authors, thumbnail_url, comment)
    VALUES 
      ($1, 'book1', 'Sample Book 1', 'Author 1', 'http://example.com/book1.jpg', 'Great book!'),
      ($2, 'book2', 'Sample Book 2', 'Author 2', 'http://example.com/book2.jpg', 'Great book!')`,
    [user1Id, user2Id]);
}


async function commonBeforeEach() {
  await db.query("BEGIN");
}

async function commonAfterEach() {
  await db.query("ROLLBACK");
}

async function commonAfterAll() {
  await db.end();
}

module.exports = {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
};