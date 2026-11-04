package br.com.omnilog.config;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.HashMap;
import java.util.Map;

public final class Env {
    private static final Map<String, String> VALUES = load();

    private Env() {}

    private static Map<String, String> load() {
        Map<String, String> values = new HashMap<>();
        Path file = Path.of(".env");

        if (!Files.exists(file)) {
            return values;
        }

        try {
            for (String line : Files.readAllLines(file)) {
                String trimmed = line.trim();

                if (trimmed.isEmpty() || trimmed.startsWith("#")) {
                    continue;
                }

                int separator = trimmed.indexOf('=');
                if (separator < 1) {
                    continue;
                }

                String key = trimmed.substring(0, separator).trim();
                String value = trimmed.substring(separator + 1).trim();

                if (value.length() >= 2) {
                    char first = value.charAt(0);
                    char last = value.charAt(value.length() - 1);

                    if ((first == '"' && last == '"') ||
                        (first == '\'' && last == '\'')) {
                        value = value.substring(1, value.length() - 1);
                    }
                }

                values.put(key, value);
            }
        } catch (IOException e) {
            throw new IllegalStateException("Não foi possível ler o arquivo .env.", e);
        }

        return values;
    }

    public static String get(String key) {
        String value = VALUES.get(key);

        if (value == null || value.isBlank()) {
            value = System.getenv(key);
        }

        if (value == null || value.isBlank()) {
            throw new IllegalStateException(
                "Configuração " + key + " não encontrada no .env."
            );
        }

        return value;
    }
}
