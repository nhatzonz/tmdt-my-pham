package com.mypham.ai;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;

@Getter
@Setter
@ConfigurationProperties(prefix = "app.ai")
public class AIProperties {
    private String serviceUrl = "http://localhost:8000";

    private boolean ingestOnProductChange = true;

    private int timeoutMs = 30_000;
}
