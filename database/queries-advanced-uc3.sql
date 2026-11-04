USE omnilog_hub;

-- 1. INNER JOIN: produtos e categorias.
SELECT p.id, p.name AS product, c.name AS category, p.price
FROM products p
INNER JOIN categories c ON c.id = p.category_id
ORDER BY c.name, p.name;

-- 2. LEFT JOIN: categorias mesmo sem produtos.
SELECT c.id, c.name, COUNT(p.id) AS product_count
FROM categories c
LEFT JOIN products p ON p.category_id = c.id
GROUP BY c.id, c.name;

-- 3. RIGHT JOIN: todas as categorias.
SELECT p.name AS product, c.name AS category
FROM products p
RIGHT JOIN categories c ON c.id = p.category_id;

-- 4. Subconsulta correlacionada.
SELECT c.id, c.name
FROM categories c
WHERE EXISTS (
    SELECT 1
    FROM products p
    WHERE p.category_id = c.id
      AND p.active = 1
);

-- 5. Agregação e HAVING.
SELECT
    c.name,
    COUNT(p.id) AS total_products,
    AVG(p.price) AS average_price,
    SUM(p.price) AS sum_of_prices
FROM categories c
INNER JOIN products p ON p.category_id = c.id
WHERE p.active = 1
GROUP BY c.id, c.name
HAVING COUNT(p.id) >= 2;

-- 6. UNION: clientes e funcionários.
SELECT name, 'CLIENTE' AS record_type FROM customers
UNION
SELECT name, 'FUNCIONARIO' AS record_type FROM employees;

-- 7. INTERSECT: categorias com produtos ativos
-- e também com produtos de preço igual ou superior a 100.
SELECT category_id FROM products WHERE active = 1
INTERSECT
SELECT category_id FROM products WHERE price >= 100.00;

-- 8. Subconsulta escalar: produtos acima da média.
SELECT id, name, price
FROM products
WHERE price > (SELECT AVG(price) FROM products)
ORDER BY price DESC;
