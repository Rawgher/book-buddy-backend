const axios = require("axios");
const bcrypt = require("bcrypt");
const { Pool } = require("pg");
const { BCRYPT_WORK_FACTOR } = require("./config");
require("dotenv").config();

const GOOGLE_BOOKS_API = "https://www.googleapis.com/books/v1/volumes";
const GOOGLE_BOOKS_API_KEY = process.env.GOOGLE_BOOKS_API_KEY 

// PostgreSQL connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || "postgresql:///book_buddy", 
});

async function seedDatabase() {
  try {
    await pool.query("BEGIN");

    // Clear existing data
    await pool.query("DELETE FROM saved_books");
    await pool.query("DELETE FROM users");

    // Generate 20 users
    const users = [];
    for (let i = 1; i <= 20; i++) {
      const hashedPassword = await bcrypt.hash("password", BCRYPT_WORK_FACTOR);
      const username = `user${i}`;
      const email = `user${i}@example.com`;
      const result = await pool.query(
        `INSERT INTO users (username, password, email)
         VALUES ($1, $2, $3)
         RETURNING id`,
        [username, hashedPassword, email]
      );
      users.push(result.rows[0].id);
    }

    // Query Google Books API for random books
    const bookResults = await axios.get(GOOGLE_BOOKS_API, {
      params: {
        q: "fiction",
        key: GOOGLE_BOOKS_API_KEY,
        maxResults: 40,
      },
    });
    const books = bookResults.data.items;

    // Associate random books with users
    for (const userId of users) {
      const numBooks = Math.floor(Math.random() * 5) + 1;
      for (let i = 0; i < numBooks; i++) {
        const randomBook = books[Math.floor(Math.random() * books.length)];
        const bookId = randomBook.id;
        const title = randomBook.volumeInfo.title || "Unknown Title";
        const authors = randomBook.volumeInfo.authors
          ? randomBook.volumeInfo.authors.join(", ")
          : "Unknown Author";
        const thumbnailUrl =
          randomBook.volumeInfo.imageLinks?.thumbnail || null;
        const comment = Math.random() > 0.5 ? "This is a great book!" : null; 

        await pool.query(
          `INSERT INTO saved_books (user_id, book_id, title, authors, thumbnail_url, comment)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [userId, bookId, title, authors, thumbnailUrl, comment]
        );
      }
    }

    await pool.query("COMMIT");
    console.log("Database seeded successfully!");
  } catch (err) {
    await pool.query("ROLLBACK");
    console.error("Error seeding database:", err);
  } finally {
    pool.end();
  }
}

seedDatabase();
