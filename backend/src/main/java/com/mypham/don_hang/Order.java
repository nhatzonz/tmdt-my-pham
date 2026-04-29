package com.mypham.don_hang;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "don_hang")
@Getter
@Setter
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "nguoi_dung_id", nullable = false)
    private Long nguoiDungId;

    @Column(name = "tong_tien", nullable = false, precision = 12, scale = 2)
    private BigDecimal tongTien;

    @Enumerated(EnumType.STRING)
    @Column(name = "trang_thai", nullable = false, length = 20)
    private TrangThai trangThai = TrangThai.PENDING;

    @Column(name = "dia_chi_giao", nullable = false, columnDefinition = "text")
    private String diaChiGiao;

    @Column(name = "phuong_thuc_tt", length = 20)
    private String phuongThucTt = "COD";

    @Column(name = "khuyen_mai_id")
    private Long khuyenMaiId;

    @Column(name = "created_at", insertable = false, updatable = false)
    private Instant createdAt;

    public enum TrangThai {
        PENDING,
        SHIPPING,
        COMPLETED,
        CANCELLED
    }
}
