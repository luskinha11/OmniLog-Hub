# UC3 - Dicionário de Dados

Banco: omnilog_hub
Gerado em: 04/11/2026, 16:36:47

## 1. Visão geral

- Estruturas encontradas: 21
- Tabelas físicas: 19
- Views: 2
- Chaves estrangeiras: 16
- Restrições CHECK: 5

## 2. Estrutura das tabelas

### audit_logs

Tipo: BASE TABLE

| Campo | Tipo | NULL | Chave | Padrão | Extra |
|---|---|---|---|---|---|
| id | bigint unsigned | NO | PRI | — | auto_increment |
| user_id | bigint unsigned | YES | MUL | — |  |
| action | varchar(100) | NO |  | — |  |
| details | json | YES |  | — |  |
| created_at | timestamp | NO | MUL | CURRENT_TIMESTAMP | DEFAULT_GENERATED |

### categories

Tipo: BASE TABLE

| Campo | Tipo | NULL | Chave | Padrão | Extra |
|---|---|---|---|---|---|
| id | bigint unsigned | NO | PRI | — | auto_increment |
| name | varchar(100) | NO | UNI | — |  |
| description | text | YES |  | — |  |

### customers

Tipo: BASE TABLE

| Campo | Tipo | NULL | Chave | Padrão | Extra |
|---|---|---|---|---|---|
| id | bigint unsigned | NO | PRI | — | auto_increment |
| user_id | bigint unsigned | NO | UNI | — |  |
| name | varchar(150) | NO |  | — |  |
| cpf | varchar(14) | YES | UNI | — |  |
| phone | varchar(20) | YES |  | — |  |
| address | varchar(255) | YES |  | — |  |
| city | varchar(100) | YES |  | — |  |
| state | char(2) | YES |  | — |  |
| postal_code | varchar(10) | YES |  | — |  |
| created_at | timestamp | NO |  | CURRENT_TIMESTAMP | DEFAULT_GENERATED |

### daily_billing_closings

Tipo: BASE TABLE

| Campo | Tipo | NULL | Chave | Padrão | Extra |
|---|---|---|---|---|---|
| closing_date | date | NO | PRI | — |  |
| orders_count | bigint unsigned | NO |  | 0 |  |
| gross_sales | decimal(14,2) | NO |  | 0.00 |  |
| approved_payments | decimal(14,2) | NO |  | 0.00 |  |
| pending_payments | decimal(14,2) | NO |  | 0.00 |  |
| cancelled_orders | bigint unsigned | NO |  | 0 |  |
| generated_at | timestamp | NO |  | CURRENT_TIMESTAMP | DEFAULT_GENERATED on update CURRENT_TIMESTAMP |

### daily_logistics_summary

Tipo: BASE TABLE

| Campo | Tipo | NULL | Chave | Padrão | Extra |
|---|---|---|---|---|---|
| snapshot_date | date | NO | PRI | — |  |
| orders_total | bigint unsigned | NO |  | 0 |  |
| deliveries_total | bigint unsigned | NO |  | 0 |  |
| delivered_total | bigint unsigned | NO |  | 0 |  |
| delayed_total | bigint unsigned | NO |  | 0 |  |
| in_transit_total | bigint unsigned | NO |  | 0 |  |
| active_routes_total | bigint unsigned | NO |  | 0 |  |
| average_route_distance_km | decimal(12,2) | NO |  | 0.00 |  |
| generated_at | timestamp | NO |  | CURRENT_TIMESTAMP | DEFAULT_GENERATED on update CURRENT_TIMESTAMP |

### deliveries

Tipo: BASE TABLE

| Campo | Tipo | NULL | Chave | Padrão | Extra |
|---|---|---|---|---|---|
| id | bigint unsigned | NO | PRI | — | auto_increment |
| order_id | bigint unsigned | NO | UNI | — |  |
| tracking_code | varchar(40) | NO | UNI | — |  |
| status | enum('PREPARING','IN_TRANSIT','DELIVERED','DELAYED') | NO |  | PREPARING |  |
| estimated_delivery | date | YES |  | — |  |
| delivered_at | datetime | YES |  | — |  |
| updated_at | timestamp | NO |  | CURRENT_TIMESTAMP | DEFAULT_GENERATED on update CURRENT_TIMESTAMP |

