package com.mypham.san_pham;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

/** Map bảng san_pham_anh — 1 sản phẩm có N ảnh. */
@Entity
@Table(name = "san_pham_anh")
@Getter
@Setter
public class ProductImage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "san_pham_id", nullable = false)
    private Long sanPhamId;

    @Column(nullable = false, columnDefinition = "text")
    private String url;

    @Column(name = "thu_tu", nullable = false)
    private Integer thuTu = 0;

    @Column(name = "created_at", insertable = false, updatable = false)
    private Instant createdAt;
}
