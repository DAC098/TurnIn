\connect turnin

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

CREATE TABLE images_to_groups (
    group_name VARCHAR NOT NULL,
    image_id   INT NOT NULL,
    CONSTRAINT group_image_pkey PRIMARY KEY(group_name,image_id),
    FOREIGN KEY (group_name) REFERENCES permission_groups(name),
    FOREIGN KEY (image_id) REFERENCES images(id)
);