### drivers

Tipo: BASE TABLE

| Campo | Tipo | NULL | Chave | Padrão | Extra |
|---|---|---|---|---|---|
| id | bigint unsigned | NO | PRI | — | auto_increment |
| name | varchar(150) | NO |  | — |  |
| phone | varchar(20) | YES |  | — |  |
| license_number | varchar(40) | YES | UNI | — |  |
| active | tinyint(1) | NO |  | 1 |  |

### employees

Tipo: BASE TABLE

| Campo | Tipo | NULL | Chave | Padrão | Extra |
|---|---|---|---|---|---|
| id | bigint unsigned | NO | PRI | — | auto_increment |
| user_id | bigint unsigned | YES | UNI | — |  |
| name | varchar(150) | NO |  | — |  |
| position | varchar(100) | NO |  | — |  |
| created_at | timestamp | NO |  | CURRENT_TIMESTAMP | DEFAULT_GENERATED |

### inventory

Tipo: BASE TABLE

| Campo | Tipo | NULL | Chave | Padrão | Extra |
|---|---|---|---|---|---|
| id | bigint unsigned | NO | PRI | — | auto_increment |
| warehouse_id | bigint unsigned | NO | MUL | — |  |
| product_id | bigint unsigned | NO | MUL | — |  |
| quantity | int unsigned | NO |  | 0 |  |
| reserved_quantity | int unsigned | NO |  | 0 |  |
| updated_at | timestamp | NO |  | CURRENT_TIMESTAMP | DEFAULT_GENERATED on update CURRENT_TIMESTAMP |

### logistics_routes

Tipo: BASE TABLE

| Campo | Tipo | NULL | Chave | Padrão | Extra |
|---|---|---|---|---|---|
| id | bigint unsigned | NO | PRI | — | auto_increment |
| name | varchar(120) | NO |  | — |  |
| origin | varchar(150) | NO |  | — |  |
| destination | varchar(150) | NO |  | — |  |
| distance_km | decimal(10,2) | NO |  | 0.00 |  |
| estimated_minutes | int unsigned | NO |  | 0 |  |
| driver_id | bigint unsigned | YES | MUL | — |  |
| vehicle_id | bigint unsigned | YES | MUL | — |  |
| active | tinyint(1) | NO |  | 1 |  |

### order_item_allocations

Tipo: BASE TABLE

| Campo | Tipo | NULL | Chave | Padrão | Extra |
|---|---|---|---|---|---|
| id | bigint unsigned | NO | PRI | — | auto_increment |
| order_item_id | bigint unsigned | NO | MUL | — |  |
| inventory_id | bigint unsigned | NO | MUL | — |  |
| quantity | int unsigned | NO |  | — |  |

### order_items

Tipo: BASE TABLE

| Campo | Tipo | NULL | Chave | Padrão | Extra |
|---|---|---|---|---|---|
| id | bigint unsigned | NO | PRI | — | auto_increment |
| order_id | bigint unsigned | NO | MUL | — |  |
| product_id | bigint unsigned | NO | MUL | — |  |
| quantity | int unsigned | NO |  | — |  |
| unit_price | decimal(12,2) | NO |  | — |  |

### password_reset_tokens

Tipo: BASE TABLE

| Campo | Tipo | NULL | Chave | Padrão | Extra |
|---|---|---|---|---|---|
| id | bigint unsigned | NO | PRI | — | auto_increment |
| user_id | bigint unsigned | NO | MUL | — |  |
| token_hash | char(64) | NO |  | — |  |
| expires_at | datetime | NO |  | — |  |
| used_at | datetime | YES |  | — |  |
| attempts | tinyint unsigned | NO |  | 0 |  |
| created_at | timestamp | NO |  | CURRENT_TIMESTAMP | DEFAULT_GENERATED |

### payments

Tipo: BASE TABLE

| Campo | Tipo | NULL | Chave | Padrão | Extra |
|---|---|---|---|---|---|
| id | bigint unsigned | NO | PRI | — | auto_increment |
| order_id | bigint unsigned | NO | MUL | — |  |
| method | enum('PIX','CARD','BOLETO','CASH') | NO |  | — |  |
| amount | decimal(12,2) | NO |  | — |  |
| status | enum('PENDING','APPROVED','REJECTED','REFUNDED') | NO |  | PENDING |  |
| paid_at | datetime | YES |  | — |  |
| created_at | timestamp | NO |  | CURRENT_TIMESTAMP | DEFAULT_GENERATED |

