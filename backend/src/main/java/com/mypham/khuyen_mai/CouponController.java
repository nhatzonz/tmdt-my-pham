package com.mypham.khuyen_mai;

import com.mypham.common.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Public endpoint cho khách xem danh sách mã giảm giá (modal trên /thanh-toan).
 * Trả tất cả mã chưa xoá; FE phân biệt isLive để render disabled vs active.
 */
@RestController
@RequestMapping("/api/coupons")
@RequiredArgsConstructor
public class CouponController {

    private final CouponService couponService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<CouponResponse>>> list() {
        return ResponseEntity.ok(ApiResponse.success(couponService.listPublic()));
    }
}
