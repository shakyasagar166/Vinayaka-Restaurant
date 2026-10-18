package com.vinayaka.restaurant.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;

@Component
public class DatabaseSchemaFixer implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(DatabaseSchemaFixer.class);

    @Autowired(required = false)
    private JdbcTemplate jdbcTemplate;

    @Override
    public void run(ApplicationArguments args) {
        if (jdbcTemplate == null) {
            log.warn("JdbcTemplate not available, skipping schema fixer");
            return;
        }

        try {
            log.info("Running DatabaseSchemaFixer for customer_orders table...");

            // 1. Direct ALTER TABLE queries to guarantee defaults for known columns
            String[] commonFixes = {
                "ALTER TABLE customer_orders MODIFY COLUMN subtotal DECIMAL(10,2) DEFAULT 0.00",
                "ALTER TABLE customer_orders MODIFY COLUMN order_type VARCHAR(50) DEFAULT 'DINE_IN'",
                "ALTER TABLE customer_orders MODIFY COLUMN tax DECIMAL(10,2) DEFAULT 0.00",
                "ALTER TABLE customer_orders MODIFY COLUMN discount DECIMAL(10,2) DEFAULT 0.00"
            };

            for (String sql : commonFixes) {
                try {
                    jdbcTemplate.execute(sql);
                    log.info("Schema fix executed: {}", sql);
                } catch (Exception ignored) {}
            }

            // 2. Query information_schema to find ANY column in customer_orders that has NO default and is NOT NULL
            try {
                String checkSql = "SELECT COLUMN_NAME, IS_NULLABLE, COLUMN_DEFAULT, DATA_TYPE " +
                                  "FROM information_schema.COLUMNS " +
                                  "WHERE TABLE_NAME = 'customer_orders'";
                List<Map<String, Object>> columns = jdbcTemplate.queryForList(checkSql);

                for (Map<String, Object> col : columns) {
                    String colName = String.valueOf(col.get("COLUMN_NAME"));
                    String isNullable = String.valueOf(col.get("IS_NULLABLE"));
                    Object colDefault = col.get("COLUMN_DEFAULT");
                    String dataType = String.valueOf(col.get("DATA_TYPE"));

                    log.info("customer_orders column: {} (type={}, nullable={}, default={})", colName, dataType, isNullable, colDefault);

                    boolean isEssential = "id".equalsIgnoreCase(colName) ||
                                          "order_number".equalsIgnoreCase(colName) ||
                                          "table_number".equalsIgnoreCase(colName) ||
                                          "customer_name".equalsIgnoreCase(colName);

                    if (!isEssential && "NO".equalsIgnoreCase(isNullable) && colDefault == null) {
                        try {
                            String alterSql = "ALTER TABLE customer_orders MODIFY COLUMN `" + colName + "` " + dataType + " NULL";
                            jdbcTemplate.execute(alterSql);
                            log.info("Relaxed NOT NULL constraint on column '{}': {}", colName, alterSql);
                        } catch (Exception alterEx) {
                            log.warn("Could not relax NOT NULL for column '{}': {}", colName, alterEx.getMessage());
                        }
                    }
                }
            } catch (Exception ex) {
                log.warn("Information schema check skipped: {}", ex.getMessage());
            }

        } catch (Exception e) {
            log.error("DatabaseSchemaFixer encountered an error: {}", e.getMessage());
        }
    }
}
