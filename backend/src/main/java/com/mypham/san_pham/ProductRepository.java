package com.mypham.san_pham;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ProductRepository extends JpaRepository<Product, Long> {

    @Query("""
            SELECT p FROM Product p
            WHERE p.trangThai = com.mypham.san_pham.Product.TrangThai.ACTIVE
              AND (:danhMucId IS NULL OR p.danhMucId = :danhMucId)
              AND (:loaiDa    IS NULL OR p.loaiDa   = :loaiDa)
            ORDER BY p.id DESC
            """)
    List<Product> findActiveWithFilters(@Param("danhMucId") Long danhMucId,
                                        @Param("loaiDa") Product.LoaiDa loaiDa);

    @Query("""
            SELECT p FROM Product p
            WHERE p.trangThai = com.mypham.san_pham.Product.TrangThai.ACTIVE
              AND LOWER(p.tenSanPham) LIKE LOWER(CONCAT('%', :q, '%'))
            ORDER BY p.id DESC
            """)
    List<Product> searchActive(@Param("q") String q);
}
