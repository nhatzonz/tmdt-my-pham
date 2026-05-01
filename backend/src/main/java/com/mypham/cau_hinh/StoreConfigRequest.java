package com.mypham.cau_hinh;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record StoreConfigRequest(
        @NotBlank(message = "Tên cửa hàng không được để trống")
        @Size(max = 255, message = "Tên cửa hàng tối đa 255 ký tự")
        String tenCuaHang,

        @Size(max = 1000) String logoUrl,

        @Size(max = 100) String diaChiTinh,
        @Size(max = 100) String diaChiQuan,
        @Size(max = 100) String diaChiPhuong,
        @Size(max = 255) String diaChiChiTiet,

        @Pattern(
                regexp = "^$|^(0|\\+84)\\d{9,10}$",
                message = "Số điện thoại không hợp lệ — vd 0912345678 hoặc +84912345678"
        )
        @Size(max = 20)
        String soDienThoai,

        @Email(message = "Email không hợp lệ")
        @Size(max = 100)
        String emailLienHe,

        @Size(max = 1000) String linkFacebook,
        @Size(max = 1000) String linkInstagram,
        @Size(max = 1000) String linkTiktok,
        @Size(max = 1000) String linkYoutube
) {}
