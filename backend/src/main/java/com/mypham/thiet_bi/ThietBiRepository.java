package com.mypham.thiet_bi;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ThietBiRepository extends JpaRepository<ThietBi, Long> {
    boolean existsByTenThietBiIgnoreCaseAndTrangThai(String tenThietBi, ThietBi.TrangThai trangThai);

    List<ThietBi> findByTrangThaiOrderByThuTuAscIdAsc(ThietBi.TrangThai trangThai);

    long countByTrangThai(ThietBi.TrangThai trangThai);
}
