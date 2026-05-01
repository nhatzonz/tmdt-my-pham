package com.mypham.don_hang;

import com.mypham.common.dto.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/orders")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class OrderAdminController {

    private final OrderService orderService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<AdminOrderResponse>>> list(
            @RequestParam(required = false) Order.TrangThai status
    ) {
        return ResponseEntity.ok(ApiResponse.success(orderService.listAdmin(status)));
    }

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<Map<Order.TrangThai, Long>>> stats() {
        return ResponseEntity.ok(ApiResponse.success(orderService.countByStatus()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<AdminOrderResponse>> detail(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(orderService.getAdminById(id)));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<ApiResponse<AdminOrderResponse>> updateStatus(
            Authentication auth,
            @PathVariable Long id,
            @Valid @RequestBody OrderStatusRequest req
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                orderService.updateStatus(id, req.trangThai(), auth.getName())));
    }
}
