package com.mypham.ma_loi;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;

public interface MaLoiAnhRepository extends JpaRepository<MaLoiAnh, Long> {
    List<MaLoiAnh> findByMaLoiIdOrderByThuTuAsc(Long maLoiId);
    List<MaLoiAnh> findByMaLoiIdInOrderByMaLoiIdAscThuTuAsc(Collection<Long> maLoiIds);
    void deleteByMaLoiId(Long maLoiId);
}
