package com.mypham.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.mypham.common.dto.ApiResponse;
import com.mypham.common.exception.ErrorCode;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.time.Instant;
import java.util.Map;

/**
 * Trả về JSON chuẩn khi user đã xác thực nhưng không đủ quyền (role).
 * Ví dụ CUSTOMER gọi /api/admin/* → 403 JSON thay vì HTML mặc định.
 */
@Component
@RequiredArgsConstructor
public class JwtAccessDeniedHandler implements AccessDeniedHandler {

    private final ObjectMapper objectMapper;

    @Override
    public void handle(HttpServletRequest request,
                       HttpServletResponse response,
                       AccessDeniedException ex) throws IOException {
        response.setStatus(HttpServletResponse.SC_FORBIDDEN);
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding("UTF-8");

        ApiResponse<Object> body = new ApiResponse<>(
                403,
                ErrorCode.FORBIDDEN.getDefaultMessage(),
                Map.of("errorCode", ErrorCode.FORBIDDEN.getCode()),
                Instant.now()
        );
        objectMapper.writeValue(response.getOutputStream(), body);
    }
}
