-- Admin: Update a user profile
-- Run:
-- psql -h 87.239.135.39 -d atelier -v uid='...' -v username='...' -f database/adminQueries/users_update.sql
UPDATE users SET username = '${username}' WHERE uid = '${uid}';