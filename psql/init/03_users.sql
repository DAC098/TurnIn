\connect turnin

CREATE TABLE users (
id          SERIAL PRIMARY KEY,
username    VARCHAR(25) NOT NULL UNIQUE,
password    VARCHAR NOT NULL,
email       VARCHAR UNIQUE,
salt        VARCHAR NOT NULL,
type        user_types NOT NULL,
elevation   INT DEFAULT 0 CHECK (elevation >= 0 and elevation <= 10),
fname       VARCHAR,
lname       VARCHAR,
permissions JSON
);