package com.mypham.bao_cao;

import com.mypham.ai.GoiYAIRepository;
import com.mypham.auth.User;
import com.mypham.auth.UserRepository;
import com.mypham.danh_muc.Category;
import com.mypham.danh_muc.CategoryRepository;
import com.mypham.don_hang.Order;
import com.mypham.don_hang.OrderRepository;
import com.mypham.khuyen_mai.Coupon;
import com.mypham.khuyen_mai.CouponRepository;
import com.mypham.san_pham.Product;
import com.mypham.san_pham.ProductImage;
import com.mypham.san_pham.ProductImageRepository;
import com.mypham.san_pham.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ReportService {

    private static final ZoneId TZ = ZoneId.of("Asia/Ho_Chi_Minh");

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final ProductImageRepository imageRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;
    private final CouponRepository couponRepository;
    private final GoiYAIRepository goiYAIRepository;

    @Transactional(readOnly = true)
    public OverviewResponse overview() {
        // Khoảng "30 ngày gần nhất" tính theo timezone VN: từ 00:00 30 ngày trước → giờ
        java.time.Instant since30 = LocalDate.now(TZ).minusDays(29).atStartOfDay(TZ).toInstant();
        java.time.Instant sinceToday = LocalDate.now(TZ).atStartOfDay(TZ).toInstant();

        return new OverviewResponse(
                orderRepository.sumRevenueSince(since30),
                orderRepository.sumRevenueSince(sinceToday),
                orderRepository.countCompletedSince(since30),
                orderRepository.countByTrangThai(Order.TrangThai.PENDING),
                orderRepository.countByTrangThai(Order.TrangThai.SHIPPING),
                orderRepository.countCancelledSince(since30),
                productRepository.countOutOfStock(),
                productRepository.countLowStock(),
                productRepository.countByTrangThai(Product.TrangThai.ACTIVE),
                categoryRepository.countByTrangThai(Category.TrangThai.ACTIVE),
                userRepository.countByTrangThai(User.TrangThai.ACTIVE),
                couponRepository.countByStatus(Coupon.Status.ACTIVE)
        );
    }

    /**
     * Doanh thu theo ngày — N ngày gần nhất (mặc định 30).
     * Trả về đầy đủ N dòng kể cả ngày không có đơn (tongTien=0, soDon=0)
     * để FE vẽ chart liên tục, không bị răng cưa.
     */
    @Transactional(readOnly = true)
    public List<RevenueDayResponse> revenueByDay(int days) {
        if (days < 1) days = 30;
        if (days > 365) days = 365;

        LocalDate today = LocalDate.now(TZ);
        LocalDate fromDate = today.minusDays(days - 1);
        java.time.Instant from = fromDate.atStartOfDay(TZ).toInstant();

        // Map ngày → data từ DB
        Map<String, RevenueDayResponse> byDay = new HashMap<>();
        for (Object[] row : orderRepository.revenueByDay(from)) {
            String ngay = (String) row[0];
            BigDecimal tong = row[1] == null ? BigDecimal.ZERO : (BigDecimal) row[1];
            long soDon = ((Number) row[2]).longValue();
            byDay.put(ngay, new RevenueDayResponse(ngay, tong, soDon));
        }

        // Build sequence đầy đủ
        List<RevenueDayResponse> result = new ArrayList<>(days);
        for (int i = 0; i < days; i++) {
            String ngay = fromDate.plusDays(i).toString();   // ISO YYYY-MM-DD
            RevenueDayResponse data = byDay.get(ngay);
            if (data == null) {
                result.add(new RevenueDayResponse(ngay, BigDecimal.ZERO, 0));
            } else {
                result.add(data);
            }
        }
        return result;
    }

    @Transactional(readOnly = true)
    public List<TopProductResponse> topProducts(int limit) {
        if (limit < 1) limit = 10;
        if (limit > 50) limit = 50;

        List<Object[]> rows = orderRepository.topProducts(limit);
        if (rows.isEmpty()) return List.of();

        // Batch fetch first image per product để tránh N+1
        java.util.Set<Long> ids = new HashSet<>();
        for (Object[] r : rows) ids.add(((Number) r[0]).longValue());

        Map<Long, String> firstImage = new LinkedHashMap<>();
        for (ProductImage img : imageRepository
                .findBySanPhamIdInOrderBySanPhamIdAscThuTuAsc(ids)) {
            firstImage.putIfAbsent(img.getSanPhamId(), img.getUrl());
        }

        List<TopProductResponse> result = new ArrayList<>(rows.size());
        for (Object[] r : rows) {
            Long id = ((Number) r[0]).longValue();
            String ten = (String) r[1];
            String ma = (String) r[2];
            long soLuongBan = ((Number) r[3]).longValue();
            BigDecimal doanhThu = r[4] == null ? BigDecimal.ZERO : (BigDecimal) r[4];
            result.add(new TopProductResponse(
                    id, ten, ma, firstImage.get(id), soLuongBan, doanhThu));
        }
        return result;
    }

    @Transactional(readOnly = true)
    public Map<Order.TrangThai, Long> orderStatusBreakdown() {
        Map<Order.TrangThai, Long> map = new LinkedHashMap<>();
        for (Order.TrangThai t : Order.TrangThai.values()) {
            map.put(t, orderRepository.countByTrangThai(t));
        }
        return map;
    }

    /**
     * UC 2.5.9 — báo cáo CTR AI (impressions vs clicks).
     * Trả overview tổng N ngày: impressions, clicks, ctr (0.0-1.0).
     */
    @Transactional(readOnly = true)
    public Map<String, Object> aiCtrOverview(int days) {
        if (days < 1) days = 30;
        if (days > 365) days = 365;
        java.time.Instant from = LocalDate.now(TZ).minusDays(days - 1).atStartOfDay(TZ).toInstant();

        long impressions = goiYAIRepository.countImpressionsSince(from);
        long clicks = goiYAIRepository.countClicksSince(from);
        double ctr = impressions == 0 ? 0.0 : (double) clicks / impressions;

        Map<String, Object> map = new LinkedHashMap<>();
        map.put("days", days);
        map.put("impressions", impressions);
        map.put("clicks", clicks);
        map.put("ctr", ctr);
        return map;
    }

    /**
     * CTR AI theo ngày — N ngày gần nhất (mặc định 30).
     * Fill ngày trống bằng 0/0/0 để FE vẽ chart liên tục.
     */
    @Transactional(readOnly = true)
    public List<CTRDayResponse> aiCtrByDay(int days) {
        if (days < 1) days = 30;
        if (days > 365) days = 365;

        LocalDate today = LocalDate.now(TZ);
        LocalDate fromDate = today.minusDays(days - 1);
        java.time.Instant from = fromDate.atStartOfDay(TZ).toInstant();

        Map<String, CTRDayResponse> byDay = new HashMap<>();
        for (Object[] row : goiYAIRepository.ctrByDay(from)) {
            String ngay = (String) row[0];
            long impressions = ((Number) row[1]).longValue();
            long clicks = row[2] == null ? 0L : ((Number) row[2]).longValue();
            double ctr = impressions == 0 ? 0.0 : (double) clicks / impressions;
            byDay.put(ngay, new CTRDayResponse(ngay, impressions, clicks, ctr));
        }

        List<CTRDayResponse> result = new ArrayList<>(days);
        for (int i = 0; i < days; i++) {
            String ngay = fromDate.plusDays(i).toString();
            CTRDayResponse data = byDay.get(ngay);
            if (data == null) {
                result.add(new CTRDayResponse(ngay, 0L, 0L, 0.0));
            } else {
                result.add(data);
            }
        }
        return result;
    }
}
