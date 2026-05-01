package com.mypham.ton_kho;

import com.mypham.common.dto.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
public class CartController {

    private final InventoryService inventoryService;

    @PostMapping("/add")
    public ResponseEntity<ApiResponse<CartCheckResponse>> add(
            @Valid @RequestBody CartCheckRequest req
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(inventoryService.checkStock(req.sanPhamId(), req.soLuong()))
        );
    }
}
