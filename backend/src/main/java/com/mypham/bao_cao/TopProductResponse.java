package com.mypham.bao_cao;

import java.math.BigDecimal;

/** 1 sản phẩm bán chạy — dùng cho BarChart top sp. */
public record TopProductResponse(
        Long sanPhamId,
        String tenSanPham,
        String maSanPham,
        String hinhAnh,
        long soLuongDaBan,
        BigDecimal doanhThu
) {}
