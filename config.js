require("dotenv").config();
require("colors");

const SECRET_KEY = process.env.SECRET_KEY;

const PORT = +process.env.PORT;

function getDatabaseUri() {
  const dbName = process.env.NODE_ENV === "test" ? process.env.TEST_DATABASE_URL : process.env.DATABASE_URL;
  return dbName;
}

const BCRYPT_WORK_FACTOR = process.env.NODE_ENV === "test" ? 1 : 12;

module.exports = {
  SECRET_KEY,
  PORT,
  BCRYPT_WORK_FACTOR,
  getDatabaseUri,
};