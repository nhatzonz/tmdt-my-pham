package com.mypham.realtime;

import com.mypham.khuyen_mai.Coupon;
import com.mypham.khuyen_mai.CouponResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

/**
 * Broadcast event mã giảm giá tới /topic/coupons.
 * FE subscribe để cập nhật UI realtime (modal /thanh-toan + admin list).
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class CouponEventPublisher {

    public enum EventType {
        CREATED,
        UPDATED,
        DELETED,
        USED,        // checkout +1 daSuDung
        RESTORED     // huỷ đơn -1 daSuDung
    }

    public record CouponEvent(
            EventType type,
            Long couponId,
            CouponResponse coupon  // null nếu DELETED hard
    ) {}

    private static final String TOPIC = "/topic/coupons";

    private final SimpMessagingTemplate messaging;

    public void publish(EventType type, Coupon c) {
        CouponResponse payload = c == null ? null : CouponResponse.from(c);
        Long id = c == null ? null : c.getId();
        try {
            messaging.convertAndSend(TOPIC, new CouponEvent(type, id, payload));
        } catch (Exception ex) {
            log.warn("Không gửi được event {} cho coupon id={}: {}", type, id, ex.getMessage());
        }
    }

    public void publishDeleted(Long id) {
        try {
            messaging.convertAndSend(TOPIC, new CouponEvent(EventType.DELETED, id, null));
        } catch (Exception ex) {
            log.warn("Không gửi được event DELETED cho coupon id={}: {}", id, ex.getMessage());
        }
    }
}
