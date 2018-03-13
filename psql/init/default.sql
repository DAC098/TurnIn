create user turnin;

create database turnin;

grant all privileges on database turnin to turnin;

alter user turnin with password 'turnin_password';

create table images (
id          SERIAL PRIMARY KEY,
image_name  VARCHAR
docker_id   VARCHAR UNIQUE,
options     JSON,
dockerfile  VARCHAR,
)