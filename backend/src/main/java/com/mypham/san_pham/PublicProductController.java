package com.mypham.san_pham;

import com.mypham.common.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class PublicProductController {

    private final ProductService productService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<ProductResponse>>> list(
            @RequestParam(required = false) List<Long> danhMucId,
            @RequestParam(required = false) List<Product.LoaiDa> loaiDa,
            @RequestParam(required = false) List<String> thuongHieu,
            @RequestParam(required = false) java.math.BigDecimal priceMin,
            @RequestParam(required = false) java.math.BigDecimal priceMax,
            @RequestParam(required = false) String sort
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(
                        productService.listPublic(danhMucId, loaiDa, thuongHieu, priceMin, priceMax, sort)
                )
        );
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
