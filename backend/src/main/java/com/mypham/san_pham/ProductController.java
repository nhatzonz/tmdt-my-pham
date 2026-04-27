package com.mypham.san_pham;

import com.mypham.common.dto.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Admin CRUD sản phẩm (plan Tuần 7, sequence 2.5.6).
 * UC 2.3.3: validate loai_da bắt buộc (xem ProductRequest).
 */
@RestController
@RequestMapping("/api/admin/products")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    @PostMapping
    public ResponseEntity<ApiResponse<ProductResponse>> create(@Valid @RequestBody ProductRequest req) {
        ProductResponse result = productService.create(req);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.created(result));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ProductResponse>> update(
            @PathVariable Long id,
            @Valid @RequestBody ProductRequest req
    ) {
        return ResponseEntity.ok(ApiResponse.success(productService.update(id, req)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        productService.delete(id);
        return ResponseEntity.ok(ApiResponse.success("Đã xoá", null));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<ProductResponse>>> list() {
        return ResponseEntity.ok(ApiResponse.success(productService.list()));
    }
}
