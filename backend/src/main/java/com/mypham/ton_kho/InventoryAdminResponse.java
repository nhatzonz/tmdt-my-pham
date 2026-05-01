package com.mypham.ton_kho;

public record InventoryAdminResponse(
        Long sanPhamId,
        String maSanPham,
        String tenSanPham,
        String thuongHieu,
        String hinhAnh,
        Integer soLuongTon,
        Integer nguongCanhBao,
        boolean canhBao,
        boolean hetHang
) {}
