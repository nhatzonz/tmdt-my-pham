package com.mypham.auth;

public record AuthResponse(
        String token,
        UserInfo user
) {
    public record UserInfo(
            Long id,
            String hoTen,
            String email,
            String soDienThoai,
            User.Role vaiTro
    ) {}
}
