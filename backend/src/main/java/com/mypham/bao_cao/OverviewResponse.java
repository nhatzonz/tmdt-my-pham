package com.mypham.bao_cao;

import java.math.BigDecimal;

public record OverviewResponse(

        BigDecimal doanhThu30Ngay,
        BigDecimal doanhThuHomNay,
        long donCompleted30Ngay,

        long donPending,
        long donShipping,
        long donCancelled30Ngay,

        long spHetHang,
        long spCanhBao,

        long tongSanPham,
        long tongDanhMuc,
        long tongUser,
        long tongCouponHoatDong
) {}
