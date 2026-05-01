package com.mypham.san_pham;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.util.List;

public record ProductRequest(
        @Size(max = 50) String maSanPham,
        @NotBlank @Size(min = 2, max = 255) String tenSanPham,
        @NotNull @DecimalMin(value = "0.0", inclusive = false) BigDecimal gia,
        @NotNull(message = "Loại da bắt buộc (input AI)") Product.LoaiDa loaiDa,
        @NotNull Long danhMucId,
        String moTa,
        @Size(max = 100) String thuongHieu,
        List<String> hinhAnh
) {}
