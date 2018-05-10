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