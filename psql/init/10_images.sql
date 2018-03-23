\connect turnin

CREATE TYPE image_types AS ENUM ('custom','hub','remote');
CREATE TYPE image_statuses AS ENUM ('created','running','removed','error');

CREATE TABLE images (
id           SERIAL PRIMARY KEY,
image_owner  INTEGER NOT NULL,
image_name   VARCHAR NOT NULL,
docker_id    VARCHAR UNIQUE, -- the generated docker id from the image completing its build
options      JSON,
image_type   image_types NOT NULL,
image_status image_statuses,
image_exists BOOLEAN,
dockerfile   BOOLEAN,
image_url    VARCHAR,
FOREIGN KEY (image_owner) REFERENCES users(id)
);