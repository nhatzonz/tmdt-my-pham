package com.mypham.auth;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record UpdateMeRequest(
        @NotBlank(message = "Họ tên không được để trống")
        @Size(min = 2, max = 100, message = "Họ tên dài 2-100 ký tự")
        String hoTen,

        @Pattern(
                regexp = "^$|^(0|\\+84)\\d{9,10}$",
                message = "Số điện thoại không hợp lệ — vd 0912345678 hoặc +84912345678"
        )
        @Size(max = 20)
        String soDienThoai
) {}
