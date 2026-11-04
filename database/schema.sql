CREATE DATABASE IF NOT EXISTS omnilog_hub
  CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
USE omnilog_hub;

CREATE TABLE IF NOT EXISTS users (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('ADMIN','MANAGER','OPERATOR','CUSTOMER') NOT NULL DEFAULT 'CUSTOMER',
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS customers (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL UNIQUE,
  name VARCHAR(150) NOT NULL,
  cpf VARCHAR(14) NULL UNIQUE,
  phone VARCHAR(20) NULL,
  address VARCHAR(255) NULL,
  city VARCHAR(100) NULL,
  state CHAR(2) NULL,
  postal_code VARCHAR(10) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_customers_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS employees (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NULL UNIQUE,
  name VARCHAR(150) NOT NULL,
  position VARCHAR(100) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_employees_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS categories (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS products (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  category_id BIGINT UNSIGNED NOT NULL,
  name VARCHAR(150) NOT NULL,
  description TEXT NULL,
  price DECIMAL(12,2) NOT NULL,
  weight DECIMAL(10,3) NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_products_category (category_id),
  CONSTRAINT fk_products_category FOREIGN KEY (category_id) REFERENCES categories(id),
  CONSTRAINT chk_products_price CHECK (price >= 0),
  CONSTRAINT chk_products_weight CHECK (weight >= 0)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS warehouses (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  city VARCHAR(100) NOT NULL,
  state CHAR(2) NOT NULL,
  address VARCHAR(255) NULL,
  active BOOLEAN NOT NULL DEFAULT TRUE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS inventory (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  warehouse_id BIGINT UNSIGNED NOT NULL,
  product_id BIGINT UNSIGNED NOT NULL,
  quantity INT UNSIGNED NOT NULL DEFAULT 0,
  reserved_quantity INT UNSIGNED NOT NULL DEFAULT 0,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_inventory_warehouse_product (warehouse_id, product_id),
  CONSTRAINT fk_inventory_warehouse FOREIGN KEY (warehouse_id) REFERENCES warehouses(id),
  CONSTRAINT fk_inventory_product FOREIGN KEY (product_id) REFERENCES products(id),
  CONSTRAINT chk_inventory_reserved CHECK (reserved_quantity <= quantity)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS drivers (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  phone VARCHAR(20) NULL,
  license_number VARCHAR(40) NULL UNIQUE,
  active BOOLEAN NOT NULL DEFAULT TRUE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS vehicles (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  plate VARCHAR(10) NOT NULL UNIQUE,
  model VARCHAR(100) NOT NULL,
  capacity_kg DECIMAL(10,2) NOT NULL,
  status ENUM('AVAILABLE','IN_USE','MAINTENANCE') NOT NULL DEFAULT 'AVAILABLE'
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS logistics_routes (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  origin VARCHAR(150) NOT NULL,
  destination VARCHAR(150) NOT NULL,
  distance_km DECIMAL(10,2) NOT NULL DEFAULT 0,
  estimated_minutes INT UNSIGNED NOT NULL DEFAULT 0,
  driver_id BIGINT UNSIGNED NULL,
  vehicle_id BIGINT UNSIGNED NULL,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  CONSTRAINT fk_routes_driver FOREIGN KEY (driver_id) REFERENCES drivers(id) ON DELETE SET NULL,
  CONSTRAINT fk_routes_vehicle FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS sales_orders (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  customer_id BIGINT UNSIGNED NOT NULL,
  order_number VARCHAR(60) NOT NULL UNIQUE,
  status ENUM('PENDING','CONFIRMED','SEPARATING','SHIPPED','DELIVERED','CANCELLED') NOT NULL DEFAULT 'PENDING',
  total DECIMAL(12,2) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_orders_customer FOREIGN KEY (customer_id) REFERENCES customers(id),
  INDEX idx_orders_customer_date (customer_id, created_at)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS order_items (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  order_id BIGINT UNSIGNED NOT NULL,
  product_id BIGINT UNSIGNED NOT NULL,
  quantity INT UNSIGNED NOT NULL,
  unit_price DECIMAL(12,2) NOT NULL,
  CONSTRAINT fk_order_items_order FOREIGN KEY (order_id) REFERENCES sales_orders(id) ON DELETE CASCADE,
  CONSTRAINT fk_order_items_product FOREIGN KEY (product_id) REFERENCES products(id),
  CONSTRAINT chk_order_item_quantity CHECK (quantity > 0)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS order_item_allocations (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  order_item_id BIGINT UNSIGNED NOT NULL,
  inventory_id BIGINT UNSIGNED NOT NULL,
  quantity INT UNSIGNED NOT NULL,
  CONSTRAINT fk_alloc_order_item FOREIGN KEY (order_item_id) REFERENCES order_items(id) ON DELETE CASCADE,
  CONSTRAINT fk_alloc_inventory FOREIGN KEY (inventory_id) REFERENCES inventory(id),
  CONSTRAINT chk_alloc_quantity CHECK (quantity > 0)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS payments (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  order_id BIGINT UNSIGNED NOT NULL,
  method ENUM('PIX','CARD','BOLETO','CASH') NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  status ENUM('PENDING','APPROVED','REJECTED','REFUNDED') NOT NULL DEFAULT 'PENDING',
  paid_at DATETIME NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_payments_order FOREIGN KEY (order_id) REFERENCES sales_orders(id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS deliveries (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  order_id BIGINT UNSIGNED NOT NULL UNIQUE,
  tracking_code VARCHAR(40) NOT NULL UNIQUE,
  status ENUM('PREPARING','IN_TRANSIT','DELIVERED','DELAYED') NOT NULL DEFAULT 'PREPARING',
  estimated_delivery DATE NULL,
  delivered_at DATETIME NULL,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_deliveries_order FOREIGN KEY (order_id) REFERENCES sales_orders(id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL,
  token_hash CHAR(64) NOT NULL,
  expires_at DATETIME NOT NULL,
  used_at DATETIME NULL,
  attempts TINYINT UNSIGNED NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_reset_user_expiry (user_id, expires_at),
  CONSTRAINT fk_reset_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS audit_logs (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NULL,
  action VARCHAR(100) NOT NULL,
  details JSON NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_audit_created (created_at),
  CONSTRAINT fk_audit_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE OR REPLACE VIEW vw_inventory_summary AS
SELECT w.id AS warehouse_id, w.name AS warehouse, COUNT(DISTINCT i.product_id) AS product_types,
       COALESCE(SUM(i.quantity),0) AS total_units,
       COALESCE(SUM((i.quantity - i.reserved_quantity) * p.price),0) AS available_stock_value
FROM warehouses w
LEFT JOIN inventory i ON i.warehouse_id = w.id
LEFT JOIN products p ON p.id = i.product_id
GROUP BY w.id, w.name;

CREATE OR REPLACE VIEW vw_logistics_summary AS
SELECT d.status, COUNT(*) AS deliveries_count
FROM deliveries d
GROUP BY d.status;

INSERT IGNORE INTO categories (name, description) VALUES
('Eletrônicos','Equipamentos eletrônicos'),
('Informática','Computadores e periféricos'),
('Acessórios','Acessórios tecnológicos');

INSERT INTO warehouses (id, name, city, state, address, active)
VALUES (1,'Centro de Distribuição Central','Porto Alegre','RS','Endereço demonstrativo',TRUE),
       (2,'Centro de Distribuição Sul','Pelotas','RS','Endereço demonstrativo',TRUE)
ON DUPLICATE KEY UPDATE name=VALUES(name), city=VALUES(city), state=VALUES(state);

INSERT INTO products (id, category_id, name, description, price, weight, active) VALUES
(1,1,'Smartphone Galaxy','Smartphone para demonstração do catálogo',1899.90,0.190,TRUE),
(2,2,'Monitor LED 24','Monitor de 24 polegadas',799.90,3.500,TRUE),
(3,2,'Notebook Pro','Notebook para trabalho e estudo',3299.00,1.800,TRUE),
(4,3,'Teclado Mecânico','Teclado mecânico USB',249.90,0.850,TRUE),
(5,3,'Mouse Wireless','Mouse sem fio',89.90,0.120,TRUE),
(6,3,'Headset Gamer','Headset com microfone',159.90,0.350,TRUE)
ON DUPLICATE KEY UPDATE name=VALUES(name), price=VALUES(price), active=TRUE;

INSERT INTO inventory (warehouse_id, product_id, quantity, reserved_quantity) VALUES
(1,1,35,0),(1,2,40,0),(1,3,25,0),(1,4,80,0),(1,5,100,0),(1,6,75,0),
(2,1,20,0),(2,2,25,0),(2,3,15,0),(2,4,60,0),(2,5,80,0),(2,6,70,0)
ON DUPLICATE KEY UPDATE quantity=VALUES(quantity);

INSERT IGNORE INTO drivers (id,name,phone,license_number,active) VALUES
(1,'Marcos Oliveira','51999990001','RS-OMNI-0001',TRUE),
(2,'Ana Souza','51999990002','RS-OMNI-0002',TRUE);
INSERT IGNORE INTO vehicles (id,plate,model,capacity_kg,status) VALUES
(1,'ABC1D23','Caminhão leve',3500,'AVAILABLE'),
(2,'DEF4G56','Van de entrega',1200,'AVAILABLE');
INSERT IGNORE INTO logistics_routes (id,name,origin,destination,distance_km,estimated_minutes,driver_id,vehicle_id,active) VALUES
(1,'Rota Metropolitana','Porto Alegre','Canoas',18.5,35,1,1,TRUE),
(2,'Rota Sul','Pelotas','Rio Grande',55,65,2,2,TRUE);

DELIMITER $$
CREATE PROCEDURE sp_inventory_for_warehouse(IN p_warehouse_id BIGINT UNSIGNED)
BEGIN
  SELECT p.id, p.name, i.quantity, i.reserved_quantity,
         (i.quantity - i.reserved_quantity) AS available
  FROM inventory i JOIN products p ON p.id=i.product_id
  WHERE i.warehouse_id=p_warehouse_id AND p.active=TRUE
  ORDER BY p.name;
END$$

CREATE PROCEDURE sp_update_delivery_status(IN p_tracking_code VARCHAR(40), IN p_status VARCHAR(20))
BEGIN
  UPDATE deliveries
  SET status=p_status,
      delivered_at=IF(p_status='DELIVERED', CURRENT_TIMESTAMP, delivered_at)
  WHERE tracking_code=p_tracking_code;
  SELECT ROW_COUNT() AS affected_rows;
END$$
DELIMITER ;
