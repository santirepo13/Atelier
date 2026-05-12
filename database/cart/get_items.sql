SELECT ci.id, p.nombre, p.precio, p.imagen, ci.quantity
FROM cart_items ci
JOIN products p ON ci.product_id = p.id
WHERE ci.user_id = $1;