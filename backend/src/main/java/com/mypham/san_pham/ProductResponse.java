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
        Product.TrangThai trangThai,
        Integer soLuongTon,
        boolean hetHang
) {
    public static ProductResponse from(Product p, List<String> images) {
        return from(p, images, null);
    }

    public static ProductResponse from(Product p, List<String> images, Integer soLuongTon) {
        int ton = soLuongTon == null ? 0 : soLuongTon;
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
                p.getTrangThai(),
                ton,
                ton <= 0
        );
    }
}