### products

Tipo: BASE TABLE

| Campo | Tipo | NULL | Chave | Padrão | Extra |
|---|---|---|---|---|---|
| id | bigint unsigned | NO | PRI | — | auto_increment |
| category_id | bigint unsigned | NO | MUL | — |  |
| name | varchar(150) | NO | MUL | — |  |
| description | text | YES |  | — |  |
| price | decimal(12,2) | NO |  | — |  |
| weight | decimal(10,3) | NO |  | 0.000 |  |
| active | tinyint(1) | NO |  | 1 |  |
| created_at | timestamp | NO |  | CURRENT_TIMESTAMP | DEFAULT_GENERATED |

### sales_orders

Tipo: BASE TABLE

| Campo | Tipo | NULL | Chave | Padrão | Extra |
|---|---|---|---|---|---|
| id | bigint unsigned | NO | PRI | — | auto_increment |
| customer_id | bigint unsigned | NO | MUL | — |  |
| order_number | varchar(60) | NO | UNI | — |  |
| status | enum('PENDING','CONFIRMED','SEPARATING','SHIPPED','DELIVERED','CANCELLED') | NO |  | PENDING |  |
| total | decimal(12,2) | NO |  | — |  |
| created_at | timestamp | NO |  | CURRENT_TIMESTAMP | DEFAULT_GENERATED |

### users

Tipo: BASE TABLE

| Campo | Tipo | NULL | Chave | Padrão | Extra |
|---|---|---|---|---|---|
| id | bigint unsigned | NO | PRI | — | auto_increment |
| email | varchar(150) | NO | UNI | — |  |
| password_hash | varchar(255) | NO |  | — |  |
| role | enum('ADMIN','MANAGER','OPERATOR','CUSTOMER') | NO |  | CUSTOMER |  |
| active | tinyint(1) | NO |  | 1 |  |
| created_at | timestamp | NO |  | CURRENT_TIMESTAMP | DEFAULT_GENERATED |

### vehicles

Tipo: BASE TABLE

| Campo | Tipo | NULL | Chave | Padrão | Extra |
|---|---|---|---|---|---|
| id | bigint unsigned | NO | PRI | — | auto_increment |
| plate | varchar(10) | NO | UNI | — |  |
| model | varchar(100) | NO |  | — |  |
| capacity_kg | decimal(10,2) | NO |  | — |  |
| status | enum('AVAILABLE','IN_USE','MAINTENANCE') | NO |  | AVAILABLE |  |

### vw_inventory_summary

Tipo: VIEW

| Campo | Tipo | NULL | Chave | Padrão | Extra |
|---|---|---|---|---|---|
| warehouse_id | bigint unsigned | NO |  | 0 |  |
| warehouse | varchar(120) | NO |  | — |  |
| product_types | bigint | NO |  | 0 |  |
| total_units | decimal(32,0) | NO |  | 0 |  |
| available_stock_value | decimal(45,2) | NO |  | 0.00 |  |

### vw_logistics_summary

Tipo: VIEW

| Campo | Tipo | NULL | Chave | Padrão | Extra |
|---|---|---|---|---|---|
| status | enum('PREPARING','IN_TRANSIT','DELIVERED','DELAYED') | NO |  | PREPARING |  |
| deliveries_count | bigint | NO |  | 0 |  |

### warehouses

Tipo: BASE TABLE

| Campo | Tipo | NULL | Chave | Padrão | Extra |
|---|---|---|---|---|---|
| id | bigint unsigned | NO | PRI | — | auto_increment |
| name | varchar(120) | NO |  | — |  |
| city | varchar(100) | NO |  | — |  |
| state | char(2) | NO |  | — |  |
| address | varchar(255) | YES |  | — |  |
| active | tinyint(1) | NO |  | 1 |  |

## 3. Chaves estrangeiras

