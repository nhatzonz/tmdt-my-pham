package com.mypham.ton_kho;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface InventoryHistoryRepository extends JpaRepository<InventoryHistory, Long> {
    List<InventoryHistory> findAllByOrderByIdDesc();
    List<InventoryHistory> findBySanPhamIdOrderByIdDesc(Long sanPhamId);
}
