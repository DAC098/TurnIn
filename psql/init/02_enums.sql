\connect turnin

CREATE TYPE user_types AS ENUM ('master','user');

CREATE TYPE semesters AS ENUM ('spring','summer','fall','winter');

CREATE TYPE image_types AS ENUM ('custom','hub','remote');
CREATE TYPE image_statuses AS ENUM ('created','ready','running','removed','error');

CREATE TYPE group_reference_tables AS ENUM ('sections','images','containers','assignments');

