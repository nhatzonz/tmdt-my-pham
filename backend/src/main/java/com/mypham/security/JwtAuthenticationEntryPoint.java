package com.mypham.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.mypham.common.dto.ApiResponse;
import com.mypham.common.exception.ErrorCode;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.time.Instant;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationEntryPoint implements AuthenticationEntryPoint {

    private final ObjectMapper objectMapper;

    @Override
    public void commence(HttpServletRequest request,
                         HttpServletResponse response,
                         AuthenticationException authException) throws IOException {
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding("UTF-8");

        ApiResponse<Object> body = new ApiResponse<>(
                401,
                ErrorCode.UNAUTHORIZED.getDefaultMessage(),
                Map.of("errorCode", ErrorCode.UNAUTHORIZED.getCode()),
                Instant.now()
        );
        objectMapper.writeValue(response.getOutputStream(), body);
    }
}
