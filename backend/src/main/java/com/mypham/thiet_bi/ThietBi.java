package com.mypham.thiet_bi;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "thiet_bi")
@Getter
@Setter
public class ThietBi {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "ten_thiet_bi", nullable = false, length = 150)
    private String tenThietBi;

    @Column(length = 100)
    private String hang;

    @Column(name = "hinh_anh", columnDefinition = "text")
    private String hinhAnh;

    @Column(name = "mo_ta", columnDefinition = "text")
    private String moTa;

    @Column(name = "thu_tu", nullable = false)
    private Integer thuTu = 0;

    @Enumerated(EnumType.STRING)
    @Column(name = "trang_thai", nullable = false, length = 20,
            columnDefinition = "varchar(20) NOT NULL DEFAULT 'ACTIVE'")
    private TrangThai trangThai = TrangThai.ACTIVE;

    public enum TrangThai {
        ACTIVE,
        HIDDEN
    }
}
