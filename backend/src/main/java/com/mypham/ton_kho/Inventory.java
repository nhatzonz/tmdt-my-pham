package com.mypham.ton_kho;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "ton_kho")
@Getter
@Setter
public class Inventory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "san_pham_id", nullable = false, unique = true)
    private Long sanPhamId;

    @Column(name = "so_luong_ton", nullable = false)
    private Integer soLuongTon = 0;

    @Column(name = "nguong_canh_bao")
    private Integer nguongCanhBao = 10;
}
