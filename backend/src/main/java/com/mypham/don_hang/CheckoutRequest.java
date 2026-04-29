package com.mypham.don_hang;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;

import java.util.List;

public record CheckoutRequest(
        @NotEmpty @Valid List<CartLineRequest> items,
        @NotBlank String diaChiGiao,
        String maCoupon,
        String phuongThucTt
) {}
