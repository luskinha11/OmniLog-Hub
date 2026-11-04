package br.com.omnilog.view;

import br.com.omnilog.controller.ProductController;
import br.com.omnilog.model.Category;
import br.com.omnilog.model.Product;

import javax.swing.*;
import javax.swing.border.EmptyBorder;
import javax.swing.table.DefaultTableModel;
import java.awt.*;
import java.math.BigDecimal;
import java.sql.SQLException;
import java.util.List;

public class ProductPanel extends JPanel {
    private static final Color BACKGROUND = new Color(13, 10, 20);
    private static final Color PANEL = new Color(27, 20, 39);
    private static final Color PURPLE = new Color(139, 92, 246);
    private static final Color TEXT = new Color(245, 243, 255);
    private static final Color MUTED = new Color(184, 174, 202);

    private final ProductController controller = new ProductController();

    private final JTextField searchField = new JTextField();
    private final JTextField nameField = new JTextField();
    private final JTextField priceField = new JTextField();
    private final JTextField weightField = new JTextField();
    private final JTextArea descriptionField = new JTextArea(3, 20);
    private final JComboBox<Category> categoryBox = new JComboBox<>();

    private final DefaultTableModel tableModel = new DefaultTableModel(
        new Object[]{"ID", "Produto", "Categoria", "Preço", "Peso", "Status"}, 0
    ) {
        @Override
        public boolean isCellEditable(int row, int column) {
            return false;
        }
    };

    private final JTable table = new JTable(tableModel);
    private Long selectedId;

    public ProductPanel() {
        setLayout(new BorderLayout(14, 14));
        setBackground(BACKGROUND);
        setBorder(new EmptyBorder(22, 22, 22, 22));

        add(createHeader(), BorderLayout.NORTH);
        add(createContent(), BorderLayout.CENTER);

        configureTable();
        loadCategories();
        loadProducts("");
        configureSelection();
    }

    private JPanel createHeader() {
        JPanel header = new JPanel(new BorderLayout());
        header.setOpaque(false);

        JPanel titles = new JPanel();
        titles.setOpaque(false);
        titles.setLayout(new BoxLayout(titles, BoxLayout.Y_AXIS));

        JLabel title = new JLabel("Gerenciamento de produtos");
        title.setForeground(TEXT);
        title.setFont(new Font("Segoe UI", Font.BOLD, 25));

        JLabel subtitle = new JLabel("Cadastre, consulte e atualize o catálogo da OmniLog.");
        subtitle.setForeground(MUTED);
        subtitle.setFont(new Font("Segoe UI", Font.PLAIN, 13));

        titles.add(title);
        titles.add(Box.createVerticalStrut(5));
        titles.add(subtitle);

        header.add(titles, BorderLayout.WEST);
        return header;
    }

    private JPanel createContent() {
        JPanel content = new JPanel(new BorderLayout(14, 14));
        content.setOpaque(false);

        JPanel searchPanel = new JPanel(new BorderLayout(8, 0));
        searchPanel.setBackground(PANEL);
        searchPanel.setBorder(new EmptyBorder(12, 12, 12, 12));

        searchField.setBackground(new Color(18, 13, 27));

        searchField.setForeground(new Color(245, 243, 255));

        searchField.setCaretColor(new Color(245, 243, 255));

        searchField.setToolTipText("Pesquisar por produto ou categoria");
        searchField.addActionListener(e -> loadProducts(searchField.getText()));

        JButton searchButton = button("Pesquisar", true);
        searchButton.addActionListener(e -> loadProducts(searchField.getText()));

        JButton refreshButton = button("Atualizar", false);
        refreshButton.addActionListener(e -> {
            searchField.setText("");
            loadProducts("");
        });

        JPanel searchActions = new JPanel(new FlowLayout(FlowLayout.RIGHT, 8, 0));
        searchActions.setOpaque(false);
        searchActions.add(searchButton);
        searchActions.add(refreshButton);

        searchPanel.add(searchField, BorderLayout.CENTER);
        searchPanel.add(searchActions, BorderLayout.EAST);

        JPanel tablePanel = new JPanel(new BorderLayout(0, 8));
        tablePanel.setBackground(PANEL);
        tablePanel.setBorder(new EmptyBorder(14, 14, 14, 14));

        JLabel tableTitle = new JLabel("Produtos cadastrados");
        tableTitle.setForeground(TEXT);
        tableTitle.setFont(new Font("Segoe UI", Font.BOLD, 16));

        JScrollPane scroll = new JScrollPane(table);
        scroll.getViewport().setBackground(PANEL);
        scroll.setBorder(BorderFactory.createLineBorder(new Color(63, 48, 82)));

        tablePanel.add(tableTitle, BorderLayout.NORTH);
        tablePanel.add(scroll, BorderLayout.CENTER);

        JPanel formPanel = createForm();

        content.add(searchPanel, BorderLayout.NORTH);
        content.add(tablePanel, BorderLayout.CENTER);
        content.add(formPanel, BorderLayout.SOUTH);
        return content;
    }

