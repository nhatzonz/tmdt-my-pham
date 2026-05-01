package com.mypham.don_hang;

import com.mypham.auth.User;
import com.mypham.auth.UserRepository;
import com.mypham.common.exception.BusinessException;
import com.mypham.common.exception.ErrorCode;
import com.mypham.common.exception.ResourceNotFoundException;
import com.mypham.khuyen_mai.Coupon;
import com.mypham.khuyen_mai.CouponRepository;
import com.mypham.khuyen_mai.CouponService;
import com.mypham.san_pham.Product;
import com.mypham.san_pham.ProductImage;
import com.mypham.san_pham.ProductImageRepository;
import com.mypham.san_pham.ProductRepository;
import com.mypham.ton_kho.Inventory;
import com.mypham.ton_kho.InventoryHistory;
import com.mypham.ton_kho.InventoryHistoryRepository;
import com.mypham.ton_kho.InventoryRepository;
import com.mypham.ton_kho.InventoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.EnumSet;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * Plan §2.3 sequence 2.5.4 / BPMN 2.7.1.
 * createOrder: kiểm tồn kho → kiểm coupon → tính tổng → INSERT order + chi tiết → UPDATE ton_kho.
 * Toàn bộ @Transactional — fail bất kỳ bước nào → rollback.
 */
