\connect turnin

CREATE TABLE assignments (
id                  SERIAL PRIMARY KEY,
title               VARCHAR NOT NULL,
section_id          INT NOT NULL,
description         VARCHAR,
points              INT DEFAULT 0,
open_date           TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
close_date          TIMESTAMPTZ DEFAULT NULL,
options             JSON,
allow_custom_images BOOLEAN DEFAULT FALSE,
FOREIGN KEY (section_id) REFERENCES sections(id),
CONSTRAINT unique_title_section UNIQUE(title,section_id)
);

CREATE TABLE assignments_to_groups (
    group_name    VARCHAR NOT NULL,
    assignment_id INT NOT NULL,
    CONSTRAINT group_assignment_pkey PRIMARY KEY(group_name,assignment_id),
    FOREIGN KEY (group_name) REFERENCES permission_groups(name),
    FOREIGN KEY (assignment_id) REFERENCES assignments(id)
);

CREATE TABLE assignment_files (
filename      VARCHAR NOT NULL,
assignment_id INT NOT NULL,
FOREIGN KEY (assignment_id) REFERENCES assignments(id),
CONSTRAINT assignment_filename_pk PRIMARY KEY (filename,assignment_id)
);

CREATE TABLE assignment_images (
image_id      INT NOT NULL,
assignment_id INT NOT NULL,
FOREIGN KEY (image_id) REFERENCES images(id),
FOREIGN KEY (assignment_id) REFERENCES assignments(id),
CONSTRAINT image_assignment_pk PRIMARY KEY (image_id,assignment_id)
);