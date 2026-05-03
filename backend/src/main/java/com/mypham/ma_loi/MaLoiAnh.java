package com.mypham.ma_loi;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

@Entity
@Table(name = "ma_loi_anh")
@Getter
@Setter
public class MaLoiAnh {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "ma_loi_id", nullable = false)
    private Long maLoiId;

    @Column(nullable = false, columnDefinition = "text")
    private String url;

    @Column(name = "thu_tu", nullable = false)
    private Integer thuTu = 0;

    @Column(name = "created_at", insertable = false, updatable = false)
    private Instant createdAt;
}
