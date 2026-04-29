package com.mypham.don_hang;

import com.mypham.common.dto.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Plan §2.3 sequence 2.5.4:
 * - POST /api/orders/checkout
 * - GET  /api/orders/me
 * - GET  /api/orders/{id}
 */
@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @PostMapping("/checkout")
    public ResponseEntity<ApiResponse<OrderResponse>> checkout(
            Authentication auth,
            @Valid @RequestBody CheckoutRequest req
    ) {
        OrderResponse result = orderService.createOrder(auth.getName(), req);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.created(result));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<List<OrderResponse>>> mine(Authentication auth) {
        return ResponseEntity.ok(ApiResponse.success(orderService.getMine(auth.getName())));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<OrderResponse>> detail(
            Authentication auth,
            @PathVariable Long id
    ) {
        return ResponseEntity.ok(ApiResponse.success(orderService.getById(id, auth.getName())));
    }
}
