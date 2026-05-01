package com.mypham.san_pham;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ProductRepository extends JpaRepository<Product, Long> {

    List<Product> findByTrangThaiOrderByIdDesc(Product.TrangThai trangThai);

    List<Product> findByDanhMucIdAndTrangThai(Long danhMucId, Product.TrangThai trangThai);

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

    @Query("""
            SELECT p.danhMucId, COUNT(p) FROM Product p
            WHERE p.trangThai = com.mypham.san_pham.Product.TrangThai.ACTIVE
            GROUP BY p.danhMucId
            """)
    List<Object[]> countActiveGroupByDanhMucId();

    long countByDanhMucId(Long danhMucId);

    java.util.Optional<Product> findByMaSanPhamAndTrangThai(String maSanPham, Product.TrangThai trangThai);

    long countByTrangThai(Product.TrangThai trangThai);

    @Query(value = """
            SELECT COUNT(*)
            FROM san_pham sp
            JOIN ton_kho tk ON tk.san_pham_id = sp.id
            WHERE sp.trang_thai = 'ACTIVE'
              AND tk.so_luong_ton = 0
            """, nativeQuery = true)
    long countOutOfStock();

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
