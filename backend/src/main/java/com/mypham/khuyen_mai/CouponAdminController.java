package com.mypham.khuyen_mai;

import com.mypham.common.dto.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/coupons")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class CouponAdminController {

    private final CouponService couponService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<CouponResponse>>> list() {
        return ResponseEntity.ok(ApiResponse.success(couponService.listAdmin()));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<CouponResponse>> create(
            @Valid @RequestBody CouponRequest req
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created(couponService.create(req)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<CouponResponse>> update(
            @PathVariable Long id,
            @Valid @RequestBody CouponRequest req
    ) {
        return ResponseEntity.ok(ApiResponse.success(couponService.update(id, req)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        couponService.delete(id);
        return ResponseEntity.ok(ApiResponse.success("Đã xoá", null));
    }
}
