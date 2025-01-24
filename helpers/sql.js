const { BadRequestError } = require("../expressError");

/**
 * Helper for making selective update queries.
 *
 * The calling function can use it to make the SET clause of an SQL UPDATE
 * statement.
 *
 * @param dataToUpdate {Object} {field1: newVal, field2: newVal, ...}
 * @param jsToSql {Object} maps js-style data fields to database column names,
 *   like { username: "username", email: "email" }
 *
 * @returns {Object} { setCols, values }
 *
 * @example {username: 'newuser', email: 'newemail@example.com'} =>
 *   { setCols: '"username"=$1, "email"=$2',
 *     values: ['newuser', 'newemail@example.com'] }
 */
function sqlForPartialUpdate(dataToUpdate, jsToSql) {
  const keys = Object.keys(dataToUpdate);
  if (keys.length === 0) throw new BadRequestError("No data");

  // Map keys to column names in SQL, using parameterized query placeholders
  const cols = keys.map((colName, idx) =>
    `"${jsToSql[colName] || colName}"=$${idx + 1}`
  );

  return {
    setCols: cols.join(", "), // Generate the SET clause
    values: Object.values(dataToUpdate), // Extract the values to be updated
  };
}

module.exports = { sqlForPartialUpdate };