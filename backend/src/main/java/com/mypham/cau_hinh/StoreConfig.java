package com.mypham.cau_hinh;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

@Entity
@Table(name = "cau_hinh_cua_hang")
@Getter
@Setter
public class StoreConfig {

    @Id
    @Column(nullable = false)
    private Long id = 1L;

    @Column(name = "ten_cua_hang", nullable = false, length = 255)
    private String tenCuaHang;

    @Column(name = "logo_url", columnDefinition = "text")
    private String logoUrl;

    @Column(name = "dia_chi_tinh", length = 100)
    private String diaChiTinh;

    @Column(name = "dia_chi_quan", length = 100)
    private String diaChiQuan;

    @Column(name = "dia_chi_phuong", length = 100)
    private String diaChiPhuong;

    @Column(name = "dia_chi_chi_tiet", length = 255)
    private String diaChiChiTiet;

    @Column(name = "so_dien_thoai", length = 20)
    private String soDienThoai;

    @Column(name = "email_lien_he", length = 100)
    private String emailLienHe;

    @Column(name = "link_facebook", columnDefinition = "text")
    private String linkFacebook;

    @Column(name = "link_instagram", columnDefinition = "text")
    private String linkInstagram;

    @Column(name = "link_tiktok", columnDefinition = "text")
    private String linkTiktok;

    @Column(name = "link_youtube", columnDefinition = "text")
    private String linkYoutube;

    @Column(name = "updated_at")
    private Instant updatedAt;
}
