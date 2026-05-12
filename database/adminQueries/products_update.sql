-- Admin: Update a product by id
-- Edit values as needed, then run:
-- psql -h 87.239.135.39 -d atelier -f database/adminQueries/products_update.sql
UPDATE products
SET nombre = $1, precio = $2, imagen = $3, descripcion = $4, categoria = $5, stock = $6
WHERE id = $7;