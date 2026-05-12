-- Admin: List all products
-- Run: psql -h 87.239.135.39 -d atelier -f database/adminQueries/products_list_all.sql
SELECT id, nombre, precio, imagen, descripcion, categoria, stock, created_at
FROM products ORDER BY id;