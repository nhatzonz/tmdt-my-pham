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

    private User loadActiveUser(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng"));
        if (user.getTrangThai() == User.TrangThai.HIDDEN) {
            throw new ResourceNotFoundException("Không tìm thấy người dùng");
        }
        return user;
    }

    private static final Map<Order.TrangThai, Set<Order.TrangThai>> ALLOWED_TRANSITIONS = Map.of(
            Order.TrangThai.PENDING,   EnumSet.of(Order.TrangThai.SHIPPING, Order.TrangThai.CANCELLED),
            Order.TrangThai.SHIPPING,  EnumSet.of(Order.TrangThai.COMPLETED, Order.TrangThai.CANCELLED),
            Order.TrangThai.COMPLETED, EnumSet.noneOf(Order.TrangThai.class),
            Order.TrangThai.CANCELLED, EnumSet.noneOf(Order.TrangThai.class)
    );

    @Transactional
    public OrderResponse createOrder(String email, CheckoutRequest req) {
        User user = loadActiveUser(email);

        Map<Long, Integer> mergedQuantities = new java.util.LinkedHashMap<>();
        for (CartLineRequest line : req.items()) {
            mergedQuantities.merge(line.sanPhamId(), line.soLuong(), Integer::sum);
        }
        List<CartLineRequest> mergedItems = mergedQuantities.entrySet().stream()
                .map(e -> new CartLineRequest(e.getKey(), e.getValue()))
                .toList();

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

        Coupon coupon = couponService.findValid(req.maCoupon());
        BigDecimal discount = BigDecimal.ZERO;
        if (coupon != null) {
            discount = subtotal
                    .multiply(coupon.getPhanTramGiam())
                    .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
        }
        BigDecimal total = subtotal.subtract(discount);
        if (total.compareTo(BigDecimal.ZERO) < 0) total = BigDecimal.ZERO;

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

            inventoryService.recordOrderConsumption(
                    line.sanPhamId(),
                    user.getId(),
                    truoc,
                    sau,
                    line.soLuong(),
                    saved.getId());
        }

        if (coupon != null) {
            couponService.incrementUsed(coupon.getId());
        }

        return toResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> getMine(String email) {
        User user = loadActiveUser(email);
        List<Order> orders = orderRepository.findByNguoiDungIdOrderByIdDesc(user.getId());
        return buildOrderResponses(orders);
    }

    @Transactional
    public OrderResponse cancelMine(Long id, String email) {
        User user = loadActiveUser(email);
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
        User user = loadActiveUser(email);
        Order order = orderRepository.findByIdAndNguoiDungId(id, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("đơn hàng", id));
        return toResponse(order);
    }

    private OrderResponse toResponse(Order o) {
        return buildOrderResponses(List.of(o)).get(0);
    }

    private List<OrderResponse> buildOrderResponses(List<Order> orders) {
        if (orders.isEmpty()) return List.of();

        List<Long> orderIds = orders.stream().map(Order::getId).toList();
        List<OrderDetail> allDetails = detailRepository.findByDonHangIdIn(orderIds);
        Map<Long, List<OrderDetail>> detailsByOrderId = new HashMap<>();
        for (OrderDetail d : allDetails) {
            detailsByOrderId.computeIfAbsent(d.getDonHangId(), k -> new java.util.ArrayList<>()).add(d);
        }

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

        java.util.Set<Long> couponIds = new java.util.HashSet<>();
        for (Order o : orders) if (o.getKhuyenMaiId() != null) couponIds.add(o.getKhuyenMaiId());
        Map<Long, Coupon> couponMap = new HashMap<>();
        if (!couponIds.isEmpty()) {
            for (Coupon c : couponRepository.findAllById(couponIds)) {
                couponMap.put(c.getId(), c);
            }
        }

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

            inventoryService.broadcastCurrent(d.getSanPhamId());
        }

        if (order.getKhuyenMaiId() != null) {
            couponService.decrementUsed(order.getKhuyenMaiId());
        }
    }

    private AdminOrderResponse toAdminResponse(Order o) {
        return buildAdminOrderResponses(List.of(o)).get(0);
    }

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

            String email = u == null ? null : u.getEmail();
            if (u != null && email != null) {
                String prefix = "__deleted_" + u.getId() + "_";
                if (email.startsWith(prefix)) email = email.substring(prefix.length());
            }
            return new AdminOrderResponse(
                    o.getId(),
                    o.getNguoiDungId(),
                    u == null ? "(đã xoá)" : u.getHoTen(),
                    email,
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
