INSERT INTO orders (user_id, total, payment_method, status, fecha)
VALUES ($1, $2, $3, 'pending', CURRENT_DATE)
RETURNING id;