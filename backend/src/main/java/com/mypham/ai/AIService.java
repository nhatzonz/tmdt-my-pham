package com.mypham.ai;

import com.fasterxml.jackson.databind.JsonNode;
import com.mypham.auth.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class AIService {

    private final AIClient client;

    public JsonNode analyzeUserBehavior(User user) {
        return getRecommendations(user);
    }

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
