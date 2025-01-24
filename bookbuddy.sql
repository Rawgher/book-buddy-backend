\echo 'Delete and recreate book_buddy db?'
\prompt 'Return for yes or control-C to cancel > ' foo

DROP DATABASE book_buddy;
CREATE DATABASE book_buddy;
\connect book_buddy

\i book-buddy-schema.sql

\echo 'Delete and recreate book_buddy_test db?'
\prompt 'Return for yes or control-C to cancel > ' foo

DROP DATABASE book_buddy_test;
CREATE DATABASE book_buddy_test;
\connect book_buddy_test

\i book-buddy-schema.sql