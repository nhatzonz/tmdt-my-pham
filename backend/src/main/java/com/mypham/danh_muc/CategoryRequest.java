package com.mypham.danh_muc;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

public record CategoryRequest(
        @NotBlank @Size(min = 2, max = 100) String tenDanhMuc,
        String hinhAnh,
        @PositiveOrZero Integer thuTu
) {}
