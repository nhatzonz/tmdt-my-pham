package com.mypham.san_pham;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProductImageRepository extends JpaRepository<ProductImage, Long> {
    List<ProductImage> findBySanPhamIdOrderByThuTuAsc(Long sanPhamId);
    void deleteBySanPhamId(Long sanPhamId);
}
