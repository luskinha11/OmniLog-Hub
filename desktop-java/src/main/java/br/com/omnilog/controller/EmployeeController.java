package br.com.omnilog.controller;

import br.com.omnilog.dao.EmployeeDao;
import br.com.omnilog.model.Employee;
import java.sql.SQLException;
import java.util.List;

public class EmployeeController {
    private final EmployeeDao dao = new EmployeeDao();

    public List<Employee> listar(String pesquisa) throws SQLException {
        return dao.findAll(pesquisa);
    }

    public void salvar(long id, String nome, String cargo) throws SQLException {
        if (nome == null || nome.trim().length() < 2) {
            throw new IllegalArgumentException("Informe o nome do funcionário.");
        }
        if (cargo == null || cargo.trim().length() < 2) {
            throw new IllegalArgumentException("Informe o cargo do funcionário.");
        }

        Employee employee = new Employee(id, nome.trim(), cargo.trim(), null);

        if (id == 0) dao.insert(employee);
        else dao.update(employee);
    }

    public void excluir(long id) throws SQLException {
        if (id <= 0) throw new IllegalArgumentException("Funcionário inválido.");
        dao.delete(id);
    }
}
