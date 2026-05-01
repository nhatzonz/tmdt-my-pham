package com.mypham.danh_muc;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "danh_muc")
@Getter
@Setter
public class Category {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "ten_danh_muc", nullable = false, length = 100)
    private String tenDanhMuc;

    @Column(name = "hinh_anh", columnDefinition = "text")
    private String hinhAnh;

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
