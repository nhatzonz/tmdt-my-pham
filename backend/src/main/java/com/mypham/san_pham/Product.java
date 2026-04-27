package com.mypham.san_pham;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.Instant;

/**
 * Map bảng san_pham (PDF 2.6).
 * Class Diagram PDF 2.8: Product (name, price, skinType, description).
 * loai_da = input AI (UC 2.3.3) — bắt buộc.
 */
@Entity
@Table(name = "san_pham")
@Getter
@Setter
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "ma_san_pham", unique = true, length = 50)
    private String maSanPham;

    @Column(name = "ten_san_pham", nullable = false, length = 255)
    private String tenSanPham;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal gia;

    @Enumerated(EnumType.STRING)
    @Column(name = "loai_da", nullable = false, length = 50)
    private LoaiDa loaiDa;

    @Column(name = "danh_muc_id", nullable = false)
    private Long danhMucId;

    @Column(name = "mo_ta", columnDefinition = "text")
    private String moTa;

    @Column(name = "thuong_hieu", length = 100)
    private String thuongHieu;

    @Enumerated(EnumType.STRING)
    @Column(name = "trang_thai", length = 20)
    private TrangThai trangThai = TrangThai.ACTIVE;

    @Column(name = "created_at", insertable = false, updatable = false)
    private Instant createdAt;

    public enum LoaiDa {
        OILY,
        DRY,
        COMBINATION,
        SENSITIVE,
        NORMAL,
        ALL
    }

    public enum TrangThai {
        ACTIVE,
        HIDDEN
    }
}
