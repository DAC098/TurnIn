\connect turnin

CREATE TABLE assignments (
id                  SERIAL PRIMARY KEY,
title               VARCHAR NOT NULL,
section_id          INT NOT NULL,
description         VARCHAR,
points              INT DEFAULT 0,
open_date           TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
close_date          TIMESTAMPTZ DEFAULT NULL,
allow_custom_images BOOLEAN DEFAULT FALSE,
FOREIGN KEY (section_id) REFERENCES sections(id),
CONSTRAINT unique_title_section UNIQUE(title,section_id)
);