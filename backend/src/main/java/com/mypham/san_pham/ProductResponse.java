package com.mypham.san_pham;

import java.math.BigDecimal;

public record ProductResponse(
        Long id,
        String tenSanPham,
        BigDecimal gia,
        Product.LoaiDa loaiDa,
        Long danhMucId,
        String moTa,
        String thuongHieu,
        String hinhAnh,
        Product.TrangThai trangThai
) {
    public static ProductResponse from(Product p) {
        return new ProductResponse(
                p.getId(),
                p.getTenSanPham(),
                p.getGia(),
                p.getLoaiDa(),
                p.getDanhMucId(),
                p.getMoTa(),
                p.getThuongHieu(),
                p.getHinhAnh(),
                p.getTrangThai()
        );
    }
}
