package com.mypham.don_hang;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;

import java.util.List;

public record CheckoutRequest(
        @NotEmpty @Valid List<CartLineRequest> items,
        @NotBlank @Size(max = 500, message = "Địa chỉ giao tối đa 500 ký tự") String diaChiGiao,
        @Size(max = 50) String maCoupon,
        @Size(max = 20) String phuongThucTt
) {}
