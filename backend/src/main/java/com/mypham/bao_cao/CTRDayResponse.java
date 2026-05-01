package com.mypham.bao_cao;

public record CTRDayResponse(
        String ngay,
        long impressions,
        long clicks,
        double ctr
) {}
