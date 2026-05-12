-- Admin: Insert a user profile
-- Run:
-- psql -h 87.239.135.39 -d atelier -v uid='...' -v username='...' -v email='...' -v clave_tipo=1 -v clave_respuesta='...' -f database/adminQueries/users_insert.sql
INSERT INTO users (uid, username, email, clave_tipo, clave_respuesta)
VALUES ('${uid}', '${username}', '${email}', ${clave_tipo}, '${clave_respuesta}');