@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final OrderDetailRepository detailRepository;
    private final ProductRepository productRepository;
    private final ProductImageRepository imageRepository;
    private final InventoryRepository inventoryRepository;
    private final InventoryService inventoryService;
    private final InventoryHistoryRepository inventoryHistoryRepository;
    private final CouponRepository couponRepository;
    private final CouponService couponService;
    private final UserRepository userRepository;

    /** Quy tắc chuyển trạng thái — Plan §2.7.1.
     *  PENDING   → SHIPPING | CANCELLED
     *  SHIPPING  → COMPLETED | CANCELLED
     *  COMPLETED → (đóng — không đổi nữa)
     *  CANCELLED → (đóng — không đổi nữa)
     */
    private static final Map<Order.TrangThai, Set<Order.TrangThai>> ALLOWED_TRANSITIONS = Map.of(
            Order.TrangThai.PENDING,   EnumSet.of(Order.TrangThai.SHIPPING, Order.TrangThai.CANCELLED),
            Order.TrangThai.SHIPPING,  EnumSet.of(Order.TrangThai.COMPLETED, Order.TrangThai.CANCELLED),
            Order.TrangThai.COMPLETED, EnumSet.noneOf(Order.TrangThai.class),
            Order.TrangThai.CANCELLED, EnumSet.noneOf(Order.TrangThai.class)
    );

    @Transactional
    public OrderResponse createOrder(String email, CheckoutRequest req) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng"));

        // 0. Dedup items theo sanPhamId — phòng trường hợp client gửi 2 dòng cùng sản phẩm
        Map<Long, Integer> mergedQuantities = new java.util.LinkedHashMap<>();
        for (CartLineRequest line : req.items()) {
            mergedQuantities.merge(line.sanPhamId(), line.soLuong(), Integer::sum);
        }
        List<CartLineRequest> mergedItems = mergedQuantities.entrySet().stream()
                .map(e -> new CartLineRequest(e.getKey(), e.getValue()))
                .toList();

        // 1. Validate items + lock product/inventory in memory
        Map<Long, Product> productMap = new HashMap<>();
        Map<Long, Inventory> invMap = new HashMap<>();
        BigDecimal subtotal = BigDecimal.ZERO;

        for (CartLineRequest line : mergedItems) {
            Product p = productRepository.findById(line.sanPhamId())
                    .orElseThrow(() -> new BusinessException(
                            ErrorCode.RESOURCE_NOT_FOUND,
                            "Sản phẩm #" + line.sanPhamId() + " không tồn tại"));
            if (p.getTrangThai() != Product.TrangThai.ACTIVE) {
                throw new BusinessException(
                        ErrorCode.RESOURCE_NOT_FOUND,
                        "Sản phẩm \"" + p.getTenSanPham() + "\" đã ngừng bán");
            }
            Inventory inv = inventoryRepository.findBySanPhamIdForUpdate(p.getId())
                    .orElseThrow(() -> new BusinessException(
                            ErrorCode.OUT_OF_STOCK,
                            "\"" + p.getTenSanPham() + "\" chưa có tồn kho"));
            if (inv.getSoLuongTon() < line.soLuong()) {
                throw new BusinessException(
                        ErrorCode.OUT_OF_STOCK,
                        "\"" + p.getTenSanPham() + "\" chỉ còn " + inv.getSoLuongTon() + " sp");
            }
            productMap.put(p.getId(), p);
            invMap.put(p.getId(), inv);
            subtotal = subtotal.add(p.getGia().multiply(BigDecimal.valueOf(line.soLuong())));
        }

        // 2. Coupon
        Coupon coupon = couponService.findValid(req.maCoupon());
        BigDecimal discount = BigDecimal.ZERO;
        if (coupon != null) {
            discount = subtotal
                    .multiply(coupon.getPhanTramGiam())
                    .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
        }
        BigDecimal total = subtotal.subtract(discount);
        if (total.compareTo(BigDecimal.ZERO) < 0) total = BigDecimal.ZERO;

        // 3. INSERT order
        Order order = new Order();
        order.setNguoiDungId(user.getId());
        order.setTongTien(total);
        order.setDiaChiGiao(req.diaChiGiao());
        order.setPhuongThucTt(
                req.phuongThucTt() == null || req.phuongThucTt().isBlank()
                        ? "COD"
                        : req.phuongThucTt().trim().toUpperCase());
        order.setKhuyenMaiId(coupon == null ? null : coupon.getId());
        order.setTrangThai(Order.TrangThai.PENDING);
        Order saved = orderRepository.save(order);

        // 4. INSERT details + UPDATE stock
        for (CartLineRequest line : mergedItems) {
            Product p = productMap.get(line.sanPhamId());
            OrderDetail detail = new OrderDetail();
            detail.setDonHangId(saved.getId());
            detail.setSanPhamId(line.sanPhamId());
            detail.setSoLuong(line.soLuong());
            detail.setGiaBan(p.getGia());
            detailRepository.save(detail);

            Inventory inv = invMap.get(line.sanPhamId());
            int truoc = inv.getSoLuongTon();
            int sau = truoc - line.soLuong();
            inv.setSoLuongTon(sau);
            inventoryRepository.save(inv);

            // Audit log: ORDER consumption
            inventoryService.recordOrderConsumption(
                    line.sanPhamId(),
                    user.getId(),
                    truoc,
                    sau,
                    line.soLuong(),
                    saved.getId());
        }

        // 5. Tăng số lượng đã dùng của coupon (cùng transaction — rollback nếu lỗi)
        if (coupon != null) {
            couponService.incrementUsed(coupon.getId());
        }

        return toResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> getMine(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng"));
        List<Order> orders = orderRepository.findByNguoiDungIdOrderByIdDesc(user.getId());
        return buildOrderResponses(orders);
    }

    /**
     * UC 2.5.5 — khách huỷ đơn của chính mình khi còn ở trạng thái PENDING.
     * Tự hoàn kho + ghi audit log.
     */
    @Transactional
    public OrderResponse cancelMine(Long id, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng"));
        Order order = orderRepository.findByIdAndNguoiDungId(id, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("đơn hàng", id));
        if (order.getTrangThai() != Order.TrangThai.PENDING) {
            throw new BusinessException(
                    ErrorCode.ORDER_STATUS_INVALID,
                    "Chỉ có thể huỷ đơn ở trạng thái Chờ xử lý");
        }
        restockOrder(order, email);
        order.setTrangThai(Order.TrangThai.CANCELLED);
        orderRepository.save(order);
        return toResponse(order);
    }

    @Transactional(readOnly = true)
    public OrderResponse getById(Long id, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng"));
        Order order = orderRepository.findByIdAndNguoiDungId(id, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("đơn hàng", id));
        return toResponse(order);
    }

    private OrderResponse toResponse(Order o) {
        return buildOrderResponses(List.of(o)).get(0);
    }

    /**
     * Batch-build responses cho nhiều đơn — tránh N+1 trên list page.
     * Một query: details, products, images, coupons.
     */
    private List<OrderResponse> buildOrderResponses(List<Order> orders) {
        if (orders.isEmpty()) return List.of();

        // 1. fetch all order details in one query
        List<Long> orderIds = orders.stream().map(Order::getId).toList();
        List<OrderDetail> allDetails = detailRepository.findByDonHangIdIn(orderIds);
        Map<Long, List<OrderDetail>> detailsByOrderId = new HashMap<>();
        for (OrderDetail d : allDetails) {
            detailsByOrderId.computeIfAbsent(d.getDonHangId(), k -> new java.util.ArrayList<>()).add(d);
        }

        // 2. fetch all products + first-image per product in batch
        java.util.Set<Long> productIds = new java.util.HashSet<>();
        for (OrderDetail d : allDetails) productIds.add(d.getSanPhamId());
        Map<Long, Product> productMap = new HashMap<>();
        for (Product p : productRepository.findAllById(productIds)) {
            productMap.put(p.getId(), p);
        }
        Map<Long, String> firstImageMap = new HashMap<>();
        for (ProductImage img : imageRepository.findBySanPhamIdInOrderBySanPhamIdAscThuTuAsc(productIds)) {
            firstImageMap.putIfAbsent(img.getSanPhamId(), img.getUrl());
        }

        // 3. fetch coupons referenced by these orders in batch
        java.util.Set<Long> couponIds = new java.util.HashSet<>();
        for (Order o : orders) if (o.getKhuyenMaiId() != null) couponIds.add(o.getKhuyenMaiId());
        Map<Long, Coupon> couponMap = new HashMap<>();
        if (!couponIds.isEmpty()) {
            for (Coupon c : couponRepository.findAllById(couponIds)) {
                couponMap.put(c.getId(), c);
            }
        }

        // 4. assemble
        return orders.stream().map(o -> {
            List<OrderDetail> details = detailsByOrderId.getOrDefault(o.getId(), List.of());
            List<OrderLineResponse> items = details.stream().map(d -> {
                Product p = productMap.get(d.getSanPhamId());
                String image = firstImageMap.get(d.getSanPhamId());
                BigDecimal lineTotal = d.getGiaBan().multiply(BigDecimal.valueOf(d.getSoLuong()));
                return new OrderLineResponse(
                        d.getId(),
                        d.getSanPhamId(),
                        p == null ? "(sản phẩm đã xoá)" : p.getTenSanPham(),
                        image,
                        d.getSoLuong(),
                        d.getGiaBan(),
                        lineTotal);
            }).toList();

            String maCoupon = null;
            BigDecimal phanTramGiam = null;
            if (o.getKhuyenMaiId() != null) {
                Coupon c = couponMap.get(o.getKhuyenMaiId());
                if (c != null) {
                    // Strip prefix __deleted_<id>_ — đặt khi tái sử dụng mã đã soft-delete.
                    // Đơn cũ vẫn nên hiển thị tên mã gốc để user nhận diện.
                    String code = c.getMaCode();
                    String prefix = "__deleted_" + c.getId() + "_";
                    if (code != null && code.startsWith(prefix)) {
                        code = code.substring(prefix.length());
                    }
                    maCoupon = code;
                    phanTramGiam = c.getPhanTramGiam();
                }
            }

            return new OrderResponse(
                    o.getId(),
                    o.getNguoiDungId(),
                    o.getTongTien(),
                    o.getTrangThai(),
                    o.getDiaChiGiao(),
                    o.getPhuongThucTt(),
                    maCoupon,
                    phanTramGiam,
                    o.getCreatedAt(),
                    items);
        }).toList();
    }

    // ===== ADMIN =====

    @Transactional(readOnly = true)
    public List<AdminOrderResponse> listAdmin(Order.TrangThai status) {
        List<Order> rows = status == null
                ? orderRepository.findAllByOrderByIdDesc()
                : orderRepository.findByTrangThaiOrderByIdDesc(status);
        return buildAdminOrderResponses(rows);
    }

    @Transactional(readOnly = true)
    public AdminOrderResponse getAdminById(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("đơn hàng", id));
        return toAdminResponse(order);
    }

    @Transactional(readOnly = true)
    public Map<Order.TrangThai, Long> countByStatus() {
        Map<Order.TrangThai, Long> map = new HashMap<>();
        for (Order.TrangThai t : Order.TrangThai.values()) {
            map.put(t, orderRepository.countByTrangThai(t));
        }
        return map;
    }

    /**
     * Đổi trạng thái — kèm restock nếu CANCELLED.
     * Chỉ cho phép theo bảng ALLOWED_TRANSITIONS.
     */
    @Transactional
    public AdminOrderResponse updateStatus(Long id, Order.TrangThai next, String adminEmail) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("đơn hàng", id));
        Order.TrangThai cur = order.getTrangThai();
        if (cur == next) {
            throw new BusinessException(
                    ErrorCode.ORDER_STATUS_INVALID,
                    "Đơn hàng đã ở trạng thái " + cur);
        }
        if (!ALLOWED_TRANSITIONS.getOrDefault(cur, EnumSet.noneOf(Order.TrangThai.class)).contains(next)) {
            throw new BusinessException(
                    ErrorCode.ORDER_STATUS_INVALID,
                    "Không thể chuyển từ " + cur + " sang " + next);
        }

        if (next == Order.TrangThai.CANCELLED) {
            restockOrder(order, adminEmail);
        }

        order.setTrangThai(next);
        orderRepository.save(order);
        return toAdminResponse(order);
    }

    /** Hoàn lại tồn kho khi huỷ đơn — log với action=IMPORT, nguon=huy_don_<id>. */
    private void restockOrder(Order order, String adminEmail) {
        Long adminId = userRepository.findByEmail(adminEmail).map(User::getId).orElse(null);
        List<OrderDetail> details = detailRepository.findByDonHangId(order.getId());
        for (OrderDetail d : details) {
            Inventory inv = inventoryRepository.findBySanPhamIdForUpdate(d.getSanPhamId())
                    .orElseGet(() -> inventoryService.ensureRow(d.getSanPhamId()));
            int truoc = inv.getSoLuongTon();
            int sau = truoc + d.getSoLuong();
            inv.setSoLuongTon(sau);
            inventoryRepository.save(inv);

            InventoryHistory h = new InventoryHistory();
            h.setSanPhamId(d.getSanPhamId());
            h.setNguoiDungId(adminId);
            h.setAction(InventoryHistory.LogAction.IMPORT);
            h.setSoLuong(d.getSoLuong());
            h.setTonTruoc(truoc);
            h.setTonSau(sau);
            h.setNguon("huy_don_" + order.getId());
            h.setGhiChu("Hoàn kho do huỷ đơn #" + order.getId());
            inventoryHistoryRepository.save(h);
            // Broadcast tồn kho mới cho admin /quan-tri/ton-kho
            inventoryService.broadcastCurrent(d.getSanPhamId());
        }

        // Hoàn 1 lượt cho coupon nếu đơn có dùng
        if (order.getKhuyenMaiId() != null) {
            couponService.decrementUsed(order.getKhuyenMaiId());
        }
    }

    private AdminOrderResponse toAdminResponse(Order o) {
        return buildAdminOrderResponses(List.of(o)).get(0);
    }

    /** Batch admin response — fetch users theo batch + reuse buildOrderResponses. */
    private List<AdminOrderResponse> buildAdminOrderResponses(List<Order> orders) {
        if (orders.isEmpty()) return List.of();

        List<OrderResponse> bases = buildOrderResponses(orders);
        Map<Long, OrderResponse> baseById = new HashMap<>();
        for (OrderResponse b : bases) baseById.put(b.id(), b);

        java.util.Set<Long> userIds = new java.util.HashSet<>();
        for (Order o : orders) userIds.add(o.getNguoiDungId());
        Map<Long, User> userMap = new HashMap<>();
        for (User u : userRepository.findAllById(userIds)) userMap.put(u.getId(), u);

        return orders.stream().map(o -> {
            OrderResponse base = baseById.get(o.getId());
            User u = userMap.get(o.getNguoiDungId());
            int soLuongMon = base.items().stream()
                    .mapToInt(it -> it.soLuong() == null ? 0 : it.soLuong())
                    .sum();
            return new AdminOrderResponse(
                    o.getId(),
                    o.getNguoiDungId(),
                    u == null ? "(đã xoá)" : u.getHoTen(),
                    u == null ? null : u.getEmail(),
                    u == null ? null : u.getSoDienThoai(),
                    o.getTongTien(),
                    o.getTrangThai(),
                    o.getDiaChiGiao(),
                    o.getPhuongThucTt(),
                    base.maCoupon(),
                    base.phanTramGiam(),
                    o.getCreatedAt(),
                    base.items(),
                    soLuongMon);
        }).toList();
    }
}
