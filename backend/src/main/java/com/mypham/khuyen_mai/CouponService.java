package com.mypham.khuyen_mai;

import com.mypham.common.exception.BusinessException;
import com.mypham.common.exception.ErrorCode;
import com.mypham.common.exception.ResourceNotFoundException;
import com.mypham.don_hang.OrderRepository;
import com.mypham.realtime.CouponEventPublisher;
import com.mypham.realtime.CouponEventPublisher.EventType;
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
    private final OrderRepository orderRepository;
    private final CouponEventPublisher events;

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
        if (c.getSoLuong() != null) {
            int used = c.getDaSuDung() == null ? 0 : c.getDaSuDung();
            if (used >= c.getSoLuong()) {
                throw new BusinessException(ErrorCode.COUPON_INVALID, "Mã giảm giá đã hết lượt sử dụng");
            }
        }
        return c;
    }

    @Transactional
    public void incrementUsed(Long couponId) {
        Coupon c = couponRepository.findById(couponId).orElse(null);
        if (c == null) return;
        c.setDaSuDung((c.getDaSuDung() == null ? 0 : c.getDaSuDung()) + 1);
        Coupon saved = couponRepository.save(c);
        events.publish(EventType.USED, saved);
    }

    @Transactional
    public void decrementUsed(Long couponId) {
        Coupon c = couponRepository.findById(couponId).orElse(null);
        if (c == null) return;
        int used = c.getDaSuDung() == null ? 0 : c.getDaSuDung();
        c.setDaSuDung(Math.max(0, used - 1));
        Coupon saved = couponRepository.save(c);
        events.publish(EventType.RESTORED, saved);
    }

    @Transactional(readOnly = true)
    public List<CouponResponse> listPublic() {
        return couponRepository.findAll().stream()
                .filter(c -> c.getStatus() != Coupon.Status.HIDDEN)
                .sorted((a, b) -> Long.compare(b.getId(), a.getId()))
                .map(CouponResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<CouponResponse> listAdmin() {

        return couponRepository.findAll().stream()
                .filter(c -> c.getStatus() != Coupon.Status.HIDDEN)
                .sorted((a, b) -> Long.compare(b.getId(), a.getId()))
                .map(CouponResponse::from)
                .toList();
    }

    @Transactional
    public CouponResponse create(CouponRequest req) {
        validatePeriod(req);
        String code = req.maCode().trim().toUpperCase();

        Optional<Coupon> existing = couponRepository.findByMaCode(code);
        if (existing.isPresent() && existing.get().getStatus() != Coupon.Status.HIDDEN) {
            throw new BusinessException(ErrorCode.VALIDATION_FAILED, "Mã đã tồn tại");
        }
        Coupon c = new Coupon();
        c.setMaCode(code);
        c.setPhanTramGiam(req.phanTramGiam());
        c.setStartAt(req.startAt());
        c.setEndAt(req.endAt());
        c.setStatus(normalizeStatus(req.status()));
        c.setSoLuong(req.soLuong());
        c.setDaSuDung(0);

        if (existing.isPresent() && existing.get().getStatus() == Coupon.Status.HIDDEN) {
            Coupon old = existing.get();
            old.setMaCode("__deleted_" + old.getId() + "_" + old.getMaCode());
            couponRepository.saveAndFlush(old);
        }
        Coupon saved = couponRepository.save(c);
        events.publish(EventType.CREATED, saved);
        return CouponResponse.from(saved);
    }

    @Transactional
    public CouponResponse update(Long id, CouponRequest req) {
        validatePeriod(req);
        Coupon c = couponRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("mã giảm giá", id));
        if (c.getStatus() == Coupon.Status.HIDDEN) {
            throw new ResourceNotFoundException("mã giảm giá", id);
        }
        String newCode = req.maCode().trim().toUpperCase();
        if (!c.getMaCode().equalsIgnoreCase(newCode)) {
            Optional<Coupon> dup = couponRepository.findByMaCode(newCode);
            if (dup.isPresent() && dup.get().getStatus() != Coupon.Status.HIDDEN
                    && !dup.get().getId().equals(c.getId())) {
                throw new BusinessException(ErrorCode.VALIDATION_FAILED, "Mã đã tồn tại");
            }

            if (dup.isPresent() && dup.get().getStatus() == Coupon.Status.HIDDEN
                    && !dup.get().getId().equals(c.getId())) {
                Coupon old = dup.get();
                old.setMaCode("__deleted_" + old.getId() + "_" + old.getMaCode());
                couponRepository.saveAndFlush(old);
            }
        }

        if (req.soLuong() != null && c.getDaSuDung() != null
                && req.soLuong() < c.getDaSuDung()) {
            throw new BusinessException(
                    ErrorCode.VALIDATION_FAILED,
                    "Số lượng mới không được nhỏ hơn số lượng đã dùng (" + c.getDaSuDung() + ")");
        }
        c.setMaCode(newCode);
        c.setPhanTramGiam(req.phanTramGiam());
        c.setStartAt(req.startAt());
        c.setEndAt(req.endAt());
        c.setStatus(normalizeStatus(req.status()));
        c.setSoLuong(req.soLuong());
        Coupon saved = couponRepository.save(c);
        events.publish(EventType.UPDATED, saved);
        return CouponResponse.from(saved);
    }

    @Transactional
    public void delete(Long id) {
        Coupon c = couponRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("mã giảm giá", id));
        if (orderRepository.existsByKhuyenMaiId(id)) {
            c.setStatus(Coupon.Status.HIDDEN);
            couponRepository.save(c);
            events.publishDeleted(id);
            return;
        }
        couponRepository.delete(c);
        events.publishDeleted(id);
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
