\connect turnin;

CREATE TABLE permission_groups (
name        VARCHAR PRIMARY KEY,
permissions JSON,
elevation   INT DEFAULT 0 CHECK (elevation >= 0 and elevation <= 10)
);

CREATE TABLE group_references (
group_name VARCHAR NOT NULL,
table_id   INT NOT NULL,
table_name group_referecne_Tables NOT NULL
);

CREATE TABLE group_members (
group_name    VARCHAR NOT NULL,
user_id       INT NOT NULL,
primary_group BOOLEAN DEFAULT FALSE,
CONSTRAINT pk_group_members PRIMARY KEY (group_name,user_id),
FOREIGN KEY (group_name) REFERENCES permission_groups(name),
FOREIGN KEY (user_id) REFERENCES users(id)
);