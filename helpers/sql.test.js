const { sqlForPartialUpdate } = require("./sql");

describe("sqlForPartialUpdate", function () {
  test("works: 1 item", function () {
    const result = sqlForPartialUpdate(
      { username: "newuser" },
      { username: "username", email: "email" }
    );
    expect(result).toEqual({
      setCols: "\"username\"=$1",
      values: ["newuser"],
    });
  });

  test("works: 2 items", function () {
    const result = sqlForPartialUpdate(
      { username: "newuser", email: "newemail@example.com" },
      { username: "username", email: "email" }
    );
    expect(result).toEqual({
      setCols: "\"username\"=$1, \"email\"=$2",
      values: ["newuser", "newemail@example.com"],
    });
  });

  test("works: saved_books with comment", function () {
    const result = sqlForPartialUpdate(
      { comment: "Great book!" },
      { comment: "comment" }
    );
    expect(result).toEqual({
      setCols: "\"comment\"=$1",
      values: ["Great book!"],
    });
  });

  test("works: multiple fields in saved_books", function () {
    const result = sqlForPartialUpdate(
      { title: "Updated Title", comment: "Loved it!" },
      { title: "title", comment: "comment" }
    );
    expect(result).toEqual({
      setCols: "\"title\"=$1, \"comment\"=$2",
      values: ["Updated Title", "Loved it!"],
    });
  });

  test("throws BadRequestError if no data", function () {
    try {
      sqlForPartialUpdate({}, { username: "username" });
      fail();
    } catch (err) {
      expect(err.message).toEqual("No data");
    }
  });
});
