package com.mypham.ai;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Configuration;
import org.springframework.stereotype.Component;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.Map;

/**
 * HTTP client gọi FastAPI AI service. Dùng JDK 21 java.net.http (không thêm dep mới).
 * Trả thẳng JsonNode để controller tự forward — tránh map chi tiết schema có thể đổi.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class AIClient {

    private final AIProperties props;
    private final ObjectMapper mapper = new ObjectMapper();

    private HttpClient http() {
        // Force HTTP/1.1 — uvicorn h11 không hỗ trợ HTTP/2 h2c upgrade,
        // nếu để default HTTP_2 thì body request bị drop ở upgrade handshake.
        return HttpClient.newBuilder()
                .version(HttpClient.Version.HTTP_1_1)
                .connectTimeout(Duration.ofSeconds(5))
                .build();
    }

    public JsonNode get(String path) {
        return send("GET", path, null);
    }

    public JsonNode post(String path, Object body) {
        return send("POST", path, body);
    }

    /** Fire-and-forget — dùng cho ingest async, không block product save. */
    public void postAsync(String path, Object body) {
        java.util.concurrent.CompletableFuture.runAsync(() -> {
            try {
                send("POST", path, body);
            } catch (Exception ex) {
                log.warn("[AI async] {} failed: {}", path, ex.getMessage());
            }
        });
    }

    private JsonNode send(String method, String path, Object body) {
        URI uri = URI.create(props.getServiceUrl() + path);
        HttpRequest.Builder req = HttpRequest.newBuilder(uri)
                .timeout(Duration.ofMillis(props.getTimeoutMs()))
                .header("Content-Type", "application/json")
                .header("Accept", "application/json");

        if ("GET".equals(method)) {
            req.GET();
        } else {
            try {
                String payload = body == null ? "{}" : mapper.writeValueAsString(body);
                HttpRequest.BodyPublisher pub = HttpRequest.BodyPublishers.ofString(
                        payload, java.nio.charset.StandardCharsets.UTF_8);
                if ("POST".equals(method)) {
                    req.POST(pub);
                } else {
                    req.method(method, pub);
                }
                log.debug("[AI {}] {} payload={}", method, path, payload);
            } catch (Exception e) {
                throw new AIServiceException("Lỗi serialize payload", e);
            }
        }

        try {
            HttpResponse<String> res = http().send(req.build(), HttpResponse.BodyHandlers.ofString());
            if (res.statusCode() >= 400) {
                throw new AIServiceException(
                        "AI service trả lỗi " + res.statusCode() + ": " + res.body());
            }
            return mapper.readTree(res.body());
        } catch (java.net.http.HttpConnectTimeoutException
                 | java.net.ConnectException e) {
            throw new AIServiceException(
                    "Không kết nối được AI service tại " + props.getServiceUrl(), e);
        } catch (Exception e) {
            if (e instanceof AIServiceException) throw (AIServiceException) e;
            throw new AIServiceException("Lỗi gọi AI service: " + e.getMessage(), e);
        }
    }

    @Configuration
    @EnableConfigurationProperties(AIProperties.class)
    static class Config {
    }

    public static class AIServiceException extends RuntimeException {
        public AIServiceException(String msg) {
            super(msg);
        }

        public AIServiceException(String msg, Throwable cause) {
            super(msg, cause);
        }
    }

    /** Helper build ingest payload (gọi từ ProductService hook). */
    public Map<String, Object> ingestPayload(
            Long sanPhamId,
            String tenSanPham,
            String moTa,
            String loaiDa,
            String thuongHieu,
            String danhMuc
    ) {
        var m = new java.util.HashMap<String, Object>();
        m.put("sanPhamId", sanPhamId);
        m.put("tenSanPham", tenSanPham);
        if (moTa != null) m.put("moTa", moTa);
        if (loaiDa != null) m.put("loaiDa", loaiDa);
        if (thuongHieu != null) m.put("thuongHieu", thuongHieu);
        if (danhMuc != null) m.put("danhMuc", danhMuc);
        return m;
    }
}
