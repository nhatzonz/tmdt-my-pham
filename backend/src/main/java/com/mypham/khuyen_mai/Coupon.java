package com.mypham.khuyen_mai;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "khuyen_mai")
@Getter
@Setter
public class Coupon {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "ma_code", nullable = false, unique = true, length = 50)
    private String maCode;

    @Column(name = "phan_tram_giam", nullable = false, precision = 5, scale = 2)
    private BigDecimal phanTramGiam;

    @Column(name = "start_at", nullable = false)
    private Instant startAt;

    @Column(name = "end_at", nullable = false)
    private Instant endAt;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private Status status = Status.ACTIVE;

    /** Tổng số lần mã có thể được dùng. NULL = không giới hạn. */
    @Column(name = "so_luong",
            columnDefinition = "integer")
    private Integer soLuong;

    /** Đã dùng bao nhiêu lần. Tăng khi checkout, giảm khi huỷ đơn. */
    @Column(name = "da_su_dung", nullable = false,
            columnDefinition = "integer NOT NULL DEFAULT 0")
    private Integer daSuDung = 0;

    public enum Status {
        ACTIVE,
        INACTIVE,
        HIDDEN     // Soft-delete: ẩn khỏi mọi UI, đơn cũ vẫn ref
    }
}
