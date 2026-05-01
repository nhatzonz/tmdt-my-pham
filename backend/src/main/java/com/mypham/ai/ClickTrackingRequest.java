package com.mypham.ai;

import jakarta.validation.constraints.NotNull;

public record ClickTrackingRequest(
        @NotNull Long sanPhamId,
        @NotNull GoiYAI.Nguon nguon
) {}
