package com.mypham.ton_kho;

import com.mypham.common.dto.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/inventory")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class InventoryAdminController {

    private final InventoryService inventoryService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<InventoryAdminResponse>>> list() {
        return ResponseEntity.ok(ApiResponse.success(inventoryService.listAdmin()));
    }

    @PostMapping("/update")
    public ResponseEntity<ApiResponse<InventoryAdminResponse>> update(
            Authentication auth,
            @Valid @RequestBody InventoryUpdateRequest req
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(inventoryService.update(req, auth.getName()))
        );
    }

    @PostMapping("/threshold")
    public ResponseEntity<ApiResponse<InventoryAdminResponse>> threshold(
            @Valid @RequestBody InventoryThresholdRequest req
    ) {
        return ResponseEntity.ok(ApiResponse.success(inventoryService.updateThreshold(req)));
    }

    @GetMapping("/history")
    public ResponseEntity<ApiResponse<List<InventoryHistoryResponse>>> history(
            @RequestParam(required = false) Long sanPhamId
    ) {
        return ResponseEntity.ok(ApiResponse.success(inventoryService.listHistory(sanPhamId)));
    }
}
