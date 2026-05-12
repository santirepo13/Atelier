SELECT COALESCE(SUM(p.precio * ci.quantity), 0) AS total
FROM cart_items ci
JOIN products p ON ci.product_id = p.id
WHERE ci.user_id = $1;