package com.mypham.ton_kho;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record CartCheckRequest(
        @NotNull Long sanPhamId,
        @Min(1) int soLuong
) {}
