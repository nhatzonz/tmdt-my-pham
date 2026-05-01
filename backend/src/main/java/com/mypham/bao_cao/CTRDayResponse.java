package com.mypham.bao_cao;

public record CTRDayResponse(
        String ngay,
        long impressions,
        long clicks,
        double ctr      // 0.0 - 1.0
) {}
