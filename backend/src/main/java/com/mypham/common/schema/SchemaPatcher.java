package com.mypham.common.schema;

import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class SchemaPatcher {

    private final JdbcTemplate jdbc;

    @PostConstruct
    public void patch() {

        runQuiet("ALTER TABLE khuyen_mai DROP CONSTRAINT IF EXISTS khuyen_mai_status_check");
        runQuiet("ALTER TABLE khuyen_mai ADD CONSTRAINT khuyen_mai_status_check "
                + "CHECK (status IN ('ACTIVE','INACTIVE','HIDDEN'))");
    }

    private void runQuiet(String sql) {
        try {
            jdbc.execute(sql);
            log.info("Schema patch: {}", sql);
        } catch (Exception ex) {
            log.warn("Schema patch failed (skip): {} — {}", sql, ex.getMessage());
        }
    }
}
