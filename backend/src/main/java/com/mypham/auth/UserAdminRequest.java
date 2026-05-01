package com.mypham.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/** Tạo user mới hoặc cập nhật thông tin (không bao gồm mật khẩu — endpoint riêng). */
public record UserAdminRequest(
        @NotBlank(message = "Họ tên không được để trống")
        @Size(min = 2, max = 100, message = "Họ tên dài 2-100 ký tự")
        String hoTen,

        @NotBlank(message = "Email không được để trống")
        @Email(message = "Email không hợp lệ")
        @Size(max = 100, message = "Email tối đa 100 ký tự")
        String email,

        @Pattern(
                regexp = "^$|^(0|\\+84)\\d{9,10}$",
                message = "Số điện thoại không hợp lệ — vd 0912345678 hoặc +84912345678"
        )
        @Size(max = 20)
        String soDienThoai,

        @NotNull(message = "Phải chọn vai trò") User.Role vaiTro,

        // matKhau chỉ bắt buộc khi tạo mới; ignore khi update.
        @Size(min = 6, max = 100, message = "Mật khẩu dài 6-100 ký tự")
        String matKhau
) {}
