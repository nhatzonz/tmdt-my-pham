package com.mypham.don_hang;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

/**
 * Admin view: thêm thông tin khách hàng so với OrderResponse cho khách.
 */
public record AdminOrderResponse(
        Long id,
        Long nguoiDungId,
        String khachHoTen,
        String khachEmail,
        String khachSoDienThoai,
        BigDecimal tongTien,
        Order.TrangThai trangThai,
        String diaChiGiao,
        String phuongThucTt,
        String maCoupon,
        BigDecimal phanTramGiam,
        Instant createdAt,
        List<OrderLineResponse> items,
        int soLuongMon
) {}
