package com.mypham.realtime;

import com.mypham.khuyen_mai.Coupon;
import com.mypham.khuyen_mai.CouponResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class CouponEventPublisher {

    public enum EventType {
        CREATED,
        UPDATED,
        DELETED,
        USED,
        RESTORED
    }

    public record CouponEvent(
            EventType type,
            Long couponId,
            CouponResponse coupon
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
