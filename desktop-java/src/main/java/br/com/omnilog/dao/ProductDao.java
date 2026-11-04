package br.com.omnilog.dao;

import br.com.omnilog.config.Database;
import br.com.omnilog.model.Category;
import br.com.omnilog.model.Product;

import java.math.BigDecimal;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class ProductDao {

    public List<Product> findAll(String search) throws SQLException {
        String sql = """
            SELECT p.id, p.category_id, c.name AS category_name,
                   p.name, p.description, p.price, p.weight, p.active
            FROM products p
            INNER JOIN categories c ON c.id = p.category_id
            WHERE p.name LIKE ? OR c.name LIKE ?
            ORDER BY p.id DESC
        """;

        List<Product> products = new ArrayList<>();

        try (Connection connection = Database.getConnection();
             PreparedStatement statement = connection.prepareStatement(sql)) {

            String filter = "%" + (search == null ? "" : search.trim()) + "%";
            statement.setString(1, filter);
            statement.setString(2, filter);

            try (ResultSet result = statement.executeQuery()) {
                while (result.next()) {
                    products.add(new Product(
                        result.getLong("id"),
                        result.getLong("category_id"),
                        result.getString("category_name"),
                        result.getString("name"),
                        result.getString("description"),
                        result.getBigDecimal("price"),
                        result.getBigDecimal("weight"),
                        result.getBoolean("active")
                    ));
                }
            }
        }

        return products;
    }

    public List<Category> findCategories() throws SQLException {
        String sql = "SELECT id, name FROM categories ORDER BY name";
        List<Category> categories = new ArrayList<>();

        try (Connection connection = Database.getConnection();
             PreparedStatement statement = connection.prepareStatement(sql);
             ResultSet result = statement.executeQuery()) {

            while (result.next()) {
                categories.add(new Category(
                    result.getLong("id"),
                    result.getString("name")
                ));
            }
        }

        return categories;
    }

    public void insert(
        long categoryId,
        String name,
        String description,
        BigDecimal price,
        BigDecimal weight
    ) throws SQLException {

        String sql = """
            INSERT INTO products
            (category_id, name, description, price, weight, active)
            VALUES (?, ?, ?, ?, ?, 1)
        """;

        try (Connection connection = Database.getConnection();
             PreparedStatement statement = connection.prepareStatement(sql)) {

            statement.setLong(1, categoryId);
            statement.setString(2, name);
            statement.setString(3, description);
            statement.setBigDecimal(4, price);
            statement.setBigDecimal(5, weight);
            statement.executeUpdate();
        }
    }

    public void update(
        long id,
        long categoryId,
        String name,
        String description,
        BigDecimal price,
        BigDecimal weight
    ) throws SQLException {

        String sql = """
            UPDATE products
            SET category_id = ?, name = ?, description = ?,
                price = ?, weight = ?
            WHERE id = ?
        """;

        try (Connection connection = Database.getConnection();
             PreparedStatement statement = connection.prepareStatement(sql)) {

            statement.setLong(1, categoryId);
            statement.setString(2, name);
            statement.setString(3, description);
            statement.setBigDecimal(4, price);
            statement.setBigDecimal(5, weight);
            statement.setLong(6, id);
            statement.executeUpdate();
        }
    }

    public void deactivate(long id) throws SQLException {
        String sql = "UPDATE products SET active = 0 WHERE id = ?";

        try (Connection connection = Database.getConnection();
             PreparedStatement statement = connection.prepareStatement(sql)) {

            statement.setLong(1, id);
            statement.executeUpdate();
        }
    }
}
