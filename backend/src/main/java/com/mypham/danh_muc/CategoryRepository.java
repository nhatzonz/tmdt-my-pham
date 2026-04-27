package com.mypham.danh_muc;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CategoryRepository extends JpaRepository<Category, Long> {
    boolean existsByTenDanhMuc(String tenDanhMuc);
    List<Category> findAllByOrderByThuTuAscIdAsc();
}
