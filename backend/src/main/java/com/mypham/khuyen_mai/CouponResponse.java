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
        Integer soLuong,
        Integer daSuDung,
        Integer conLai,
        boolean isLive
) {
    public static CouponResponse from(Coupon c) {
        Instant now = Instant.now();
        Integer total = c.getSoLuong();
        Integer used = c.getDaSuDung() == null ? 0 : c.getDaSuDung();
        Integer conLai = total == null ? null : Math.max(0, total - used);
        boolean withinPeriod = !c.getStartAt().isAfter(now) && !c.getEndAt().isBefore(now);
        boolean stillAvailable = total == null || conLai > 0;
        boolean live = c.getStatus() == Coupon.Status.ACTIVE && withinPeriod && stillAvailable;
        return new CouponResponse(
                c.getId(),
                c.getMaCode(),
                c.getPhanTramGiam(),
                c.getStartAt(),
                c.getEndAt(),
                c.getStatus() == null ? null : c.getStatus().name(),
                total,
                used,
                conLai,
                live);
    }
}
