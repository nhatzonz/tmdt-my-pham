package com.mypham.bao_cao;

import java.math.BigDecimal;

public record TopProductResponse(
        Long sanPhamId,
        String tenSanPham,
        String maSanPham,
        String hinhAnh,
        long soLuongDaBan,
        BigDecimal doanhThu
) {}
