SELECT id, total, payment_method, status, fecha, created_at
FROM orders
WHERE id = $1 AND user_id = $2;