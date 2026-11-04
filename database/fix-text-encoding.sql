SET NAMES utf8mb4;
USE omnilog_hub;

START TRANSACTION;

-- CATEGORIAS
UPDATE categories
SET name = 'Eletrônicos',
    description = 'Equipamentos eletrônicos'
WHERE id = 1;

UPDATE categories
SET name = 'Informática',
    description = 'Computadores e periféricos'
WHERE id = 2;

UPDATE categories
SET name = 'Acessórios',
    description = 'Acessórios tecnológicos'
WHERE id = 3;

-- PRODUTOS
UPDATE products
SET description = 'Smartphone para demonstração do catálogo'
WHERE id = 1;

UPDATE products
SET name = 'Teclado Mecânico',
    description = 'Teclado mecânico USB'
WHERE id = 4;

-- VEÍCULOS
UPDATE vehicles
SET model = 'Caminhão leve'
WHERE id = 1;

-- CENTROS DE DISTRIBUIÇÃO
UPDATE warehouses
SET name = 'Centro de Distribuição Central',
    address = 'Endereço demonstrativo'
WHERE id = 1;

UPDATE warehouses
SET name = 'Centro de Distribuição Sul',
    address = 'Endereço demonstrativo'
WHERE id = 2;

COMMIT;
