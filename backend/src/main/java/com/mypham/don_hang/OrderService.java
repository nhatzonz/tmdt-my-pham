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
import com.mypham.ton_kho.InventoryRepository;
import com.mypham.ton_kho.InventoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

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
    private final CouponRepository couponRepository;
    private final CouponService couponService;
    private final UserRepository userRepository;

    @Transactional
    public OrderResponse createOrder(String email, CheckoutRequest req) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng"));

        // 1. Validate items + lock product/inventory in memory
        Map<Long, Product> productMap = new HashMap<>();
        Map<Long, Inventory> invMap = new HashMap<>();
        BigDecimal subtotal = BigDecimal.ZERO;

        for (CartLineRequest line : req.items()) {
            Product p = productRepository.findById(line.sanPhamId())
                    .orElseThrow(() -> new BusinessException(
                            ErrorCode.RESOURCE_NOT_FOUND,
                            "Sản phẩm #" + line.sanPhamId() + " không tồn tại"));
            if (p.getTrangThai() != Product.TrangThai.ACTIVE) {
                throw new BusinessException(
                        ErrorCode.RESOURCE_NOT_FOUND,
                        "Sản phẩm \"" + p.getTenSanPham() + "\" đã ngừng bán");
            }
            Inventory inv = inventoryRepository.findBySanPhamId(p.getId())
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
        for (CartLineRequest line : req.items()) {
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

        return toResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> getMine(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng"));
        return orderRepository.findByNguoiDungIdOrderByIdDesc(user.getId()).stream()
                .map(this::toResponse)
                .toList();
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
        List<OrderDetail> details = detailRepository.findByDonHangId(o.getId());
        List<OrderLineResponse> items = details.stream().map(d -> {
            Product p = productRepository.findById(d.getSanPhamId()).orElse(null);
            String image = imageRepository.findBySanPhamIdOrderByThuTuAsc(d.getSanPhamId())
                    .stream().findFirst().map(ProductImage::getUrl).orElse(null);
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
            Coupon c = couponRepository.findById(o.getKhuyenMaiId()).orElse(null);
            if (c != null) {
                maCoupon = c.getMaCode();
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
    }
}
