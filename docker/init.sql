DROP USER IF EXISTS 'iranplaz';
CREATE USER 'iranplaz'@'%' IDENTIFIED BY 'iranplaz';
CREATE DATABASE IF NOT EXISTS ip_development;
GRANT ALL ON ip_development.* TO 'iranplaz'@'%';
# CREATE TABLE ip_development.'schema_migrations' ( 'version' varchar(255) NOT NULL, PRIMARY KEY ('version') ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
# INSERT INTO ip_development.'schema_migrations' VALUES ('20231113000000');