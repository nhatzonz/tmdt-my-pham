package com.mypham.ma_loi;

import java.time.Instant;
import java.util.List;

public record MaLoiResponse(
        Long id,
        String maLoi,
        String tenLoi,
        Long thietBiId,
        String tenThietBi,
        String hangThietBi,
        String moTa,
        String nguyenNhan,
        String cachKhacPhuc,
        MaLoi.MucDo mucDo,
        MaLoi.TrangThai trangThai,
        Long luotXem,
        List<String> hinhAnh,
        Instant createdAt,
        Instant updatedAt
) {
    public static MaLoiResponse from(MaLoi m, String tenThietBi, String hangThietBi, List<String> images) {
        return new MaLoiResponse(
                m.getId(),
                m.getMaLoi(),
                m.getTenLoi(),
                m.getThietBiId(),
                tenThietBi,
                hangThietBi,
                m.getMoTa(),
                m.getNguyenNhan(),
                m.getCachKhacPhuc(),
                m.getMucDo(),
                m.getTrangThai(),
                m.getLuotXem() == null ? 0L : m.getLuotXem(),
                images == null ? List.of() : images,
                m.getCreatedAt(),
                m.getUpdatedAt()
        );
    }
}
