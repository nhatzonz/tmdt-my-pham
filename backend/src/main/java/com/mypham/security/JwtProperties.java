package com.mypham.security;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Cấu hình JWT đọc từ application.yml (prefix "app.jwt").
 */
@Getter
@Setter
@ConfigurationProperties(prefix = "app.jwt")
public class JwtProperties {

    /** Secret key base64. Tối thiểu 256-bit (32 bytes). */
    private String secret;

    /** Thời gian sống access token (ms). Default 7 ngày — đồ án demo, ưu tiên UX. */
    private long accessTokenExpiration = 7L * 24 * 60 * 60 * 1000L;

    /** Thời gian sống refresh token (ms). Default 30 ngày. */
    private long refreshTokenExpiration = 30L * 24 * 60 * 60 * 1000L;

    /** Issuer ghi vào claim `iss`. */
    private String issuer = "mypham";
}
