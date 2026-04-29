package com.mypham.ton_kho;

import java.time.Instant;

public record InventoryHistoryResponse(
        Long id,
        Long sanPhamId,
        String maSanPham,
        String tenSanPham,
        Long nguoiDungId,
        String nguoiDungHoTen,
        InventoryHistory.LogAction action,
        Integer soLuong,
        Integer tonTruoc,
        Integer tonSau,
        Integer delta,
        String nguon,
        String ghiChu,
        Instant createdAt
) {}
