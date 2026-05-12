INSERT INTO cart_items (user_id, product_id, quantity)
VALUES ($1, $2, $3)
ON CONFLICT (user_id, product_id)
DO UPDATE SET quantity = EXCLUDED.quantity
RETURNING id, quantity;