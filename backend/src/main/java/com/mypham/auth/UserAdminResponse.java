package com.mypham.auth;

import java.time.Instant;

public record UserAdminResponse(
        Long id,
        String hoTen,
        String email,
        String soDienThoai,
        User.Role vaiTro,
        long soDonHang,
        Instant createdAt
) {
    public static UserAdminResponse from(User u, long soDonHang) {
        return new UserAdminResponse(
                u.getId(),
                u.getHoTen(),
                u.getEmail(),
                u.getSoDienThoai(),
                u.getVaiTro(),
                soDonHang,
                u.getCreatedAt());
    }
}
