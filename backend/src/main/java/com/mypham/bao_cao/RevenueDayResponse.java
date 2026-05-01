package com.mypham.bao_cao;

import java.math.BigDecimal;

public record RevenueDayResponse(
        String ngay,
        BigDecimal tongTien,
        long soDon
) {}
