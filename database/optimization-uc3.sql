USE omnilog_hub;

-- Índice composto para categoria e situação do produto.
SET @idx_exists = (
    SELECT COUNT(*)
    FROM information_schema.statistics
    WHERE table_schema = DATABASE()
      AND table_name = 'products'
      AND index_name = 'idx_products_category_active'
);

SET @sql_idx = IF(
    @idx_exists = 0,
    'CREATE INDEX idx_products_category_active ON products(category_id, active)',
    'SELECT ''Indice composto ja existe'' AS message'
);

PREPARE stmt_idx FROM @sql_idx;
EXECUTE stmt_idx;
DEALLOCATE PREPARE stmt_idx;

-- Índice FULLTEXT para pesquisa textual.
SET @ft_exists = (
    SELECT COUNT(*)
    FROM information_schema.statistics
    WHERE table_schema = DATABASE()
      AND table_name = 'products'
      AND index_name = 'ft_products_name_description'
);

SET @sql_ft = IF(
    @ft_exists = 0,
    'CREATE FULLTEXT INDEX ft_products_name_description ON products(name, description)',
    'SELECT ''Indice FULLTEXT ja existe'' AS message'
);

PREPARE stmt_ft FROM @sql_ft;
EXECUTE stmt_ft;
DEALLOCATE PREPARE stmt_ft;

-- Exemplo de busca:
-- SELECT id, name
-- FROM products
-- WHERE MATCH(name, description)
-- AGAINST ('notebook' IN NATURAL LANGUAGE MODE);
