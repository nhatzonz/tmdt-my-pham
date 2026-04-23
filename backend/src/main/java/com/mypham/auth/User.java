package com.mypham.auth;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

/**
 * User entity — khớp bảng nguoi_dung (PDF 2.6).
 * Class Diagram PDF 2.8: fullName, email, password, role.
 */
@Entity
@Table(name = "nguoi_dung")
@Getter
@Setter
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "ho_ten", nullable = false, length = 100)
    private String hoTen;

    @Column(nullable = false, unique = true, length = 100)
    private String email;

    @Column(name = "mat_khau", nullable = false, length = 255)
    private String matKhau;

    @Enumerated(EnumType.STRING)
    @Column(name = "vai_tro", nullable = false, length = 20)
    private Role vaiTro = Role.CUSTOMER;

    @Column(name = "so_dien_thoai", length = 20)
    private String soDienThoai;

    @Column(name = "created_at", insertable = false, updatable = false)
    private Instant createdAt;

    public enum Role {
        CUSTOMER,
        ADMIN
    }
}
