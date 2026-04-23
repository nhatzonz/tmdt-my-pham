package com.mypham.ping;

import com.mypham.common.dto.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.Map;

@Tag(name = "System", description = "Healthcheck & system info")
@RestController
@RequestMapping("/api")
public class PingController {

    @Operation(summary = "Healthcheck", description = "Kiểm tra backend có sống không")
    @GetMapping("/ping")
    public ApiResponse<Map<String, Object>> ping() {
        return ApiResponse.success(Map.of(
                "status", "UP",
                "service", "mypham-backend",
                "timestamp", Instant.now()
        ));
    }
}
