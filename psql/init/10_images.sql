\connect turnin

CREATE TYPE image_types AS ENUM ('custom','hub');
CREATE TYPE image_statuses AS ENUM ('created','running','removed','error');

CREATE TABLE images (
id           SERIAL PRIMARY KEY,
image_owner  INTEGER NOT NULL,
image_name   VARCHAR,
docker_id    VARCHAR UNIQUE,
options      JSON,
image_type   image_types NOT NULL,
image_status image_statuses,
dockerfile   VARCHAR,
image_url    VARCHAR,
FOREIGN KEY (image_owner) REFERENCES users(id)
);