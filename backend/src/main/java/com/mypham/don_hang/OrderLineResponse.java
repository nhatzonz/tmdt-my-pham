package com.mypham.don_hang;

import java.math.BigDecimal;

public record OrderLineResponse(
        Long id,
        Long sanPhamId,
        String tenSanPham,
        String hinhAnh,
        Integer soLuong,
        BigDecimal giaBan,
        BigDecimal lineTotal
) {}
