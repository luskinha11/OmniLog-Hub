package br.com.omnilog.view;

import br.com.omnilog.controller.CustomerController;
import br.com.omnilog.model.Customer;

import javax.swing.*;
import javax.swing.border.EmptyBorder;
import javax.swing.table.DefaultTableModel;
import java.awt.*;
import java.sql.SQLException;

public class CustomerPanel extends JPanel {
    private static final Color BG = new Color(13, 10, 20);
    private static final Color PANEL = new Color(27, 20, 39);
    private static final Color PURPLE = new Color(139, 92, 246);
    private static final Color TEXT = new Color(245, 243, 255);
    private static final Color MUTED = new Color(184, 174, 202);

    private final CustomerController controller = new CustomerController();
    private final JTextField search = new JTextField();
    private final JTextField name = new JTextField();
    private final JTextField email = new JTextField();
    private final JPasswordField password = new JPasswordField();
    private final JTextField cpf = new JTextField();
    private final JTextField phone = new JTextField();
    private final JTextField address = new JTextField();
    private final JTextField city = new JTextField();
    private final JTextField state = new JTextField();
    private final JTextField postal = new JTextField();
    private final DefaultTableModel model = new DefaultTableModel(
        new Object[]{"ID", "Nome", "E-mail", "CPF", "Telefone", "Cidade", "Conta"}, 0
    ) {
        @Override public boolean isCellEditable(int row, int col) { return false; }
    };
    private final JTable table = new JTable(model);
    private Customer selected;

    public CustomerPanel() {
        setLayout(new BorderLayout(12, 12));
        setBackground(BG);
        setBorder(new EmptyBorder(20, 20, 20, 20));

        JLabel title = new JLabel("Gerenciamento de clientes");
        title.setForeground(TEXT);
        title.setFont(new Font("Segoe UI", Font.BOLD, 24));

        JPanel top = new JPanel(new BorderLayout(8, 8));
        top.setOpaque(false);
        top.add(title, BorderLayout.NORTH);
        top.add(searchBar(), BorderLayout.SOUTH);

        styleTable();
        JScrollPane scroll = new JScrollPane(table);
        scroll.getViewport().setBackground(PANEL);
        scroll.setBorder(BorderFactory.createLineBorder(new Color(63, 48, 82)));

        add(top, BorderLayout.NORTH);
        add(scroll, BorderLayout.CENTER);
        add(form(), BorderLayout.SOUTH);

        table.getSelectionModel().addListSelectionListener(e -> {
            if (e.getValueIsAdjusting()) return;
            int row = table.getSelectedRow();
            if (row < 0) return;
            int r = table.convertRowIndexToModel(row);
            long id = ((Number) model.getValueAt(r, 0)).longValue();
            try {
                for (Customer c : controller.listar("")) {
                    if (c.id() == id) {
                        selected = c;
                        fill(c);
                        break;
                    }
                }
            } catch (SQLException ex) {
                error("Falha ao selecionar cliente.", ex);
            }
        });

        refresh("");
    }

    private JPanel searchBar() {
        JPanel p = new JPanel(new BorderLayout(8, 0));
        p.setBackground(PANEL);
        p.setBorder(new EmptyBorder(10, 10, 10, 10));
        search.addActionListener(e -> refresh(search.getText()));
        p.add(search, BorderLayout.CENTER);
        JButton b = button("Pesquisar", true);
        b.addActionListener(e -> refresh(search.getText()));
        p.add(b, BorderLayout.EAST);
        return p;
    }

    private JPanel form() {
        JPanel p = new JPanel(new GridLayout(0, 3, 8, 7));
        p.setBackground(PANEL);
        p.setBorder(new EmptyBorder(12, 12, 12, 12));

        p.add(field("Nome completo", name));
        p.add(field("E-mail de acesso", email));
        p.add(field("Senha (obrigatória ao criar)", password));
        p.add(field("CPF", cpf));
        p.add(field("Telefone", phone));
        p.add(field("Endereço", address));
        p.add(field("Cidade", city));
        p.add(field("UF", state));
        p.add(field("CEP", postal));

        JPanel actions = new JPanel(new FlowLayout(FlowLayout.RIGHT));
        actions.setOpaque(false);

        JButton clear = button("Novo", false);
        clear.addActionListener(e -> clearForm());

        JButton save = button("Salvar cliente", true);
        save.addActionListener(e -> save());

        JButton deactivate = button("Desativar conta", false);
        deactivate.addActionListener(e -> deactivate());

        actions.add(clear);
        actions.add(save);
        actions.add(deactivate);

        JPanel wrapper = new JPanel(new BorderLayout());
        wrapper.setOpaque(false);
        wrapper.add(p, BorderLayout.CENTER);
        wrapper.add(actions, BorderLayout.SOUTH);
        return wrapper;
    }

