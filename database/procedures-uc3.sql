USE omnilog_hub;

CREATE TABLE IF NOT EXISTS daily_billing_closings (
    closing_date DATE PRIMARY KEY,
    orders_count BIGINT UNSIGNED NOT NULL DEFAULT 0,
    gross_sales DECIMAL(14,2) NOT NULL DEFAULT 0,
    approved_payments DECIMAL(14,2) NOT NULL DEFAULT 0,
    pending_payments DECIMAL(14,2) NOT NULL DEFAULT 0,
    cancelled_orders BIGINT UNSIGNED NOT NULL DEFAULT 0,
    generated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS daily_logistics_summary (
    snapshot_date DATE PRIMARY KEY,
    orders_total BIGINT UNSIGNED NOT NULL DEFAULT 0,
    deliveries_total BIGINT UNSIGNED NOT NULL DEFAULT 0,
    delivered_total BIGINT UNSIGNED NOT NULL DEFAULT 0,
    delayed_total BIGINT UNSIGNED NOT NULL DEFAULT 0,
    in_transit_total BIGINT UNSIGNED NOT NULL DEFAULT 0,
    active_routes_total BIGINT UNSIGNED NOT NULL DEFAULT 0,
    average_route_distance_km DECIMAL(12,2) NOT NULL DEFAULT 0,
    generated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

DROP PROCEDURE IF EXISTS sp_close_daily_billing;

DELIMITER $$

CREATE PROCEDURE sp_close_daily_billing(IN p_date DATE)
BEGIN
    IF p_date IS NULL THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'A data do fechamento é obrigatória';
    END IF;

    START TRANSACTION;

    INSERT INTO daily_billing_closings (
        closing_date,
        orders_count,
        gross_sales,
        approved_payments,
        pending_payments,
        cancelled_orders
    )
    SELECT
        p_date,
        (SELECT COUNT(*)
         FROM sales_orders
         WHERE DATE(created_at) = p_date),

        (SELECT COALESCE(SUM(total), 0)
         FROM sales_orders
         WHERE DATE(created_at) = p_date
           AND status <> 'CANCELLED'),

        (SELECT COALESCE(SUM(amount), 0)
         FROM payments
         WHERE status = 'APPROVED'
           AND DATE(COALESCE(paid_at, created_at)) = p_date),

        (SELECT COALESCE(SUM(amount), 0)
         FROM payments
         WHERE status = 'PENDING'
           AND DATE(created_at) = p_date),

        (SELECT COUNT(*)
         FROM sales_orders
         WHERE DATE(created_at) = p_date
           AND status = 'CANCELLED')

    ON DUPLICATE KEY UPDATE
        orders_count = VALUES(orders_count),
        gross_sales = VALUES(gross_sales),
        approved_payments = VALUES(approved_payments),
        pending_payments = VALUES(pending_payments),
        cancelled_orders = VALUES(cancelled_orders);

    COMMIT;
END$$

DROP PROCEDURE IF EXISTS sp_refresh_daily_logistics_summary;

CREATE PROCEDURE sp_refresh_daily_logistics_summary(IN p_date DATE)
BEGIN
    IF p_date IS NULL THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'A data do relatório é obrigatória';
    END IF;

    INSERT INTO daily_logistics_summary (
        snapshot_date,
        orders_total,
        deliveries_total,
        delivered_total,
        delayed_total,
        in_transit_total,
        active_routes_total,
        average_route_distance_km
    )
    SELECT
        p_date,

        (SELECT COUNT(*)
         FROM sales_orders
         WHERE DATE(created_at) = p_date),

        (SELECT COUNT(*)
         FROM deliveries d
         INNER JOIN sales_orders so ON so.id = d.order_id
         WHERE DATE(so.created_at) = p_date),

        (SELECT COUNT(*)
         FROM deliveries d
         INNER JOIN sales_orders so ON so.id = d.order_id
         WHERE DATE(so.created_at) = p_date
           AND d.status = 'DELIVERED'),

        (SELECT COUNT(*)
         FROM deliveries d
         INNER JOIN sales_orders so ON so.id = d.order_id
         WHERE DATE(so.created_at) = p_date
           AND d.status = 'DELAYED'),

        (SELECT COUNT(*)
         FROM deliveries d
         INNER JOIN sales_orders so ON so.id = d.order_id
         WHERE DATE(so.created_at) = p_date
           AND d.status = 'IN_TRANSIT'),

        (SELECT COUNT(*)
         FROM logistics_routes
         WHERE active = 1),

        (SELECT COALESCE(AVG(distance_km), 0)
         FROM logistics_routes
         WHERE active = 1)

    ON DUPLICATE KEY UPDATE
        orders_total = VALUES(orders_total),
        deliveries_total = VALUES(deliveries_total),
        delivered_total = VALUES(delivered_total),
        delayed_total = VALUES(delayed_total),
        in_transit_total = VALUES(in_transit_total),
        active_routes_total = VALUES(active_routes_total),
        average_route_distance_km = VALUES(average_route_distance_km);
END$$

DELIMITER ;
