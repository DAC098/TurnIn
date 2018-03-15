\connect turnin

CREATE TABLE enrolled (
student_id INT NOT NULL,
section_id INT NOT NULL,
CONSTRAINT pk_enrolled PRIMARY KEY (student_id,section_id),
FOREIGN KEY (student_id) REFERENCES users(id),
FOREIGN KEY (section_id) REFERENCES sections(id)
);