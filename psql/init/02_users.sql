\connect turnin

CREATE TYPE user_types AS ENUM ('master','admin','user');

CREATE TABLE users (
id          SERIAL PRIMARY KEY,
username    VARCHAR(25) NOT NULL UNIQUE,
password    VARCHAR NOT NULL,
email       VARCHAR,
salt        VARCHAR NOT NULL,
type        user_types NOT NULL,
permissions JSON
);