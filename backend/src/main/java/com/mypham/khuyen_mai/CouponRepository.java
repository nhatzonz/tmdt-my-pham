package com.mypham.khuyen_mai;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CouponRepository extends JpaRepository<Coupon, Long> {
    Optional<Coupon> findByMaCode(String maCode);

    long countByStatus(Coupon.Status status);
}
