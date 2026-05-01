package com.mypham.ai;

import com.fasterxml.jackson.databind.JsonNode;
import com.mypham.auth.User;
import com.mypham.auth.UserRepository;
import com.mypham.common.dto.ApiResponse;
import com.mypham.common.exception.BusinessException;
import com.mypham.common.exception.ErrorCode;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Plan §2.5.5 — endpoint AI cho FE.
 * Tất cả endpoint forward sang FastAPI. BE chỉ làm:
 *  - IDOR check (user chỉ xem recommendations của chính họ)
 *  - Track click trên goi_y_ai → tính CTR
 *  - Authentication (chat/recommend optional auth)
 */
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class AIController {

    private final AIService service;
    private final GoiYAIRepository goiYAIRepository;
    private final UserRepository userRepository;

    /** POST /api/ai/chat — chatbot RAG. Cho phép cả guest. */
    @PostMapping("/ai/chat")
    public ResponseEntity<ApiResponse<JsonNode>> chat(
            Authentication auth,
            @Valid @RequestBody ChatRequestBody req
    ) {
        Map<String, Object> body = new HashMap<>();
        body.put("message", req.message());
        if (req.sessionId() != null) body.put("sessionId", req.sessionId());
        // IDOR: chỉ truyền userId nếu auth thật
        if (auth != null) {
            userRepository.findByEmail(auth.getName())
                    .filter(u -> u.getTrangThai() == User.TrangThai.ACTIVE)
                    .ifPresent(u -> body.put("userId", u.getId()));
        }
        return ResponseEntity.ok(ApiResponse.success(service.chat(body)));
    }

    /** GET /api/recommendations/{userId} — gợi ý cá nhân hoá. IDOR: chỉ chính chủ. */
    @GetMapping("/recommendations/{userId}")
    public ResponseEntity<ApiResponse<JsonNode>> recommendForUser(
            Authentication auth,
            @PathVariable Long userId,
            @RequestParam(defaultValue = "6") int limit
    ) {
        if (auth == null) {
            throw new BusinessException(ErrorCode.UNAUTHORIZED);
        }
        User u = userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new BusinessException(ErrorCode.UNAUTHORIZED));
        // Admin xem được mọi user; user thường chỉ xem chính mình
        if (u.getVaiTro() != User.Role.ADMIN && !u.getId().equals(userId)) {
            throw new BusinessException(ErrorCode.FORBIDDEN);
        }
        return ResponseEntity.ok(ApiResponse.success(
                service.getRecommendationsForUserId(userId, limit)));
    }

    /** GET /api/products/{id}/similar — sản phẩm tương tự (public). */
    @GetMapping("/products/{id}/similar")
    public ResponseEntity<ApiResponse<JsonNode>> similar(
            @PathVariable Long id,
            @RequestParam(defaultValue = "4") int limit
    ) {
        return ResponseEntity.ok(ApiResponse.success(service.getSimilarProducts(id, limit)));
    }

    /**
     * POST /api/ai/click — tracking khi user click vào sản phẩm gợi ý.
     * Mark da_click=true trên impression mới nhất của user×sp.
     */
    @PostMapping("/ai/click")
    @Transactional
    public ResponseEntity<ApiResponse<Void>> trackClick(
            Authentication auth,
            @Valid @RequestBody ClickTrackingRequest req
    ) {
        Long userId = null;
        if (auth != null) {
            userId = userRepository.findByEmail(auth.getName())
                    .map(User::getId)
                    .orElse(null);
        }
        List<GoiYAI> recent = goiYAIRepository.findRecentImpression(userId, req.sanPhamId());
        // Mark impression gần nhất chưa click
        for (GoiYAI g : recent) {
            if (g.getNguon() != req.nguon()) continue;
            if (Boolean.TRUE.equals(g.getDaClick())) continue;
            g.setDaClick(true);
            goiYAIRepository.save(g);
            break;
        }
        return ResponseEntity.ok(ApiResponse.success("Đã ghi nhận", null));
    }
}
