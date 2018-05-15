\connect turnin;

CREATE TABLE permission_groups (
name        VARCHAR PRIMARY KEY,
permissions JSON,
elevation   INT DEFAULT 0 CHECK (elevation >= 0 and elevation <= 10)
);

CREATE TABLE group_references (
group_name VARCHAR NOT NULL,
table_id   INT NOT NULL,
table_name VARCHAR NOT NULL,
CONSTRAINT pk_group_record_references PRIMARY KEY (group_name,table_id,table_name),
FOREIGN KEY (group_name) REFERENCES permission_groups(name)
);

CREATE TABLE user_references (
user_id    INT NOT NULL,
table_id   INT NOT NULL,
table_name VARCHAR NOT NULL,
CONSTRAINT pk_user_record_references PRIMARY KEY (user_id,table_id,table_name),
FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE group_members (
group_name    VARCHAR NOT NULL,
user_id       INT NOT NULL,
primary_group BOOLEAN DEFAULT FALSE,
CONSTRAINT pk_group_members PRIMARY KEY (group_name,user_id),
FOREIGN KEY (group_name) REFERENCES permission_groups(name),
FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE FUNCTION delete_group_reference_for_table()
    RETURNS trigger AS $$
BEGIN
    delete from group_references
    where table_id = OLD.id and table_name = TG_ARGV[0]::VARCHAR;
    RETURN NULL;
END
$$ LANGUAGE plpgsql;

CREATE FUNCTION delete_user_reference_for_table()
    RETURNS trigger AS $$
BEGIN
    delete from user_references
    where table_id = OLD.id and table_name = TG_ARGV[0]::VARCHAR;
    RETURN NULL;
END
$$ LANGUAGE plpgsql;