    private JPanel createForm() {
        JPanel form = new JPanel(new GridBagLayout());
        form.setBackground(PANEL);
        form.setBorder(new EmptyBorder(15, 15, 15, 15));

        GridBagConstraints c = new GridBagConstraints();
        c.insets = new Insets(5, 6, 5, 6);
        c.fill = GridBagConstraints.HORIZONTAL;
        c.weightx = 1;

        addField(form, c, 0, 0, "Nome", nameField);
        addField(form, c, 1, 0, "Categoria", categoryBox);
        addField(form, c, 2, 0, "Preço (R$)", priceField);
        addField(form, c, 3, 0, "Peso (kg)", weightField);

        descriptionField.setBackground(new Color(18, 13, 27));

        descriptionField.setForeground(new Color(245, 243, 255));

        descriptionField.setCaretColor(new Color(245, 243, 255));

        descriptionField.setLineWrap(true);
        descriptionField.setWrapStyleWord(true);
        descriptionField.setBackground(new Color(18, 13, 27));
        descriptionField.setForeground(TEXT);
        descriptionField.setCaretColor(TEXT);
        descriptionField.setFont(new Font("Segoe UI", Font.PLAIN, 13));

        c.gridx = 0;
        c.gridy = 1;
        c.gridwidth = 4;
        c.weightx = 1;
        JLabel descriptionLabel = label("Descrição");
        form.add(descriptionLabel, c);

        c.gridy = 2;
        form.add(new JScrollPane(descriptionField), c);

        JPanel actions = new JPanel(new FlowLayout(FlowLayout.RIGHT, 8, 5));
        actions.setOpaque(false);

        JButton newButton = button("Novo", false);
        newButton.addActionListener(e -> clearForm());

        JButton saveButton = button("Salvar produto", true);
        saveButton.addActionListener(e -> saveProduct());

        JButton deactivateButton = button("Desativar selecionado", false);
        deactivateButton.addActionListener(e -> deactivateProduct());

        actions.add(newButton);
        actions.add(saveButton);
        actions.add(deactivateButton);

        c.gridy = 3;
        form.add(actions, c);

        return form;
    }

    private void addField(JPanel panel, GridBagConstraints c,
                          int x, int y, String title, JComponent field) {
        JPanel group = new JPanel(new BorderLayout(0, 5));
        group.setOpaque(false);
        group.add(label(title), BorderLayout.NORTH);
        group.add(field, BorderLayout.CENTER);

        c.gridx = x;
        c.gridy = y;
        c.gridwidth = 1;
        c.weightx = 1;
        panel.add(group, c);
    }

    private JLabel label(String text) {
        JLabel label = new JLabel(text);
        label.setForeground(MUTED);
        label.setFont(new Font("Segoe UI", Font.BOLD, 12));
        return label;
    }

    private JButton button(String text, boolean primary) {
        JButton button = new JButton(text);
        button.setFont(new Font("Segoe UI", Font.BOLD, 12));
        button.setForeground(TEXT);
        button.setBackground(primary ? PURPLE : new Color(66, 49, 86));
        button.setOpaque(true);
        button.setContentAreaFilled(true);
        button.setBorderPainted(false);
        button.setFocusPainted(false);
        button.setBorder(new EmptyBorder(9, 14, 9, 14));
        button.setCursor(Cursor.getPredefinedCursor(Cursor.HAND_CURSOR));
        return button;
    }

