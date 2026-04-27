package com.mypham.san_pham;

import java.math.BigDecimal;
import java.util.List;

public record ProductResponse(
        Long id,
        String maSanPham,
        String tenSanPham,
        BigDecimal gia,
        Product.LoaiDa loaiDa,
        Long danhMucId,
        String moTa,
        String thuongHieu,
        List<String> hinhAnh,
        Product.TrangThai trangThai
) {
    public static ProductResponse from(Product p, List<String> images) {
        return new ProductResponse(
                p.getId(),
                p.getMaSanPham(),
                p.getTenSanPham(),
                p.getGia(),
                p.getLoaiDa(),
                p.getDanhMucId(),
                p.getMoTa(),
                p.getThuongHieu(),
                images == null ? List.of() : images,
                p.getTrangThai()
        );
    }
}
