package com.mypham.san_pham;

import com.mypham.common.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Public product API (plan §2.3 sequence 2.5.2).
 */
@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class PublicProductController {

    private final ProductService productService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<ProductResponse>>> list(
            @RequestParam(required = false) Long danhMucId,
            @RequestParam(required = false) Product.LoaiDa loaiDa
    ) {
        return ResponseEntity.ok(ApiResponse.success(productService.listPublic(danhMucId, loaiDa)));
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<ProductResponse>>> search(
            @RequestParam(required = false, defaultValue = "") String q
    ) {
        return ResponseEntity.ok(ApiResponse.success(productService.search(q)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ProductResponse>> detail(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(productService.getById(id)));
    }
}
