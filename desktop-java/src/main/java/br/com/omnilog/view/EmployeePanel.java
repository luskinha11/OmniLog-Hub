package br.com.omnilog.view;

import br.com.omnilog.controller.EmployeeController;
import br.com.omnilog.model.Employee;

import javax.swing.*;
import javax.swing.border.EmptyBorder;
import javax.swing.table.DefaultTableModel;
import java.awt.*;
import java.sql.SQLException;

public class EmployeePanel extends JPanel {
    private static final Color BG = new Color(13, 10, 20);
    private static final Color PANEL = new Color(27, 20, 39);
    private static final Color PURPLE = new Color(139, 92, 246);
    private static final Color TEXT = new Color(245, 243, 255);
    private static final Color MUTED = new Color(184, 174, 202);

    private final EmployeeController controller = new EmployeeController();
    private final JTextField search = new JTextField();
    private final JTextField name = new JTextField();
    private final JTextField position = new JTextField();

    private final DefaultTableModel model = new DefaultTableModel(
        new Object[]{"ID", "Nome", "Cargo", "Criado em"}, 0
    ) {
        @Override public boolean isCellEditable(int row, int col) { return false; }
    };

    private final JTable table = new JTable(model);
    private long selectedId;

    public EmployeePanel() {
        setLayout(new BorderLayout(12, 12));
        setBackground(BG);
        setBorder(new EmptyBorder(20, 20, 20, 20));

        JLabel title = new JLabel("Gerenciamento de funcionários");
        title.setForeground(TEXT);
        title.setFont(new Font("Segoe UI", Font.BOLD, 24));

        JPanel top = new JPanel(new BorderLayout(8, 8));
        top.setOpaque(false);
        top.add(title, BorderLayout.NORTH);

        JPanel searchPanel = new JPanel(new BorderLayout(8, 0));
        searchPanel.setBackground(PANEL);
        searchPanel.setBorder(new EmptyBorder(10, 10, 10, 10));
        search.addActionListener(e -> refresh(search.getText()));

        JButton find = button("Pesquisar", true);
        find.addActionListener(e -> refresh(search.getText()));
        searchPanel.add(search, BorderLayout.CENTER);
        searchPanel.add(find, BorderLayout.EAST);
        top.add(searchPanel, BorderLayout.SOUTH);

        table.setBackground(new Color(18, 13, 27));
        table.setForeground(TEXT);
        table.setSelectionBackground(new Color(83, 55, 125));
        table.setSelectionForeground(Color.WHITE);
        table.setGridColor(new Color(57, 44, 72));
        table.setRowHeight(27);
        table.getTableHeader().setBackground(new Color(49, 35, 65));
        table.getTableHeader().setForeground(TEXT);
        table.setAutoCreateRowSorter(true);

        JScrollPane scroll = new JScrollPane(table);
        scroll.getViewport().setBackground(PANEL);

        JPanel form = new JPanel(new GridLayout(1, 2, 10, 8));
        form.setBackground(PANEL);
        form.setBorder(new EmptyBorder(14, 14, 14, 14));
        form.add(field("Nome completo", name));
        form.add(field("Cargo / função", position));

        JPanel actions = new JPanel(new FlowLayout(FlowLayout.RIGHT));
        actions.setOpaque(false);

        JButton clear = button("Novo", false);
        clear.addActionListener(e -> clearForm());

        JButton save = button("Salvar funcionário", true);
        save.addActionListener(e -> save());

        JButton delete = button("Excluir selecionado", false);
        delete.addActionListener(e -> delete());

        actions.add(clear);
        actions.add(save);
        actions.add(delete);

        JPanel bottom = new JPanel(new BorderLayout());
        bottom.setOpaque(false);
        bottom.add(form, BorderLayout.CENTER);
        bottom.add(actions, BorderLayout.SOUTH);

        add(top, BorderLayout.NORTH);
        add(scroll, BorderLayout.CENTER);
        add(bottom, BorderLayout.SOUTH);

        table.getSelectionModel().addListSelectionListener(e -> {
            if (e.getValueIsAdjusting()) return;
            int row = table.getSelectedRow();
            if (row < 0) return;
            int r = table.convertRowIndexToModel(row);
            selectedId = ((Number) model.getValueAt(r, 0)).longValue();
            name.setText(String.valueOf(model.getValueAt(r, 1)));
            position.setText(String.valueOf(model.getValueAt(r, 2)));
        });

        refresh("");
    }

    private JPanel field(String title, JTextField input) {
        JPanel panel = new JPanel(new BorderLayout(0, 5));
        panel.setOpaque(false);
        JLabel label = new JLabel(title);
        label.setForeground(MUTED);
        label.setFont(new Font("Segoe UI", Font.BOLD, 12));
        panel.add(label, BorderLayout.NORTH);
        panel.add(input, BorderLayout.CENTER);
        return panel;
    }

    private JButton button(String text, boolean primary) {
        JButton b = new JButton(text);
        b.setBackground(primary ? PURPLE : new Color(66, 49, 86));
        b.setForeground(TEXT);
        b.setOpaque(true);
        b.setContentAreaFilled(true);
        b.setBorderPainted(false);
        b.setFocusPainted(false);
        b.setBorder(new EmptyBorder(9, 13, 9, 13));
        return b;
    }

    private void refresh(String term) {
        model.setRowCount(0);
        try {
            for (Employee e : controller.listar(term)) {
                model.addRow(new Object[]{
                    e.id(), e.name(), e.position(), e.createdAt()
                });
            }
        } catch (SQLException e) {
            error("Não foi possível carregar os funcionários.", e);
        }
    }

    private void save() {
        try {
            controller.salvar(selectedId, name.getText(), position.getText());
            JOptionPane.showMessageDialog(this, "Funcionário salvo com sucesso!");
            clearForm();
            refresh(search.getText());
        } catch (SQLException | IllegalArgumentException e) {
            error("Não foi possível salvar o funcionário.", e);
        }
    }

    private void delete() {
        if (selectedId <= 0) {
            JOptionPane.showMessageDialog(this, "Selecione um funcionário.");
            return;
        }
        int choice = JOptionPane.showConfirmDialog(
            this, "Deseja excluir este funcionário?", "Confirmar exclusão",
            JOptionPane.YES_NO_OPTION
        );
        if (choice != JOptionPane.YES_OPTION) return;

        try {
            controller.excluir(selectedId);
            JOptionPane.showMessageDialog(this, "Funcionário excluído.");
            clearForm();
            refresh(search.getText());
        } catch (SQLException e) {
            error(
                "Não foi possível excluir. O funcionário pode estar vinculado a outra operação.",
                e
            );
        }
    }

    private void clearForm() {
        selectedId = 0;
        table.clearSelection();
        name.setText("");
        position.setText("");
    }

    private void error(String message, Exception e) {
        JOptionPane.showMessageDialog(
            this, message + "\n" + e.getMessage(),
            "OmniLog Hub", JOptionPane.ERROR_MESSAGE
        );
    }
}
