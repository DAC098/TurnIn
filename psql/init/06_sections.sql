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

CREATE TRIGGER check_group_reference_for_section
    AFTER DELETE ON sections
    FOR EACH ROW
    EXECUTE PROCEDURE delete_group_reference_for_table('sections');

CREATE TRIGGER check_user_reference_for_section
    AFTER DELETE ON sections
    FOR EACH ROW
    EXECUTE PROCEDURE delete_user_reference_for_table('sections');