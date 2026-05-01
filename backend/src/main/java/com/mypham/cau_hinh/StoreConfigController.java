package com.mypham.cau_hinh;

import com.mypham.common.dto.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
public class StoreConfigController {

    private final StoreConfigService service;

    /** Public — Footer/Header/Liên hệ đọc cấu hình. */
    @GetMapping("/api/cau-hinh")
    public ResponseEntity<ApiResponse<StoreConfigResponse>> get() {
        return ResponseEntity.ok(ApiResponse.success(service.get()));
    }

    /** Admin update toàn bộ cấu hình. */
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/api/admin/cau-hinh")
    public ResponseEntity<ApiResponse<StoreConfigResponse>> update(
            @Valid @RequestBody StoreConfigRequest req
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                "Đã cập nhật cấu hình cửa hàng",
                service.update(req)));
    }
}
