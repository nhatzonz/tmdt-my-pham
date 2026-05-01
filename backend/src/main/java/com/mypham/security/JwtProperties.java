package com.mypham.security;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;

@Getter
@Setter
@ConfigurationProperties(prefix = "app.jwt")
public class JwtProperties {

    private String secret;

    private long accessTokenExpiration = 7L * 24 * 60 * 60 * 1000L;

    private long refreshTokenExpiration = 30L * 24 * 60 * 60 * 1000L;

    private String issuer = "mypham";
}
