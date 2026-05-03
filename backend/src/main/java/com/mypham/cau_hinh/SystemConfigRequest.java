package com.mypham.cau_hinh;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record SystemConfigRequest(
        @NotBlank @Size(max = 255) String tenHeThong,
        String logoUrl,
        String moTa,
        @Size(max = 20)  String soDienThoai,
        @Size(max = 100) String emailLienHe,
        @Size(max = 255) String diaChi,
        String linkFacebook,
        String linkYoutube
) {}
