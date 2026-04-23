package com.mypham.danh_muc;

public record CategoryResponse(Long id, String tenDanhMuc) {
    public static CategoryResponse from(Category c) {
        return new CategoryResponse(c.getId(), c.getTenDanhMuc());
    }
}
