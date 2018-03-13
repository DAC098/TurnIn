\connect turnin

CREATE TABLE assignments (
id         SERIAL PRIMARY KEY,
title      VARCHAR NOT NULL,
section_id INT NOT NULL,
FOREIGN KEY (section_id) REFERENCES sections(id)
);