package br.com.omnilog;

import br.com.omnilog.view.CustomerPanel;
import br.com.omnilog.view.EmployeePanel;
import br.com.omnilog.view.ProductPanel;

import javax.swing.*;
import javax.swing.plaf.basic.BasicTabbedPaneUI;
import java.awt.*;

public class App {
    private static final Color BG = new Color(13, 10, 20);
    private static final Color PANEL = new Color(27, 20, 39);
    private static final Color PURPLE = new Color(139, 92, 246);
    private static final Color PURPLE_DARK = new Color(52, 37, 72);
    private static final Color WHITE = new Color(245, 243, 255);
    private static final Color MUTED = new Color(184, 174, 202);

    private static void configureTheme() {
        UIManager.put("Panel.background", BG);
        UIManager.put("TabbedPane.background", BG);
        UIManager.put("TabbedPane.foreground", WHITE);
        UIManager.put("TabbedPane.selected", PURPLE);
        UIManager.put("TabbedPane.contentAreaColor", BG);
        UIManager.put("TabbedPane.unselectedBackground", PURPLE_DARK);
        UIManager.put("TabbedPane.focus", PURPLE);
        UIManager.put("Button.background", PURPLE);
        UIManager.put("Button.foreground", WHITE);
        UIManager.put("Button.select", PURPLE);
        UIManager.put("OptionPane.background", PANEL);
        UIManager.put("OptionPane.messageForeground", WHITE);
        UIManager.put("TextField.background", BG);
        UIManager.put("TextField.foreground", WHITE);
        UIManager.put("TextArea.background", BG);
        UIManager.put("TextArea.foreground", WHITE);
        UIManager.put("ComboBox.background", BG);
        UIManager.put("ComboBox.foreground", WHITE);
    }

    public static void main(String[] args) {
        SwingUtilities.invokeLater(() -> {
            try {
                UIManager.setLookAndFeel(
                    UIManager.getSystemLookAndFeelClassName()
                );
            } catch (Exception ignored) {
                // Mantém o tema padrão.
            }

            configureTheme();

            JFrame frame = new JFrame(
                "OmniLog Hub | Operações Corporativas"
            );

            frame.setDefaultCloseOperation(JFrame.DISPOSE_ON_CLOSE);
            frame.setMinimumSize(new Dimension(1050, 720));
            frame.setSize(1280, 850);
            frame.setLocationRelativeTo(null);

            JTabbedPane tabs = new JTabbedPane();
            tabs.setFont(new Font("Segoe UI", Font.BOLD, 14));
            tabs.setBackground(BG);
            tabs.setForeground(WHITE);
            tabs.setOpaque(true);
            tabs.setFocusable(false);
            tabs.setTabLayoutPolicy(JTabbedPane.SCROLL_TAB_LAYOUT);

            // Força as cores das abas, independentemente do Windows.
            tabs.setUI(new BasicTabbedPaneUI() {
                @Override
                protected void paintTabBackground(
                    Graphics g,
                    int placement,
                    int index,
                    int x,
                    int y,
                    int width,
                    int height,
                    boolean selected
                ) {
                    g.setColor(selected ? PURPLE : PURPLE_DARK);
                    g.fillRect(x, y, width, height);
                }

                @Override
                protected void paintTabBorder(
                    Graphics g,
                    int placement,
                    int index,
                    int x,
                    int y,
                    int width,
                    int height,
                    boolean selected
                ) {
                    g.setColor(selected ? PURPLE : new Color(75, 57, 96));
                    g.drawRect(x, y, width, height);
                }

                @Override
                protected void paintText(
                    Graphics g,
                    int placement,
                    Font font,
                    FontMetrics metrics,
                    int index,
                    String title,
                    Rectangle textRect,
                    boolean selected
                ) {
                    g.setFont(font);
                    g.setColor(selected ? WHITE : MUTED);

                    int baseline = textRect.y + metrics.getAscent();
                    g.drawString(title, textRect.x, baseline);
                }
            });

            tabs.addTab("Produtos", new ProductPanel());
            tabs.addTab("Clientes", new CustomerPanel());
            tabs.addTab("Funcionários", new EmployeePanel());

            JPanel root = new JPanel(new BorderLayout());
            root.setBackground(BG);

            JLabel heading = new JLabel(
                "  OMNILOG HUB  |  PAINEL CORPORATIVO"
            );

            heading.setOpaque(true);
            heading.setBackground(PANEL);
            heading.setForeground(PURPLE);
            heading.setFont(new Font("Segoe UI", Font.BOLD, 18));
            heading.setBorder(
                BorderFactory.createEmptyBorder(16, 12, 16, 12)
            );

            root.add(heading, BorderLayout.NORTH);
            root.add(tabs, BorderLayout.CENTER);

            frame.setContentPane(root);
            frame.setVisible(true);
        });
    }
}
