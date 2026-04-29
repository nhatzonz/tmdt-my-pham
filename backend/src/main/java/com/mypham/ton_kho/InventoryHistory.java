package com.mypham.ton_kho;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

/** Audit log mỗi thay đổi tồn kho. */
@Entity
@Table(name = "lich_su_kho")
@Getter
@Setter
public class InventoryHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "san_pham_id", nullable = false)
    private Long sanPhamId;

    @Column(name = "nguoi_dung_id")
    private Long nguoiDungId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private LogAction action;

    @Column(name = "so_luong", nullable = false)
    private Integer soLuong;

    @Column(name = "ton_truoc", nullable = false)
    private Integer tonTruoc;

    @Column(name = "ton_sau", nullable = false)
    private Integer tonSau;

    @Column(length = 100)
    private String nguon;

    @Column(name = "ghi_chu", columnDefinition = "text")
    private String ghiChu;

    @Column(name = "created_at", insertable = false, updatable = false)
    private Instant createdAt;

    public enum LogAction {
        IMPORT,   // nhập kho (admin)
        EXPORT,   // xuất kho thủ công (admin)
        SET,      // đặt cứng (kiểm kê)
        ORDER     // trừ kho do customer đặt hàng
    }
}
