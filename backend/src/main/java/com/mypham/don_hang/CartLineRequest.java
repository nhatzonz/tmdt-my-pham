package com.mypham.don_hang;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record CartLineRequest(
        @NotNull Long sanPhamId,
        @Min(1) int soLuong
) {}
