package com.mypham.khuyen_mai;

import com.mypham.common.exception.BusinessException;
import com.mypham.common.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CouponService {

    private final CouponRepository couponRepository;

    /**
     * Plan §2.3 sequence 2.5.8 — Class diagram method `isValid()`.
     * Trả null nếu chuỗi rỗng (đơn không dùng coupon).
     * Throw BusinessException nếu mã sai/hết hạn/inactive.
     */
    @Transactional(readOnly = true)
    public Coupon findValid(String maCode) {
        if (maCode == null || maCode.isBlank()) return null;
        String code = maCode.trim().toUpperCase();
        Optional<Coupon> opt = couponRepository.findByMaCode(code);
        if (opt.isEmpty()) {
            throw new BusinessException(ErrorCode.COUPON_INVALID, "Mã giảm giá không tồn tại");
        }
        Coupon c = opt.get();
        if (!"ACTIVE".equalsIgnoreCase(c.getStatus())) {
            throw new BusinessException(ErrorCode.COUPON_INVALID, "Mã giảm giá đã ngừng hoạt động");
        }
        Instant now = Instant.now();
        if (c.getStartAt().isAfter(now) || c.getEndAt().isBefore(now)) {
            throw new BusinessException(ErrorCode.COUPON_INVALID, "Mã giảm giá hết hạn");
        }
        return c;
    }
}
