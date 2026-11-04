USE omnilog_hub;

-- 1. Catálogo com categoria e disponibilidade total.
SELECT p.id, p.name, c.name AS category, p.price,
       COALESCE(SUM(i.quantity - i.reserved_quantity), 0) AS available_stock
FROM products p
JOIN categories c ON c.id = p.category_id
LEFT JOIN inventory i ON i.product_id = p.id
WHERE p.active = TRUE
GROUP BY p.id, p.name, c.name, p.price
ORDER BY p.name;

-- 2. Pedidos com nome e e-mail do cliente.
SELECT so.order_number, c.name AS customer, u.email, so.status, so.total, so.created_at
FROM sales_orders so
JOIN customers c ON c.id = so.customer_id
JOIN users u ON u.id = c.user_id
ORDER BY so.created_at DESC;

-- 3. Resumo do estoque por armazém (view).
SELECT * FROM vw_inventory_summary ORDER BY warehouse;

-- 4. Contagem de entregas por status (view).
SELECT * FROM vw_logistics_summary ORDER BY status;

-- 5. Produtos cujo estoque disponível está abaixo da média geral.
SELECT p.name, SUM(i.quantity - i.reserved_quantity) AS available
FROM products p JOIN inventory i ON i.product_id = p.id
GROUP BY p.id, p.name
HAVING available < (
  SELECT AVG(stock_by_product.available)
  FROM (
    SELECT SUM(quantity - reserved_quantity) AS available
    FROM inventory GROUP BY product_id
  ) AS stock_by_product
);

-- 6. Procedure de consulta por armazém (use um ID existente).
CALL sp_inventory_for_warehouse(1);

-- 7. Procedure de atualização de entrega (use um código de rastreio existente).
-- CALL sp_update_delivery_status('OMNI-2026-000001', 'IN_TRANSIT');
