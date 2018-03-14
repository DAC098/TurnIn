\connect turnin

CREATE TYPE user_types AS ENUM ('master','admin','user');

CREATE TABLE users (
id          SERIAL PRIMARY KEY,
username    VARCHAR(25) NOT NULL UNIQUE,
password    VARCHAR NOT NULL,
email       VARCHAR UNIQUE,
salt        VARCHAR NOT NULL,
type        user_types NOT NULL,
is_student  BOOLEAN DEFAULT FALSE,
is_teacher  BOOLEAN DEFAULT FALSE,
fname       VARCHAR,
lname       VARCHAR,
permissions JSON
);