package br.com.omnilog.controller;

import br.com.omnilog.dao.ProductDao;
import br.com.omnilog.model.Category;
import br.com.omnilog.model.Product;
import java.math.BigDecimal;
import java.sql.SQLException;
import java.util.List;

public class ProductController {
    private final ProductDao dao = new ProductDao();

    public List<Product> listar(String pesquisa) throws SQLException {
        return dao.findAll(pesquisa);
    }

    public List<Category> listarCategorias() throws SQLException {
        return dao.findCategories();
    }

    public void salvar(Long id, Category categoria, String nome,
                       String descricao, String preco, String peso)
            throws SQLException {

        if (categoria == null) {
            throw new IllegalArgumentException("Selecione uma categoria.");
        }

        if (nome == null || nome.trim().length() < 2) {
            throw new IllegalArgumentException("Informe um nome válido.");
        }

        BigDecimal valor = decimal(preco, "Preço");
        BigDecimal pesoProduto = decimal(peso, "Peso");

        if (valor.compareTo(BigDecimal.ZERO) < 0 ||
            pesoProduto.compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("Preço e peso não podem ser negativos.");
        }

        if (descricao != null && descricao.length() > 5000) {
            throw new IllegalArgumentException("Descrição muito longa.");
        }

        if (id == null) {
            dao.insert(categoria.id(), nome.trim(), descricao, valor, pesoProduto);
        } else {
            dao.update(id, categoria.id(), nome.trim(), descricao, valor, pesoProduto);
        }
    }

    public void desativar(long id) throws SQLException {
        if (id <= 0) {
            throw new IllegalArgumentException("Produto inválido.");
        }
        dao.deactivate(id);
    }

    private BigDecimal decimal(String valor, String campo) {
        try {
            if (valor == null || valor.isBlank()) {
                throw new NumberFormatException();
            }
            return new BigDecimal(valor.trim().replace(",", "."));
        } catch (NumberFormatException e) {
            throw new IllegalArgumentException(campo + " inválido.");
        }
    }
}
