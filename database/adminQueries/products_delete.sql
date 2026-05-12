-- Admin: Delete a product by id
-- Edit id as needed, then run:
-- psql -h 87.239.135.39 -d atelier -f database/adminQueries/products_delete.sql
DELETE FROM products WHERE id = $1;