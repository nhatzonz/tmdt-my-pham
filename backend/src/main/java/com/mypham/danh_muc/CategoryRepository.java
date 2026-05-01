package com.mypham.danh_muc;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CategoryRepository extends JpaRepository<Category, Long> {
    /** Check trùng tên CHỈ trong các danh mục còn ACTIVE — đã xoá thì cho dùng lại tên. */
    boolean existsByTenDanhMucAndTrangThai(String tenDanhMuc, Category.TrangThai trangThai);

    List<Category> findByTrangThaiOrderByThuTuAscIdAsc(Category.TrangThai trangThai);

    long countByTrangThai(Category.TrangThai trangThai);
}
