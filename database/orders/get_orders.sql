SELECT id, total, payment_method, status, fecha, created_at
FROM orders
WHERE user_id = $1
ORDER BY created_at DESC;