package com.mypham.auth;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);

    List<User> findByTrangThaiOrderByIdDesc(User.TrangThai trangThai);

    long countByVaiTroAndTrangThai(User.Role vaiTro, User.TrangThai trangThai);

    Optional<User> findBySoDienThoaiAndTrangThai(String soDienThoai, User.TrangThai trangThai);

    long countByTrangThai(User.TrangThai trangThai);
}
