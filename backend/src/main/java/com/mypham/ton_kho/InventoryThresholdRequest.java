package com.mypham.ton_kho;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record InventoryThresholdRequest(
        @NotNull Long sanPhamId,
        @NotNull @Min(0) Integer nguongCanhBao
) {}
