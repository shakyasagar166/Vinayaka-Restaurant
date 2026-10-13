package com.vinayaka.restaurant.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.jdbc.DataSourceBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import javax.sql.DataSource;
import java.net.URI;

@Configuration
public class DataSourceConfig {

    @Value("${spring.datasource.url:}")
    private String configuredUrl;

    @Value("${spring.datasource.username:}")
    private String configuredUsername;

    @Value("${spring.datasource.password:}")
    private String configuredPassword;

    @Bean
    @Primary
    public DataSource dataSource() {
        // Check for Neon / Render standard DATABASE_URL environment variable
        String envDatabaseUrl = System.getenv("DATABASE_URL");
        if (envDatabaseUrl == null || envDatabaseUrl.trim().isEmpty()) {
            envDatabaseUrl = System.getenv("SPRING_DATASOURCE_URL");
        }

        if (envDatabaseUrl != null && (envDatabaseUrl.startsWith("postgres://") || envDatabaseUrl.startsWith("postgresql://"))) {
            try {
                // Parse Neon format: postgresql://username:password@hostname:port/database?sslmode=require
                URI uri = new URI(envDatabaseUrl.replace("postgresql://", "http://").replace("postgres://", "http://"));

                String userInfo = uri.getUserInfo();
                String username = configuredUsername;
                String password = configuredPassword;

                if (userInfo != null && userInfo.contains(":")) {
                    String[] parts = userInfo.split(":", 2);
                    username = parts[0];
                    password = parts[1];
                }

                int port = uri.getPort() > 0 ? uri.getPort() : 5432;
                String path = uri.getPath();
                if (path != null && path.startsWith("/")) {
                    path = path.substring(1);
                }

                String query = uri.getQuery();
                String queryParam = (query != null && !query.isEmpty()) ? "?" + query : "?sslmode=require";
                if (!queryParam.contains("sslmode")) {
                    queryParam += (queryParam.contains("?") ? "&" : "?") + "sslmode=require";
                }

                String jdbcUrl = "jdbc:postgresql://" + uri.getHost() + ":" + port + "/" + path + queryParam;

                System.out.println("🚀 [Neon PostgreSQL] Connecting to Neon Database at: " + uri.getHost());

                return DataSourceBuilder.create()
                        .driverClassName("org.postgresql.Driver")
                        .url(jdbcUrl)
                        .username(username)
                        .password(password)
                        .build();

            } catch (Exception e) {
                System.err.println("⚠️ Could not parse DATABASE_URL as Neon URI: " + e.getMessage());
            }
        }

        // Standard JDBC connection (MySQL or JDBC PostgreSQL URL)
        String finalUrl = configuredUrl;
        if (finalUrl == null || finalUrl.trim().isEmpty()) {
            finalUrl = "jdbc:mysql://localhost:3306/vinayaka_restaurant_db?createDatabaseIfNotExist=true&useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true";
        }

        String driverClass = "com.mysql.cj.jdbc.Driver";
        if (finalUrl.startsWith("jdbc:postgresql:")) {
            driverClass = "org.postgresql.Driver";
        }

        return DataSourceBuilder.create()
                .driverClassName(driverClass)
                .url(finalUrl)
                .username(configuredUsername)
                .password(configuredPassword)
                .build();
    }
}
