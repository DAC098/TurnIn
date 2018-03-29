\connect turnin

CREATE TABLE enrolled (
users_id   INT NOT NULL,
section_id INT NOT NULL,
CONSTRAINT pk_enrolled PRIMARY KEY (users_id,section_id),
FOREIGN KEY (users_id) REFERENCES users(id),
FOREIGN KEY (section_id) REFERENCES sections(id)
);