package com.mypham.danh_muc;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

/**
 * Map bảng danh_muc (PDF 2.6).
 * Class Diagram PDF 2.8: Category (categoryName).
 */
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
}
