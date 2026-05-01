package com.mypham.cau_hinh;

import java.time.Instant;

public record StoreConfigResponse(
        String tenCuaHang,
        String logoUrl,
        String diaChiTinh,
        String diaChiQuan,
        String diaChiPhuong,
        String diaChiChiTiet,
        String diaChiDayDu,
        String soDienThoai,
        String emailLienHe,
        String linkFacebook,
        String linkInstagram,
        String linkTiktok,
        String linkYoutube,
        Instant updatedAt
) {
    public static StoreConfigResponse from(StoreConfig c) {

        StringBuilder full = new StringBuilder();
        if (c.getDiaChiChiTiet() != null && !c.getDiaChiChiTiet().isBlank()) full.append(c.getDiaChiChiTiet());
        if (c.getDiaChiPhuong() != null && !c.getDiaChiPhuong().isBlank()) {
            if (full.length() > 0) full.append(", ");
            full.append(c.getDiaChiPhuong());
        }
        if (c.getDiaChiQuan() != null && !c.getDiaChiQuan().isBlank()) {
            if (full.length() > 0) full.append(", ");
            full.append(c.getDiaChiQuan());
        }
        if (c.getDiaChiTinh() != null && !c.getDiaChiTinh().isBlank()) {
            if (full.length() > 0) full.append(", ");
            full.append(c.getDiaChiTinh());
        }
        return new StoreConfigResponse(
                c.getTenCuaHang(),
                c.getLogoUrl(),
                c.getDiaChiTinh(),
                c.getDiaChiQuan(),
                c.getDiaChiPhuong(),
                c.getDiaChiChiTiet(),
                full.toString(),
                c.getSoDienThoai(),
                c.getEmailLienHe(),
                c.getLinkFacebook(),
                c.getLinkInstagram(),
                c.getLinkTiktok(),
                c.getLinkYoutube(),
                c.getUpdatedAt());
    }
}
