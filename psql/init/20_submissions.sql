\connect turnin

CREATE TABLE submissions (
id             SERIAL PRIMARY KEY,
users_id       INT NOT NULL,
assignment_id  INT NOT NULL,
image_id       INT NOT NULL,
past_due       BOOL DEFAULT FALSE,
sub_date       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
options        JSON,
comment        VARCHAR,
grader_comment VARCHAR,
points         INT,
FOREIGN KEY (users_id) REFERENCES users(id),
FOREIGN KEY (assignment_id) REFERENCES assignments(id),
FOREIGN KEY (image_id) REFERENCES images(id)
);

CREATE TABLE submitted_files (
filename      VARCHAR NOT NULL,
submission_id INT NOT NULL,
CONSTRAINT unique_files_for_submission UNIQUE (filename,submission_id),
FOREIGN KEY (submission_id) REFERENCES submissions(id)
);
