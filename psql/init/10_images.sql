\connect turnin

CREATE TYPE image_types AS ENUM ('custom','hub');

CREATE TABLE images (
id          SERIAL PRIMARY KEY,
image_owner INTEGER NOT NULL,
image_name  VARCHAR,
docker_id   VARCHAR UNIQUE,
options     JSON,
image_type  image_types NOT NULL,
dockerfile  VARCHAR,
image_url   VARCHAR,
FOREIGN KEY (image_owner) REFERENCES users(id)
);