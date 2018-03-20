\connect turnin

CREATE TABLE containers (
id          SERIAL PRIMARY KEY,
cont_owner  INTEGER NOT NULL,
cont_name   VARCHAR,
docker_id   VARCHAR UNIQUE, -- the generated docker id from creating the container
FOREIGN KEY (cont_owner) REFERENCES users(id)
);