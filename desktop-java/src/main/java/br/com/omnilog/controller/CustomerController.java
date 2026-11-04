package br.com.omnilog.controller;

import br.com.omnilog.dao.CustomerDao;
import br.com.omnilog.model.Customer;
import java.sql.SQLException;
import java.util.List;

public class CustomerController {
    private final CustomerDao dao = new CustomerDao();

    public List<Customer> listar(String pesquisa) throws SQLException {
        return dao.findAll(pesquisa);
    }

    public void salvar(Customer cliente, String senha) throws SQLException {
        if (cliente.name() == null || cliente.name().trim().length() < 2) {
            throw new IllegalArgumentException("Informe o nome do cliente.");
        }
        if (cliente.email() == null ||
            !cliente.email().matches("^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$")) {
            throw new IllegalArgumentException("Informe um e-mail válido.");
        }
        if (cliente.state() != null && !cliente.state().isBlank()
                && cliente.state().trim().length() != 2) {
            throw new IllegalArgumentException("A UF deve ter duas letras.");
        }
        if (senha != null && !senha.isBlank() && senha.length() < 8) {
            throw new IllegalArgumentException("A senha deve ter pelo menos 8 caracteres.");
        }

        if (cliente.id() == 0) {
            if (senha == null || senha.length() < 8) {
                throw new IllegalArgumentException(
                    "Crie uma senha com pelo menos 8 caracteres para o cliente."
                );
            }
            dao.insert(cliente, senha);
        } else {
            dao.update(cliente, senha);
        }
    }

    public void desativar(long id) throws SQLException {
        if (id <= 0) throw new IllegalArgumentException("Cliente inválido.");
        dao.deactivate(id);
    }
}
