package br.com.omnilog.dao;

import br.com.omnilog.config.Database;
import br.com.omnilog.model.Employee;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class EmployeeDao {

    public List<Employee> findAll(String search) throws SQLException {
        String sql = """
            SELECT id, name, position, created_at
            FROM employees
            WHERE name LIKE ? OR position LIKE ?
            ORDER BY id DESC
        """;

        List<Employee> employees = new ArrayList<>();

        try (Connection con = Database.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {
            String filter = "%" + (search == null ? "" : search.trim()) + "%";
            ps.setString(1, filter);
            ps.setString(2, filter);

            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    employees.add(new Employee(
                        rs.getLong("id"),
                        rs.getString("name"),
                        rs.getString("position"),
                        rs.getTimestamp("created_at").toString()
                    ));
                }
            }
        }
        return employees;
    }

    public void insert(Employee employee) throws SQLException {
        String sql = "INSERT INTO employees (name, position) VALUES (?, ?)";

        try (Connection con = Database.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setString(1, employee.name());
            ps.setString(2, employee.position());
            ps.executeUpdate();
        }
    }

    public void update(Employee employee) throws SQLException {
        String sql = "UPDATE employees SET name = ?, position = ? WHERE id = ?";

        try (Connection con = Database.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setString(1, employee.name());
            ps.setString(2, employee.position());
            ps.setLong(3, employee.id());
            ps.executeUpdate();
        }
    }

    public void delete(long id) throws SQLException {
        String sql = "DELETE FROM employees WHERE id = ?";

        try (Connection con = Database.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setLong(1, id);
            ps.executeUpdate();
        }
    }
}
