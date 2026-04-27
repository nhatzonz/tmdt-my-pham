package com.mypham.danh_muc;

public record CategoryResponse(
        Long id,
        String tenDanhMuc,
        String hinhAnh,
        Integer thuTu,
        Long productCount
) {
    public static CategoryResponse from(Category c, long productCount) {
        return new CategoryResponse(
                c.getId(),
                c.getTenDanhMuc(),
                c.getHinhAnh(),
                c.getThuTu(),
                productCount
        );
    }
}
