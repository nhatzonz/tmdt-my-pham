package com.mypham.don_hang;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByNguoiDungIdOrderByIdDesc(Long nguoiDungId);
    Optional<Order> findByIdAndNguoiDungId(Long id, Long nguoiDungId);
}
