package com.mypham.ton_kho;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record InventoryUpdateRequest(
        @NotNull Long sanPhamId,
        @NotNull InventoryAction action,
        @NotNull @Min(0) Integer soLuong
) {}
