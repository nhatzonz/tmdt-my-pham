package com.mypham.ma_loi;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.List;

public record MaLoiRequest(
        @NotBlank @Size(max = 50) String maLoi,
        @NotBlank @Size(min = 2, max = 255) String tenLoi,
        @NotNull Long thietBiId,
        String moTa,
        String nguyenNhan,
        String cachKhacPhuc,
        @NotNull MaLoi.MucDo mucDo,
        List<String> hinhAnh
) {}
