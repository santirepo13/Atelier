-- Admin: Delete a user profile (and cascade cart + orders)
-- Run: psql -h 87.239.135.39 -d atelier -v uid='...' -f database/adminQueries/users_delete.sql
DELETE FROM users WHERE uid = '${uid}';