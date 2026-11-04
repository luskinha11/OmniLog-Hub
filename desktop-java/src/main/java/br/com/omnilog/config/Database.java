package br.com.omnilog.config;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.util.Properties;

public final class Database {
    private Database() {}

    public static Connection getConnection() throws SQLException {
        String host = Env.get("DB_HOST");
        String port = Env.get("DB_PORT");
        String database = Env.get("DB_NAME");
        String url = "jdbc:mysql://" + host + ":" + port + "/" + database
            + "?useSSL=false&allowPublicKeyRetrieval=true"
            + "&serverTimezone=America/Sao_Paulo&characterEncoding=UTF-8";

        Properties properties = new Properties();
        properties.setProperty("user", Env.get("DB_USER"));
        properties.setProperty("password", Env.get("DB_PASSWORD"));

        return DriverManager.getConnection(url, properties);
    }
}
