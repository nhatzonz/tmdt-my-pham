package com.mypham.ai;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "goi_y_ai")
@Getter
@Setter
public class GoiYAI {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "nguoi_dung_id")
    private Long nguoiDungId;

    @Column(name = "san_pham_id", nullable = false)
    private Long sanPhamId;

    @Column(name = "diem_tuong_thich", precision = 5, scale = 4)
    private BigDecimal diemTuongThich;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Nguon nguon = Nguon.HOMEPAGE;

    @Column(name = "da_click", nullable = false)
    private Boolean daClick = false;

    @Column(name = "created_at", insertable = false, updatable = false)
    private Instant createdAt;

    public enum Nguon {
        CHAT,
        HOMEPAGE,
        PRODUCT_DETAIL
    }
}
