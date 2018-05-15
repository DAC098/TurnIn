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

CREATE TRIGGER check_group_reference_for_image
    AFTER DELETE ON images
    FOR EACH ROW
    EXECUTE PROCEDURE delete_group_reference_for_table('images');

CREATE TRIGGER check_user_reference_for_image
    AFTER DELETE ON images
    FOR EACH ROW
    EXECUTE PROCEDURE delete_user_reference_for_table('images');