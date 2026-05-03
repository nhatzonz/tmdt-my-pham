package com.mypham.thiet_bi;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

public record ThietBiRequest(
        @NotBlank @Size(min = 2, max = 150) String tenThietBi,
        @Size(max = 100) String hang,
        String hinhAnh,
        String moTa,
        @PositiveOrZero Integer thuTu
) {}
