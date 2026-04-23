package com.mypham.danh_muc;

import org.springframework.data.jpa.repository.JpaRepository;

public interface CategoryRepository extends JpaRepository<Category, Long> {
    boolean existsByTenDanhMuc(String tenDanhMuc);
}
