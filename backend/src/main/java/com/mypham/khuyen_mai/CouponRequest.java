package com.mypham.khuyen_mai;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.Instant;

public record CouponRequest(
        @NotBlank @Size(min = 2, max = 50) String maCode,
        @NotNull @DecimalMin(value = "0.01") @DecimalMax(value = "100.00") BigDecimal phanTramGiam,
        @NotNull Instant startAt,
        @NotNull Instant endAt,
        String status,
        @Min(value = 1, message = "Số lượng phải ≥ 1") Integer soLuong
) {}
