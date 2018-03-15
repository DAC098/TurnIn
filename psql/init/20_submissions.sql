\connect turnin

CREATE TABLE submissions (
id            SERIAL PRIMARY KEY,
student_id    INT NOT NULL,
assignment_id INT NOT NULL,
past_due      BOOL DEFAULT FALSE,
sub_date      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
CONSTRAINT unique_assignments UNIQUE (student_id),
FOREIGN KEY (student_id) REFERENCES users(id),
FOREIGN KEY (assignment_id) REFERENCES assignments(id)
);
