package com.mypham.realtime;

import com.mypham.ton_kho.InventoryAdminResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class InventoryEventPublisher {

    public enum EventType {
        UPDATED,
        THRESHOLD
    }

    public record InventoryEvent(EventType type, Long sanPhamId, InventoryAdminResponse row) {}

    private static final String TOPIC = "/topic/inventory";

    private final SimpMessagingTemplate messaging;

    public void publish(EventType type, InventoryAdminResponse row) {
        if (row == null) return;
        try {
            messaging.convertAndSend(TOPIC, new InventoryEvent(type, row.sanPhamId(), row));
        } catch (Exception ex) {
            log.warn("Không gửi được event {} cho sanPhamId={}: {}", type, row.sanPhamId(), ex.getMessage());
        }
    }
}
