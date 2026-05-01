package com.mypham.auth;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);

    /** Admin list — chỉ user ACTIVE, sort newest first. */
    List<User> findByTrangThaiOrderByIdDesc(User.TrangThai trangThai);

    /** Đếm admin còn hoạt động — chống xoá/hạ vai trò admin cuối cùng. */
    long countByVaiTroAndTrangThai(User.Role vaiTro, User.TrangThai trangThai);

    /** Tìm SDT đã được dùng bởi user ACTIVE khác — phục vụ check unique. */
    Optional<User> findBySoDienThoaiAndTrangThai(String soDienThoai, User.TrangThai trangThai);

    long countByTrangThai(User.TrangThai trangThai);
}
