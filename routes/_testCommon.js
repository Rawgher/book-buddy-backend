"use strict";

const db = require("../db.js");
const User = require("../models/user");
const Book = require("../models/book");
const { createToken } = require("../helpers/tokens");

async function commonBeforeAll() {
  // Clear tables and reset IDs
  await db.query("TRUNCATE TABLE saved_books RESTART IDENTITY CASCADE");
  await db.query("TRUNCATE TABLE users RESTART IDENTITY CASCADE");

  // Create users
  const u1 = await User.register({
    username: "u1",
    email: "user1@user.com",
    password: "password1",
  });
  const u2 = await User.register({
    username: "u2",
    email: "user2@user.com",
    password: "password2",
  });
  await User.register({
    username: "u3",
    email: "user3@user.com",
    password: "password3",
  });

  // Add saved books for users
  await Book.add({
    userId: 1,
    bookId: 'book1',
    title: "Sample Book 1",
    authors: "Author 1",
    thumbnailUrl: "http://example.com/book1.jpg",
    comment: "Great book!",
  });

  await Book.add({
    userId: 2,
    bookId: 'book2',
    title: "Sample Book 2",
    authors: "Author 2",
    thumbnailUrl: "http://example.com/book2.jpg",
    comment: null,
  });
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

// Tokens for testing
const u1Token = createToken({ username: "u1" });
const u2Token = createToken({ username: "u2" });

module.exports = {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  u1Token,
  u2Token,
};
