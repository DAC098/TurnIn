\connect turnin

CREATE TABLE students (
id      SERIAL PRIMARY KEY,
user_id INT NOT NULL,
fname   VARCHAR NOT NULL,
lname   VARCHAR NOT NULL,
FOREIGN KEY (user_id) REFERENCES users(id)
);