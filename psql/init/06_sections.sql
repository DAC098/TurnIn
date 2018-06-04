\connect turnin

CREATE TABLE sections (
id         SERIAL PRIMARY KEY,
title      VARCHAR NOT NULL,
num        INT NOT NULL,
year       INT NOT NULL,
semester   semesters NOT NULL,
teacher_id INT NOT NULL,
FOREIGN KEY (teacher_id) REFERENCES users(id),
CONSTRAINT unique_sections UNIQUE (num,year,semester)
);

CREATE TABLE sections_to_groups (
    group_name VARCHAR NOT NULL,
    section_id INT NOT NULL,
    CONSTRAINT group_section_pkey PRIMARY KEY(group_name,section_id),
    FOREIGN KEY (group_name) REFERENCES permission_groups(name),
    FOREIGN KEY (section_id) REFERENCES sections(id)
);