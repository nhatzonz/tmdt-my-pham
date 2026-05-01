package com.mypham.don_hang;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Optional;

public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByNguoiDungIdOrderByIdDesc(Long nguoiDungId);
    Optional<Order> findByIdAndNguoiDungId(Long id, Long nguoiDungId);

    List<Order> findAllByOrderByIdDesc();
    List<Order> findByTrangThaiOrderByIdDesc(Order.TrangThai trangThai);
    long countByTrangThai(Order.TrangThai trangThai);
    boolean existsByKhuyenMaiId(Long khuyenMaiId);

    // ========== REPORTS ==========

    /** Tổng doanh thu COMPLETED từ thời điểm `from` tới hiện tại. NULL → 0. */
    @Query("""
            SELECT COALESCE(SUM(o.tongTien), 0) FROM Order o
            WHERE o.trangThai = com.mypham.don_hang.Order.TrangThai.COMPLETED
              AND o.createdAt >= :from
            """)
    BigDecimal sumRevenueSince(@Param("from") Instant from);

    /** Đếm đơn COMPLETED từ `from` tới hiện tại. */
    @Query("""
            SELECT COUNT(o) FROM Order o
            WHERE o.trangThai = com.mypham.don_hang.Order.TrangThai.COMPLETED
              AND o.createdAt >= :from
            """)
    long countCompletedSince(@Param("from") Instant from);

    /** Đếm đơn CANCELLED từ `from` tới hiện tại. */
    @Query("""
            SELECT COUNT(o) FROM Order o
            WHERE o.trangThai = com.mypham.don_hang.Order.TrangThai.CANCELLED
              AND o.createdAt >= :from
            """)
    long countCancelledSince(@Param("from") Instant from);

    /**
     * Doanh thu theo ngày — chỉ COMPLETED, group theo timezone Asia/Ho_Chi_Minh.
     * Trả Object[] {ngay (string YYYY-MM-DD), tong (numeric), soDon (bigint)}.
     */
    @Query(value = """
            SELECT TO_CHAR(DATE(created_at AT TIME ZONE 'Asia/Ho_Chi_Minh'), 'YYYY-MM-DD') AS ngay,
                   SUM(tong_tien) AS tong,
                   COUNT(*) AS so_don
            FROM don_hang
            WHERE trang_thai = 'COMPLETED'
              AND created_at >= :from
            GROUP BY ngay
            ORDER BY ngay
            """, nativeQuery = true)
    List<Object[]> revenueByDay(@Param("from") Instant from);

    /**
     * Top sản phẩm bán chạy — chỉ tính từ đơn COMPLETED.
     * Trả {san_pham_id, ten, ma, so_luong_ban, doanh_thu}.
     */
    @Query(value = """
            SELECT ct.san_pham_id, sp.ten_san_pham, sp.ma_san_pham,
                   SUM(ct.so_luong) AS so_luong_ban,
                   SUM(ct.gia_ban * ct.so_luong) AS doanh_thu
            FROM chi_tiet_don_hang ct
            JOIN don_hang dh ON ct.don_hang_id = dh.id
            JOIN san_pham sp ON ct.san_pham_id = sp.id
            WHERE dh.trang_thai = 'COMPLETED'
            GROUP BY ct.san_pham_id, sp.ten_san_pham, sp.ma_san_pham
            ORDER BY so_luong_ban DESC
            LIMIT :lim
            """, nativeQuery = true)
    List<Object[]> topProducts(@Param("lim") int limit);
}
