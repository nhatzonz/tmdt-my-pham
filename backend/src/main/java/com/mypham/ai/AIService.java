package com.mypham.ai;

import com.fasterxml.jackson.databind.JsonNode;
import com.mypham.auth.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Map;

/**
 * Service AI — tên method khớp Class Diagram PDF §2.8:
 *   - analyzeUserBehavior(User)
 *   - getRecommendations(User)
 * Forward sang FastAPI service. BE chỉ là proxy + IDOR check.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AIService {

    private final AIClient client;

    /** PDF Class Diagram — placeholder phân tích behavior, hiện trả gợi ý.
     *  Sau này có thể dùng cho admin AI dashboard. */
    public JsonNode analyzeUserBehavior(User user) {
        return getRecommendations(user);
    }

    /** UC 2.5.5 — gợi ý sản phẩm cá nhân hoá theo lịch sử mua. */
    public JsonNode getRecommendations(User user) {
        return client.get("/recommend/" + user.getId() + "?limit=6");
    }

    public JsonNode getRecommendationsForUserId(Long userId, int limit) {
        return client.get("/recommend/" + userId + "?limit=" + limit);
    }

    public JsonNode getSimilarProducts(Long productId, int limit) {
        return client.get("/similar/" + productId + "?limit=" + limit);
    }

    public JsonNode chat(Map<String, Object> req) {
        return client.post("/chat", req);
    }
}
