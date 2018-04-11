\connect turnin

CREATE TABLE submissions (
id            SERIAL PRIMARY KEY,
users_id      INT NOT NULL,
assignment_id INT NOT NULL,
image_id      INT NOT NULL,
past_due      BOOL DEFAULT FALSE,
sub_date      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
options       JSON,
comment       VARCHAR,
FOREIGN KEY (users_id) REFERENCES users(id),
FOREIGN KEY (assignment_id) REFERENCES assignments(id),
FOREIGN KEY (image_id) REFERENCES images(id)
);
