package com.mypham.san_pham;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ProductRepository extends JpaRepository<Product, Long> {

    List<Product> findByTrangThaiOrderByIdDesc(Product.TrangThai trangThai);

    @Query("""
            SELECT p FROM Product p
            WHERE p.trangThai = com.mypham.san_pham.Product.TrangThai.ACTIVE
              AND LOWER(p.tenSanPham) LIKE LOWER(CONCAT('%', :q, '%'))
            ORDER BY p.id DESC
            """)
    List<Product> searchActive(@Param("q") String q);

    @Query("""
            SELECT COUNT(p) FROM Product p
            WHERE p.danhMucId = :danhMucId
              AND p.trangThai = com.mypham.san_pham.Product.TrangThai.ACTIVE
            """)
    long countActiveByDanhMucId(@Param("danhMucId") Long danhMucId);

    /** Batch count cho danh sách danh mục — tránh N+1 trên category list. */
    @Query("""
            SELECT p.danhMucId, COUNT(p) FROM Product p
            WHERE p.trangThai = com.mypham.san_pham.Product.TrangThai.ACTIVE
            GROUP BY p.danhMucId
            """)
    List<Object[]> countActiveGroupByDanhMucId();

    /** Đếm tất cả sản phẩm (kể cả HIDDEN) trong danh mục — quyết định soft/hard delete category. */
    long countByDanhMucId(Long danhMucId);

    /** Tìm sản phẩm dùng mã maSanPham — phục vụ check unique app-level (loại HIDDEN). */
    java.util.Optional<Product> findByMaSanPhamAndTrangThai(String maSanPham, Product.TrangThai trangThai);

    long countByTrangThai(Product.TrangThai trangThai);

    /** Đếm sp ACTIVE đang hết hàng (so_luong_ton = 0) — JOIN qua ton_kho. */
    @Query(value = """
            SELECT COUNT(*)
            FROM san_pham sp
            JOIN ton_kho tk ON tk.san_pham_id = sp.id
            WHERE sp.trang_thai = 'ACTIVE'
              AND tk.so_luong_ton = 0
            """, nativeQuery = true)
    long countOutOfStock();

    /** Đếm sp ACTIVE đang dưới ngưỡng cảnh báo (nhưng > 0). */
    @Query(value = """
            SELECT COUNT(*)
            FROM san_pham sp
            JOIN ton_kho tk ON tk.san_pham_id = sp.id
            WHERE sp.trang_thai = 'ACTIVE'
              AND tk.so_luong_ton > 0
              AND tk.so_luong_ton < tk.nguong_canh_bao
            """, nativeQuery = true)
    long countLowStock();
}