    private void configureTable() {
        table.setBackground(new Color(18, 13, 27));
        table.setForeground(TEXT);
        table.setGridColor(new Color(57, 44, 72));
        table.setSelectionBackground(new Color(83, 55, 125));
        table.setSelectionForeground(Color.WHITE);
        table.setRowHeight(27);
        table.setFont(new Font("Segoe UI", Font.PLAIN, 12));
        table.getTableHeader().setBackground(new Color(49, 35, 65));
        table.getTableHeader().setForeground(TEXT);
        table.getTableHeader().setFont(new Font("Segoe UI", Font.BOLD, 12));
        table.setAutoCreateRowSorter(true);
    }

    private void configureSelection() {
        table.getSelectionModel().addListSelectionListener(e -> {
            if (e.getValueIsAdjusting()) return;

            int row = table.getSelectedRow();
            if (row < 0) return;

            int modelRow = table.convertRowIndexToModel(row);
            selectedId = ((Number) tableModel.getValueAt(modelRow, 0)).longValue();

            nameField.setText(String.valueOf(tableModel.getValueAt(modelRow, 1)));
            String categoryName = String.valueOf(tableModel.getValueAt(modelRow, 2));
            selectCategory(categoryName);
            priceField.setText(String.valueOf(tableModel.getValueAt(modelRow, 3)));
            weightField.setText(String.valueOf(tableModel.getValueAt(modelRow, 4)));
        });
    }

    private void selectCategory(String name) {
        for (int i = 0; i < categoryBox.getItemCount(); i++) {
            Category category = categoryBox.getItemAt(i);
            if (category.name().equals(name)) {
                categoryBox.setSelectedIndex(i);
                return;
            }
        }
    }

    private void loadCategories() {
        try {
            categoryBox.removeAllItems();
            List<Category> categories = controller.listarCategorias();
            for (Category category : categories) {
                categoryBox.addItem(category);
            }
        } catch (SQLException e) {
            showError("Não foi possível carregar as categorias.", e);
        }
    }

    private void loadProducts(String search) {
        try {
            tableModel.setRowCount(0);

            for (Product product : controller.listar(search)) {
                tableModel.addRow(new Object[]{
                    product.id(),
                    product.name(),
                    product.categoryName(),
                    product.price(),
                    product.weight(),
                    product.active() ? "Ativo" : "Inativo"
                });
            }
        } catch (SQLException e) {
            showError("Não foi possível carregar os produtos.", e);
        }
    }

    private void saveProduct() {
        try {
            controller.salvar(
                selectedId,
                (Category) categoryBox.getSelectedItem(),
                nameField.getText(),
                descriptionField.getText(),
                priceField.getText(),
                weightField.getText()
            );

            JOptionPane.showMessageDialog(this, "Produto salvo com sucesso!");
            clearForm();
            loadProducts(searchField.getText());
        } catch (SQLException | IllegalArgumentException e) {
            JOptionPane.showMessageDialog(
                this, e.getMessage(), "Erro ao salvar",
                JOptionPane.ERROR_MESSAGE
            );
        }
    }

    private void deactivateProduct() {
        if (selectedId == null) {
            JOptionPane.showMessageDialog(this, "Selecione um produto.");
            return;
        }

        int answer = JOptionPane.showConfirmDialog(
            this,
            "Deseja realmente desativar este produto?",
            "Confirmar desativação",
            JOptionPane.YES_NO_OPTION
        );

        if (answer != JOptionPane.YES_OPTION) return;

        try {
            controller.desativar(selectedId);
            JOptionPane.showMessageDialog(this, "Produto desativado.");
            clearForm();
            loadProducts(searchField.getText());
        } catch (SQLException | IllegalArgumentException e) {
            showError("Não foi possível desativar o produto.", e);
        }
    }

    private void clearForm() {
        selectedId = null;
        table.clearSelection();
        nameField.setText("");
        priceField.setText("");
        weightField.setText("");
        descriptionField.setText("");
        if (categoryBox.getItemCount() > 0) {
            categoryBox.setSelectedIndex(0);
        }
    }

    private void showError(String message, Exception e) {
        JOptionPane.showMessageDialog(
            this,
            message + "\n" + e.getMessage(),
            "OmniLog Hub",
            JOptionPane.ERROR_MESSAGE
        );
    }
}
