package com.mypham.ton_kho;

import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface InventoryRepository extends JpaRepository<Inventory, Long> {
    Optional<Inventory> findBySanPhamId(Long sanPhamId);

    /** Khoá row cho transaction checkout — chống race oversell. */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT i FROM Inventory i WHERE i.sanPhamId = :sanPhamId")
    Optional<Inventory> findBySanPhamIdForUpdate(@Param("sanPhamId") Long sanPhamId);
}
