SELECT oi.product_id, oi.product_name, oi.product_price, oi.quantity
FROM order_items oi
WHERE oi.order_id = $1;