| Tabela | Campo | Referência | Atualização | Exclusão |
|---|---|---|---|---|
| audit_logs | user_id | users.id | NO ACTION | SET NULL |
| customers | user_id | users.id | NO ACTION | CASCADE |
| deliveries | order_id | sales_orders.id | NO ACTION | NO ACTION |
| employees | user_id | users.id | NO ACTION | SET NULL |
| inventory | product_id | products.id | NO ACTION | NO ACTION |
| inventory | warehouse_id | warehouses.id | NO ACTION | NO ACTION |
| logistics_routes | driver_id | drivers.id | NO ACTION | SET NULL |
| logistics_routes | vehicle_id | vehicles.id | NO ACTION | SET NULL |
| order_item_allocations | inventory_id | inventory.id | NO ACTION | NO ACTION |
| order_item_allocations | order_item_id | order_items.id | NO ACTION | CASCADE |
| order_items | order_id | sales_orders.id | NO ACTION | CASCADE |
| order_items | product_id | products.id | NO ACTION | NO ACTION |
| password_reset_tokens | user_id | users.id | NO ACTION | CASCADE |
| payments | order_id | sales_orders.id | NO ACTION | NO ACTION |
| products | category_id | categories.id | NO ACTION | NO ACTION |
| sales_orders | customer_id | customers.id | NO ACTION | NO ACTION |

## 4. Restrições CHECK

| Tabela | Restrição | Regra |
|---|---|---|
| inventory | chk_inventory_reserved | (`reserved_quantity` <= `quantity`) |
| order_items | chk_order_item_quantity | (`quantity` > 0) |
| order_item_allocations | chk_alloc_quantity | (`quantity` > 0) |
| products | chk_products_price | (`price` >= 0) |
| products | chk_products_weight | (`weight` >= 0) |

## 5. Índices

| Tabela | Índice | Não único | Colunas |
|---|---|---|---|
| audit_logs | fk_audit_user | Sim | user_id |
| audit_logs | idx_audit_created | Sim | created_at |
| audit_logs | PRIMARY | Não | id |
| categories | name | Não | name |
| categories | PRIMARY | Não | id |
| customers | cpf | Não | cpf |
| customers | PRIMARY | Não | id |
| customers | user_id | Não | user_id |
| daily_billing_closings | PRIMARY | Não | closing_date |
| daily_logistics_summary | PRIMARY | Não | snapshot_date |
| deliveries | order_id | Não | order_id |
| deliveries | PRIMARY | Não | id |
| deliveries | tracking_code | Não | tracking_code |
| drivers | license_number | Não | license_number |
| drivers | PRIMARY | Não | id |
| employees | PRIMARY | Não | id |
| employees | user_id | Não | user_id |
| inventory | fk_inventory_product | Sim | product_id |
| inventory | PRIMARY | Não | id |
| inventory | uq_inventory_warehouse_product | Não | warehouse_id,product_id |
| logistics_routes | fk_routes_driver | Sim | driver_id |
| logistics_routes | fk_routes_vehicle | Sim | vehicle_id |
| logistics_routes | PRIMARY | Não | id |
| order_item_allocations | fk_alloc_inventory | Sim | inventory_id |
| order_item_allocations | fk_alloc_order_item | Sim | order_item_id |
| order_item_allocations | PRIMARY | Não | id |
| order_items | fk_order_items_order | Sim | order_id |
| order_items | fk_order_items_product | Sim | product_id |
| order_items | PRIMARY | Não | id |
| password_reset_tokens | idx_reset_user_expiry | Sim | user_id,expires_at |
| password_reset_tokens | PRIMARY | Não | id |
| payments | fk_payments_order | Sim | order_id |
| payments | PRIMARY | Não | id |
| products | ft_products_name_description | Sim | name,description |
| products | idx_products_category | Sim | category_id |
| products | idx_products_category_active | Sim | category_id,active |
| products | PRIMARY | Não | id |
| sales_orders | idx_orders_customer_date | Sim | customer_id,created_at |
| sales_orders | order_number | Não | order_number |
| sales_orders | PRIMARY | Não | id |
| users | email | Não | email |
| users | PRIMARY | Não | id |
| vehicles | plate | Não | plate |
| vehicles | PRIMARY | Não | id |
| warehouses | PRIMARY | Não | id |

## 6. Observações

- Os dados foram obtidos diretamente dos metadados do MySQL.
- As views representam consultas estruturadas e não tabelas físicas.
- A normalização deve ser complementada pela análise das dependências funcionais e regras de negócio.
