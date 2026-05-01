package com.mypham.realtime;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

import java.util.Arrays;

/**
 * STOMP-over-WebSocket cho broadcast realtime.
 * - Endpoint: /ws (client connect)
 * - Broker: /topic/* (BE đẩy event xuống FE)
 * Hiện chỉ dùng cho /topic/coupons — sự kiện thay đổi mã giảm giá.
 */
@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Value("${app.cors.allowed-origins:http://localhost:3000}")
    private String allowedOrigins;

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        // /topic/* → simple in-memory broker (đủ cho 1 instance)
        config.enableSimpleBroker("/topic");
        // FE muốn gửi gì sẽ prefix /app (hiện không dùng)
        config.setApplicationDestinationPrefixes("/app");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        String[] origins = Arrays.stream(allowedOrigins.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .toArray(String[]::new);
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns(origins.length == 0 ? new String[]{"*"} : origins);
    }
}
