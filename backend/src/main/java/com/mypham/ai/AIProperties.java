package com.mypham.ai;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;

@Getter
@Setter
@ConfigurationProperties(prefix = "app.ai")
public class AIProperties {
    /** URL của FastAPI service. */
    private String serviceUrl = "http://localhost:8000";

    /** Có gọi ingest sau khi tạo/sửa sản phẩm không. */
    private boolean ingestOnProductChange = true;

    /** Timeout cho HTTP call sang AI service (ms). */
    private int timeoutMs = 30_000;
}
