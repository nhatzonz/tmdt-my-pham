package com.mypham.ma_loi;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

@Entity
@Table(name = "ma_loi")
@Getter
@Setter
public class MaLoi {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "ma_loi", nullable = false, length = 50)
    private String maLoi;

    @Column(name = "ten_loi", nullable = false, length = 255)
    private String tenLoi;

    @Column(name = "thiet_bi_id", nullable = false)
    private Long thietBiId;

    @Column(name = "mo_ta", columnDefinition = "text")
    private String moTa;

    @Column(name = "nguyen_nhan", columnDefinition = "text")
    private String nguyenNhan;

    @Column(name = "cach_khac_phuc", columnDefinition = "text")
    private String cachKhacPhuc;

    @Enumerated(EnumType.STRING)
    @Column(name = "muc_do", nullable = false, length = 20)
    private MucDo mucDo = MucDo.TRUNG_BINH;

    @Enumerated(EnumType.STRING)
    @Column(name = "trang_thai", nullable = false, length = 20)
    private TrangThai trangThai = TrangThai.ACTIVE;

    @Column(name = "luot_xem", nullable = false)
    private Long luotXem = 0L;

    @Column(name = "created_at", insertable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", insertable = false, updatable = false)
    private Instant updatedAt;

    public enum MucDo {
        NHE,
        TRUNG_BINH,
        NGHIEM_TRONG
    }

    public enum TrangThai {
        ACTIVE,
        HIDDEN
    }
}
