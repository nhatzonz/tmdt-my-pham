package com.mypham.ton_kho;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class InventoryService {

    private final InventoryRepository inventoryRepository;

    /** Plan §2.3 sequence 2.5.3: chỉ check tồn kho, không lưu giỏ. */
    @Transactional(readOnly = true)
    public CartCheckResponse checkStock(Long sanPhamId, int soLuong) {
        Inventory inv = inventoryRepository.findBySanPhamId(sanPhamId).orElse(null);
        if (inv == null) return CartCheckResponse.outOfStock(0, "Sản phẩm chưa có tồn kho");
        if (inv.getSoLuongTon() < soLuong) {
            return CartCheckResponse.outOfStock(inv.getSoLuongTon(),
                    "Hết hàng — chỉ còn " + inv.getSoLuongTon());
        }
        return CartCheckResponse.ok(inv.getSoLuongTon());
    }
}
