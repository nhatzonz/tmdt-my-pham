package com.mypham.thiet_bi;

public record ThietBiResponse(
        Long id,
        String tenThietBi,
        String hang,
        String hinhAnh,
        String moTa,
        Integer thuTu,
        Long soMaLoi
) {
    public static ThietBiResponse from(ThietBi t, long soMaLoi) {
        return new ThietBiResponse(
                t.getId(),
                t.getTenThietBi(),
                t.getHang(),
                t.getHinhAnh(),
                t.getMoTa(),
                t.getThuTu(),
                soMaLoi
        );
    }
}
