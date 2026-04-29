package com.mypham.ton_kho;

import com.mypham.auth.User;
import com.mypham.auth.UserRepository;
import com.mypham.common.exception.BusinessException;
import com.mypham.common.exception.ErrorCode;
import com.mypham.common.exception.ResourceNotFoundException;
import com.mypham.san_pham.Product;
import com.mypham.san_pham.ProductImage;
import com.mypham.san_pham.ProductImageRepository;
import com.mypham.san_pham.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class InventoryService {

    private final InventoryRepository inventoryRepository;
    private final ProductRepository productRepository;
    private final ProductImageRepository imageRepository;
    private final InventoryHistoryRepository historyRepository;
    private final UserRepository userRepository;

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

    /** Auto-create row khi tạo sản phẩm mới (so_luong_ton=0). */
    @Transactional
    public Inventory ensureRow(Long sanPhamId) {
        return inventoryRepository.findBySanPhamId(sanPhamId).orElseGet(() -> {
            Inventory inv = new Inventory();
            inv.setSanPhamId(sanPhamId);
            inv.setSoLuongTon(0);
            inv.setNguongCanhBao(10);
            return inventoryRepository.save(inv);
        });
    }

    @Transactional(readOnly = true)
    public List<InventoryAdminResponse> listAdmin() {
        List<Product> products = productRepository.findAll();
        Map<Long, Inventory> invMap = new HashMap<>();
        for (Inventory i : inventoryRepository.findAll()) {
            invMap.put(i.getSanPhamId(), i);
        }
        return products.stream()
                .map(p -> toResponse(p, invMap.get(p.getId())))
                .sorted((a, b) -> {
                    int sa = a.hetHang() ? 0 : (a.canhBao() ? 1 : 2);
                    int sb = b.hetHang() ? 0 : (b.canhBao() ? 1 : 2);
                    if (sa != sb) return sa - sb;
                    return Long.compare(a.sanPhamId(), b.sanPhamId());
                })
                .toList();
    }

    @Transactional
    public InventoryAdminResponse update(InventoryUpdateRequest req, String adminEmail) {
        Product p = productRepository.findById(req.sanPhamId())
                .orElseThrow(() -> new ResourceNotFoundException("sản phẩm", req.sanPhamId()));
        Inventory inv = ensureRow(p.getId());

        int truoc = inv.getSoLuongTon();
        int sau = switch (req.action()) {
            case IMPORT -> truoc + req.soLuong();
            case EXPORT -> truoc - req.soLuong();
            case SET -> req.soLuong();
        };
        if (sau < 0) {
            throw new BusinessException(
                    ErrorCode.OUT_OF_STOCK,
                    "Không đủ tồn kho — chỉ còn " + truoc + " để xuất");
        }
        inv.setSoLuongTon(sau);
        inventoryRepository.save(inv);

        // Audit log
        Long adminId = userRepository.findByEmail(adminEmail).map(User::getId).orElse(null);
        InventoryHistory h = new InventoryHistory();
        h.setSanPhamId(p.getId());
        h.setNguoiDungId(adminId);
        h.setAction(InventoryHistory.LogAction.valueOf(req.action().name()));
        h.setSoLuong(req.soLuong());
        h.setTonTruoc(truoc);
        h.setTonSau(sau);
        h.setNguon("admin_panel");
        historyRepository.save(h);

        return toResponse(p, inv);
    }

    @Transactional
    public InventoryAdminResponse updateThreshold(InventoryThresholdRequest req) {
        Product p = productRepository.findById(req.sanPhamId())
                .orElseThrow(() -> new ResourceNotFoundException("sản phẩm", req.sanPhamId()));
        Inventory inv = ensureRow(p.getId());
        inv.setNguongCanhBao(req.nguongCanhBao());
        inventoryRepository.save(inv);
        return toResponse(p, inv);
    }

    /** Gọi từ OrderService khi customer checkout — log mỗi line. */
    @Transactional
    public void recordOrderConsumption(
            Long sanPhamId,
            Long customerId,
            int truoc,
            int sau,
            int soLuong,
            Long donHangId
    ) {
        InventoryHistory h = new InventoryHistory();
        h.setSanPhamId(sanPhamId);
        h.setNguoiDungId(customerId);
        h.setAction(InventoryHistory.LogAction.ORDER);
        h.setSoLuong(soLuong);
        h.setTonTruoc(truoc);
        h.setTonSau(sau);
        h.setNguon("don_hang_" + donHangId);
        historyRepository.save(h);
    }

    @Transactional(readOnly = true)
    public List<InventoryHistoryResponse> listHistory(Long sanPhamId) {
        List<InventoryHistory> rows = sanPhamId == null
                ? historyRepository.findAllByOrderByIdDesc()
                : historyRepository.findBySanPhamIdOrderByIdDesc(sanPhamId);

        Map<Long, Product> productCache = new HashMap<>();
        Map<Long, User> userCache = new HashMap<>();
        return rows.stream().map(h -> {
            Product p = productCache.computeIfAbsent(h.getSanPhamId(),
                    id -> productRepository.findById(id).orElse(null));
            User u = h.getNguoiDungId() == null ? null
                    : userCache.computeIfAbsent(h.getNguoiDungId(),
                            id -> userRepository.findById(id).orElse(null));
            return new InventoryHistoryResponse(
                    h.getId(),
                    h.getSanPhamId(),
                    p == null ? null : p.getMaSanPham(),
                    p == null ? "(đã xoá)" : p.getTenSanPham(),
                    h.getNguoiDungId(),
                    u == null ? null : u.getHoTen(),
                    h.getAction(),
                    h.getSoLuong(),
                    h.getTonTruoc(),
                    h.getTonSau(),
                    h.getTonSau() - h.getTonTruoc(),
                    h.getNguon(),
                    h.getGhiChu(),
                    h.getCreatedAt());
        }).toList();
    }

    private InventoryAdminResponse toResponse(Product p, Inventory inv) {
        String image = imageRepository.findBySanPhamIdOrderByThuTuAsc(p.getId())
                .stream().findFirst().map(ProductImage::getUrl).orElse(null);
        int ton = inv == null ? 0 : inv.getSoLuongTon();
        int threshold = inv == null || inv.getNguongCanhBao() == null
                ? 10
                : inv.getNguongCanhBao();
        return new InventoryAdminResponse(
                p.getId(),
                p.getMaSanPham(),
                p.getTenSanPham(),
                p.getThuongHieu(),
                image,
                ton,
                threshold,
                ton < threshold,
                ton == 0);
    }
}
