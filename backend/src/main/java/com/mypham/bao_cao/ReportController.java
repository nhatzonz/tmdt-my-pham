package com.mypham.bao_cao;

import com.mypham.common.dto.ApiResponse;
import com.mypham.don_hang.Order;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

/**
 * Reports cho admin dashboard — sequence 2.5.9 PDF.
 * 4 endpoint riêng lẻ để FE chỉ load những gì cần (overview cho stat cards
 * dùng chung; các chart load riêng).
 */
@RestController
@RequestMapping("/api/admin/reports")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService service;

    @GetMapping("/overview")
    public ResponseEntity<ApiResponse<OverviewResponse>> overview() {
        return ResponseEntity.ok(ApiResponse.success(service.overview()));
    }

    @GetMapping("/revenue")
    public ResponseEntity<ApiResponse<List<RevenueDayResponse>>> revenue(
            @RequestParam(defaultValue = "30") int days
    ) {
        return ResponseEntity.ok(ApiResponse.success(service.revenueByDay(days)));
    }

    @GetMapping("/top-products")
    public ResponseEntity<ApiResponse<List<TopProductResponse>>> topProducts(
            @RequestParam(defaultValue = "10") int limit
    ) {
        return ResponseEntity.ok(ApiResponse.success(service.topProducts(limit)));
    }

    @GetMapping("/order-status")
    public ResponseEntity<ApiResponse<Map<Order.TrangThai, Long>>> orderStatus() {
        return ResponseEntity.ok(ApiResponse.success(service.orderStatusBreakdown()));
    }
}
