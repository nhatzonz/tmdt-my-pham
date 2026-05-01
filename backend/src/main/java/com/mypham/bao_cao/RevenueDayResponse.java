package com.mypham.bao_cao;

import java.math.BigDecimal;

/** 1 ngày — dùng cho LineChart doanh thu. */
public record RevenueDayResponse(
        String ngay,        // 'YYYY-MM-DD' theo timezone Asia/Ho_Chi_Minh
        BigDecimal tongTien,
        long soDon
) {}
