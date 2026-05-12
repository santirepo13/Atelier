UPDATE cart_items
SET quantity = $2
WHERE id = $1 AND user_id = $3
RETURNING id, quantity;