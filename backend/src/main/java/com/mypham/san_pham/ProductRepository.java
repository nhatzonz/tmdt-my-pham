package com.mypham.san_pham;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ProductRepository extends JpaRepository<Product, Long> {

    List<Product> findByTrangThaiOrderByIdDesc(Product.TrangThai trangThai);

    /**
     * Tìm sản phẩm ACTIVE theo từ khoá — match cả tên, mã thật, mã fallback "NL-00x", thương hiệu.
     * Service layer truyền vào HAI tham số:
     *   q       = từ khoá gốc người dùng gõ (giữ nguyên dấu)
     *   qNorm   = từ khoá đã LOWER + STRIP DẤU ở Java (Normalizer.NFD + remove combining marks)
     * Cột so sánh tương tự: cũng strip dấu bằng JS-level helper trước, nhưng vì SQL
     * không gọi Java được, ta dùng `regexp_replace + normalize NFD` của Postgres
     * (không cần extension `unaccent`) — hoạt động trên Postgres 13+.
     *
     * Match logic:
     *   - Plain LIKE trên text gốc (cho user gõ có dấu khớp đúng)
     *   - LIKE trên text đã strip dấu (cho user gõ "kem chong nang" khớp "Kem chống nắng")
     *   - Mã thật + mã fallback "NL-00x"
     *
     * Order: match exact mã > prefix tên > còn lại.
     */
    @Query(value = """
            SELECT * FROM san_pham p
            WHERE p.trang_thai = 'ACTIVE'
              AND (
                  LOWER(p.ten_san_pham) LIKE LOWER('%' || :q || '%')
               OR LOWER(translate(regexp_replace(normalize(p.ten_san_pham, NFD), '[\\u0300-\\u036f]', '', 'g'), 'đĐ', 'dD'))
                    LIKE LOWER('%' || :qNorm || '%')
               OR LOWER(COALESCE(p.ma_san_pham, '')) LIKE LOWER('%' || :q || '%')
               OR LOWER(COALESCE(p.thuong_hieu, '')) LIKE LOWER('%' || :q || '%')
               OR LOWER(translate(regexp_replace(normalize(COALESCE(p.thuong_hieu, ''), NFD), '[\\u0300-\\u036f]', '', 'g'), 'đĐ', 'dD'))
                    LIKE LOWER('%' || :qNorm || '%')
               OR LOWER('NL-' || LPAD(p.id::text, 3, '0')) LIKE LOWER('%' || :q || '%')
              )
            ORDER BY
                CASE
                    WHEN LOWER(COALESCE(p.ma_san_pham, '')) = LOWER(:q) THEN 0
                    WHEN LOWER('NL-' || LPAD(p.id::text, 3, '0')) = LOWER(:q) THEN 0
                    WHEN LOWER(p.ten_san_pham) LIKE LOWER(:q || '%') THEN 1
                    WHEN LOWER(translate(regexp_replace(normalize(p.ten_san_pham, NFD), '[\\u0300-\\u036f]', '', 'g'), 'đĐ', 'dD'))
                            LIKE LOWER(:qNorm || '%') THEN 2
                    ELSE 3
                END,
                p.id DESC
            """, nativeQuery = true)
    List<Product> searchActive(@Param("q") String q, @Param("qNorm") String qNorm);

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
