package com.mypham.don_hang;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public record OrderResponse(
        Long id,
        Long nguoiDungId,
        BigDecimal tongTien,
        Order.TrangThai trangThai,
        String diaChiGiao,
        String phuongThucTt,
        String maCoupon,
        BigDecimal phanTramGiam,
        Instant createdAt,
        List<OrderLineResponse> items
) {}
