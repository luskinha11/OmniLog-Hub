package br.com.omnilog.dao;

import br.com.omnilog.config.Database;
import br.com.omnilog.model.Customer;
import org.mindrot.jbcrypt.BCrypt;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class CustomerDao {

    public List<Customer> findAll(String search) throws SQLException {
        String sql = """
            SELECT c.id, c.user_id, c.name, u.email, c.cpf, c.phone,
                   c.address, c.city, c.state, c.postal_code, u.active
            FROM customers c
            INNER JOIN users u ON u.id = c.user_id
            WHERE c.name LIKE ? OR u.email LIKE ? OR c.cpf LIKE ?
            ORDER BY c.id DESC
        """;

        List<Customer> customers = new ArrayList<>();

        try (Connection con = Database.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {
            String filter = "%" + (search == null ? "" : search.trim()) + "%";
            ps.setString(1, filter);
            ps.setString(2, filter);
            ps.setString(3, filter);

            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    customers.add(new Customer(
                        rs.getLong("id"),
                        rs.getLong("user_id"),
                        rs.getString("name"),
                        rs.getString("email"),
                        rs.getString("cpf"),
                        rs.getString("phone"),
                        rs.getString("address"),
                        rs.getString("city"),
                        rs.getString("state"),
                        rs.getString("postal_code"),
                        rs.getBoolean("active")
                    ));
                }
            }
        }
        return customers;
    }

    public void insert(Customer c, String password) throws SQLException {
        String userSql = """
            INSERT INTO users (email, password_hash, role, active)
            VALUES (?, ?, 'CUSTOMER', 1)
        """;
        String customerSql = """
            INSERT INTO customers
            (user_id, name, cpf, phone, address, city, state, postal_code)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """;

        try (Connection con = Database.getConnection()) {
            con.setAutoCommit(false);
            try {
                long userId;

                try (PreparedStatement ps = con.prepareStatement(
                        userSql, Statement.RETURN_GENERATED_KEYS)) {
                    ps.setString(1, c.email());
                    ps.setString(2, BCrypt.hashpw(password, BCrypt.gensalt(12)));
                    ps.executeUpdate();

                    try (ResultSet keys = ps.getGeneratedKeys()) {
                        if (!keys.next()) {
                            throw new SQLException("Não foi possível criar a conta.");
                        }
                        userId = keys.getLong(1);
                    }
                }

                try (PreparedStatement ps = con.prepareStatement(customerSql)) {
                    ps.setLong(1, userId);
                    ps.setString(2, c.name());
                    setOptional(ps, 3, c.cpf());
                    setOptional(ps, 4, c.phone());
                    setOptional(ps, 5, c.address());
                    setOptional(ps, 6, c.city());
                    setOptional(ps, 7, c.state());
                    setOptional(ps, 8, c.postalCode());
                    ps.executeUpdate();
                }

                con.commit();
            } catch (Exception e) {
                con.rollback();
                if (e instanceof SQLException sqlException) throw sqlException;
                throw new SQLException("Falha ao cadastrar cliente.", e);
            } finally {
                con.setAutoCommit(true);
            }
        }
    }

    public void update(Customer c, String newPassword) throws SQLException {
        try (Connection con = Database.getConnection()) {
            con.setAutoCommit(false);
            try {
                String userSql = newPassword == null || newPassword.isBlank()
                    ? "UPDATE users SET email = ? WHERE id = ?"
                    : "UPDATE users SET email = ?, password_hash = ? WHERE id = ?";

                try (PreparedStatement ps = con.prepareStatement(userSql)) {
                    ps.setString(1, c.email());
                    if (newPassword == null || newPassword.isBlank()) {
                        ps.setLong(2, c.userId());
                    } else {
                        ps.setString(2, BCrypt.hashpw(newPassword, BCrypt.gensalt(12)));
                        ps.setLong(3, c.userId());
                    }
                    ps.executeUpdate();
                }

                String customerSql = """
                    UPDATE customers
                    SET name = ?, cpf = ?, phone = ?, address = ?,
                        city = ?, state = ?, postal_code = ?
                    WHERE id = ?
                """;

                try (PreparedStatement ps = con.prepareStatement(customerSql)) {
                    ps.setString(1, c.name());
                    setOptional(ps, 2, c.cpf());
                    setOptional(ps, 3, c.phone());
                    setOptional(ps, 4, c.address());
                    setOptional(ps, 5, c.city());
                    setOptional(ps, 6, c.state());
                    setOptional(ps, 7, c.postalCode());
                    ps.setLong(8, c.id());
                    ps.executeUpdate();
                }

                con.commit();
            } catch (Exception e) {
                con.rollback();
                if (e instanceof SQLException sqlException) throw sqlException;
                throw new SQLException("Falha ao atualizar cliente.", e);
            } finally {
                con.setAutoCommit(true);
            }
        }
    }

    public void deactivate(long customerId) throws SQLException {
        String sql = """
            UPDATE users u
            INNER JOIN customers c ON c.user_id = u.id
            SET u.active = 0
            WHERE c.id = ?
        """;

        try (Connection con = Database.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setLong(1, customerId);
            ps.executeUpdate();
        }
    }

    private void setOptional(PreparedStatement ps, int index, String value)
            throws SQLException {
        if (value == null || value.isBlank()) {
            ps.setNull(index, Types.VARCHAR);
        } else {
            ps.setString(index, value.trim());
        }
    }
}
