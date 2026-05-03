package com.mypham.cau_hinh;

public record SystemConfigResponse(
        String tenHeThong,
        String logoUrl,
        String moTa,
        String soDienThoai,
        String emailLienHe,
        String diaChi,
        String linkFacebook,
        String linkYoutube
) {
    public static SystemConfigResponse from(SystemConfig c) {
        return new SystemConfigResponse(
                c.getTenHeThong(),
                c.getLogoUrl(),
                c.getMoTa(),
                c.getSoDienThoai(),
                c.getEmailLienHe(),
                c.getDiaChi(),
                c.getLinkFacebook(),
                c.getLinkYoutube()
        );
    }
}
