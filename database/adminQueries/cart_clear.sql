-- Admin: Clear all items from a user's cart
-- Run: psql -h 87.239.135.39 -d atelier -v uid='...' -f database/adminQueries/cart_clear.sql
DELETE FROM cart_items WHERE user_id = '${uid}';