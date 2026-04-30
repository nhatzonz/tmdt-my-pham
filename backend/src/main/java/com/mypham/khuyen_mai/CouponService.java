package com.mypham.khuyen_mai;

import com.mypham.common.exception.BusinessException;
import com.mypham.common.exception.ErrorCode;
import com.mypham.common.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
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
        if (c.getStatus() != Coupon.Status.ACTIVE) {
            throw new BusinessException(ErrorCode.COUPON_INVALID, "Mã giảm giá đã ngừng hoạt động");
        }
        Instant now = Instant.now();
        if (c.getStartAt().isAfter(now) || c.getEndAt().isBefore(now)) {
            throw new BusinessException(ErrorCode.COUPON_INVALID, "Mã giảm giá hết hạn");
        }
        return c;
    }

    // ---------- Admin CRUD ----------

    @Transactional(readOnly = true)
    public List<CouponResponse> listAdmin() {
        return couponRepository.findAll().stream()
                .sorted((a, b) -> Long.compare(b.getId(), a.getId()))
                .map(CouponResponse::from)
                .toList();
    }

    @Transactional
    public CouponResponse create(CouponRequest req) {
        validatePeriod(req);
        String code = req.maCode().trim().toUpperCase();
        if (couponRepository.findByMaCode(code).isPresent()) {
            throw new BusinessException(ErrorCode.VALIDATION_FAILED, "Mã đã tồn tại");
        }
        Coupon c = new Coupon();
        c.setMaCode(code);
        c.setPhanTramGiam(req.phanTramGiam());
        c.setStartAt(req.startAt());
        c.setEndAt(req.endAt());
        c.setStatus(normalizeStatus(req.status()));
        return CouponResponse.from(couponRepository.save(c));
    }

    @Transactional
    public CouponResponse update(Long id, CouponRequest req) {
        validatePeriod(req);
        Coupon c = couponRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("mã giảm giá", id));
        String newCode = req.maCode().trim().toUpperCase();
        if (!c.getMaCode().equalsIgnoreCase(newCode)
                && couponRepository.findByMaCode(newCode).isPresent()) {
            throw new BusinessException(ErrorCode.VALIDATION_FAILED, "Mã đã tồn tại");
        }
        c.setMaCode(newCode);
        c.setPhanTramGiam(req.phanTramGiam());
        c.setStartAt(req.startAt());
        c.setEndAt(req.endAt());
        c.setStatus(normalizeStatus(req.status()));
        return CouponResponse.from(couponRepository.save(c));
    }

    @Transactional
    public void delete(Long id) {
        if (!couponRepository.existsById(id)) {
            throw new ResourceNotFoundException("mã giảm giá", id);
        }
        couponRepository.deleteById(id);
    }

    private void validatePeriod(CouponRequest req) {
        if (!req.endAt().isAfter(req.startAt())) {
            throw new BusinessException(
                    ErrorCode.VALIDATION_FAILED,
                    "Ngày kết thúc phải sau ngày bắt đầu");
        }
    }

    private Coupon.Status normalizeStatus(String s) {
        if (s == null || s.isBlank()) return Coupon.Status.ACTIVE;
        try {
            return Coupon.Status.valueOf(s.trim().toUpperCase());
        } catch (IllegalArgumentException ex) {
            throw new BusinessException(
                    ErrorCode.VALIDATION_FAILED,
                    "Trạng thái phải là ACTIVE hoặc INACTIVE");
        }
    }
}
