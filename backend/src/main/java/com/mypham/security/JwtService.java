package com.mypham.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Arrays;
import java.util.Date;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class JwtService {

    private static final String COMMITTED_DEFAULT_SECRET =
            "dGhpc19pc19hX3ZlcnlfbG9uZ19zZWNyZXRfa2V5X2Zvcl9kZXZlbG9wbWVudF9vbmx5Xzg0MjM=";

    private final JwtProperties props;
    private final Environment env;

    @PostConstruct
    void validateSecret() {
        String secret = props.getSecret();
        if (secret == null || secret.isBlank()) {
            throw new IllegalStateException(
                    "app.jwt.secret chưa cấu hình — đặt biến môi trường JWT_SECRET");
        }
        List<String> profiles = Arrays.asList(env.getActiveProfiles());
        boolean isDev = profiles.isEmpty() || profiles.contains("dev");
        if (!isDev && COMMITTED_DEFAULT_SECRET.equals(secret)) {
            throw new IllegalStateException(
                    "app.jwt.secret đang dùng giá trị default đã commit — "
                            + "PROFILE=" + profiles + " yêu cầu secret riêng (đặt biến môi trường JWT_SECRET).");
        }
        if (!isDev) {
            log.info("JwtService secret OK (profile={}, length={})", profiles, secret.length());
        }
    }

    private SecretKey key() {
        return Keys.hmacShaKeyFor(Decoders.BASE64.decode(props.getSecret()));
    }

    public String generateAccessToken(String subject, Map<String, Object> claims) {
        return buildToken(subject, claims, props.getAccessTokenExpiration());
    }

    public String generateRefreshToken(String subject) {
        return buildToken(subject, Map.of("type", "refresh"), props.getRefreshTokenExpiration());
    }

    private String buildToken(String subject, Map<String, Object> claims, long ttlMs) {
        Date now = new Date();
        return Jwts.builder()
                .subject(subject)
                .issuer(props.getIssuer())
                .issuedAt(now)
                .expiration(new Date(now.getTime() + ttlMs))
                .claims(claims)
                .signWith(key(), Jwts.SIG.HS256)
                .compact();
    }

    public Claims parse(String token) {
        return Jwts.parser()
                .verifyWith(key())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public boolean isValid(String token) {
        try {
            parse(token);
            return true;
        } catch (JwtException | IllegalArgumentException ex) {
            log.debug("JWT invalid: {}", ex.getMessage());
            return false;
        }
    }

    public String extractSubject(String token) {
        return parse(token).getSubject();
    }
}
