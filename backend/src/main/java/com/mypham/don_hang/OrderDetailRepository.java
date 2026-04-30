package com.mypham.don_hang;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OrderDetailRepository extends JpaRepository<OrderDetail, Long> {
    List<OrderDetail> findByDonHangId(Long donHangId);
    List<OrderDetail> findByDonHangIdIn(java.util.Collection<Long> donHangIds);
}
