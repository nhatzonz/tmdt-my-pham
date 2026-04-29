package com.mypham.khuyen_mai;

import java.math.BigDecimal;
import java.time.Instant;

public record CouponResponse(
        Long id,
        String maCode,
        BigDecimal phanTramGiam,
        Instant startAt,
        Instant endAt,
        String status,
        boolean isLive   // status==ACTIVE && now ∈ [startAt, endAt]
) {
    public static CouponResponse from(Coupon c) {
        Instant now = Instant.now();
        boolean live = "ACTIVE".equalsIgnoreCase(c.getStatus())
                && !c.getStartAt().isAfter(now)
                && !c.getEndAt().isBefore(now);
        return new CouponResponse(
                c.getId(),
                c.getMaCode(),
                c.getPhanTramGiam(),
                c.getStartAt(),
                c.getEndAt(),
                c.getStatus(),
                live);
    }
}