    private JPanel field(String title, JComponent input) {
        JPanel p = new JPanel(new BorderLayout(0, 4));
        p.setOpaque(false);
        JLabel label = new JLabel(title);
        label.setForeground(MUTED);
        label.setFont(new Font("Segoe UI", Font.BOLD, 11));
        p.add(label, BorderLayout.NORTH);
        p.add(input, BorderLayout.CENTER);
        input.setFont(new Font("Segoe UI", Font.PLAIN, 12));
        input.setBackground(new Color(18, 13, 27));
        input.setForeground(new Color(245, 243, 255));
        return p;
    }

    private JButton button(String text, boolean primary) {
        JButton b = new JButton(text);
        b.setBackground(primary ? PURPLE : new Color(66, 49, 86));
        b.setForeground(TEXT);
        b.setOpaque(true);
        b.setContentAreaFilled(true);
        b.setBorderPainted(false);
        b.setFocusPainted(false);
        b.setBorder(new EmptyBorder(8, 12, 8, 12));
        return b;
    }

    private void styleTable() {
        table.setBackground(new Color(18, 13, 27));
        table.setForeground(TEXT);
        table.setSelectionBackground(new Color(83, 55, 125));
        table.setSelectionForeground(Color.WHITE);
        table.setGridColor(new Color(57, 44, 72));
        table.setRowHeight(25);
        table.getTableHeader().setBackground(new Color(49, 35, 65));
        table.getTableHeader().setForeground(TEXT);
        table.setAutoCreateRowSorter(true);
    }

    private void refresh(String term) {
        model.setRowCount(0);
        try {
            for (Customer c : controller.listar(term)) {
                model.addRow(new Object[]{
                    c.id(), c.name(), c.email(), c.cpf(), c.phone(),
                    c.city(), c.active() ? "Ativa" : "Inativa"
                });
            }
        } catch (SQLException e) {
            error("Não foi possível carregar os clientes.", e);
        }
    }

    private void fill(Customer c) {
        name.setText(c.name());
        email.setText(c.email());
        cpf.setText(c.cpf() == null ? "" : c.cpf());
        phone.setText(c.phone() == null ? "" : c.phone());
        address.setText(c.address() == null ? "" : c.address());
        city.setText(c.city() == null ? "" : c.city());
        state.setText(c.state() == null ? "" : c.state());
        postal.setText(c.postalCode() == null ? "" : c.postalCode());
        password.setText("");
    }

    private void save() {
        try {
            Customer c = new Customer(
                selected == null ? 0 : selected.id(),
                selected == null ? 0 : selected.userId(),
                name.getText().trim(),
                email.getText().trim(),
                cpf.getText().trim(),
                phone.getText().trim(),
                address.getText().trim(),
                city.getText().trim(),
                state.getText().trim().toUpperCase(),
                postal.getText().trim(),
                selected == null || selected.active()
            );

            controller.salvar(c, new String(password.getPassword()));
            JOptionPane.showMessageDialog(this, "Cliente salvo com sucesso!");
            clearForm();
            refresh(search.getText());
        } catch (SQLException | IllegalArgumentException e) {
            error("Não foi possível salvar o cliente.", e);
        }
    }

    private void deactivate() {
        if (selected == null) {
            JOptionPane.showMessageDialog(this, "Selecione um cliente.");
            return;
        }
        int choice = JOptionPane.showConfirmDialog(
            this, "Desativar a conta deste cliente?", "Confirmar",
            JOptionPane.YES_NO_OPTION
        );
        if (choice != JOptionPane.YES_OPTION) return;

        try {
            controller.desativar(selected.id());
            JOptionPane.showMessageDialog(this, "Conta desativada.");
            clearForm();
            refresh(search.getText());
        } catch (SQLException e) {
            error("Não foi possível desativar a conta.", e);
        }
    }

    private void clearForm() {
        selected = null;
        table.clearSelection();
        for (JTextField f : new JTextField[]{
            name, email, cpf, phone, address, city, state, postal
        }) f.setText("");
        password.setText("");
    }

    private void error(String message, Exception e) {
        JOptionPane.showMessageDialog(
            this, message + "\n" + e.getMessage(),
            "OmniLog Hub", JOptionPane.ERROR_MESSAGE
        );
    }
}
