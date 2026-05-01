package com.mypham.bao_cao;

import java.math.BigDecimal;

/**
 * Tổng quan dashboard admin — tất cả số liệu cần cho 4 stat card top.
 * Gọi 1 endpoint duy nhất thay vì spam nhiều request.
 */
public record OverviewResponse(
        // Doanh thu (chỉ tính đơn COMPLETED)
        BigDecimal doanhThu30Ngay,
        BigDecimal doanhThuHomNay,
        long donCompleted30Ngay,

        // Đơn theo trạng thái hiện tại
        long donPending,
        long donShipping,
        long donCancelled30Ngay,

        // Tồn kho cảnh báo (snapshot hiện tại)
        long spHetHang,
        long spCanhBao,

        // Tổng quan
        long tongSanPham,
        long tongDanhMuc,
        long tongUser,
        long tongCouponHoatDong
) {}
