package com.mypham.don_hang;

import jakarta.validation.constraints.NotNull;

public record OrderStatusRequest(
        @NotNull Order.TrangThai trangThai
) {}
