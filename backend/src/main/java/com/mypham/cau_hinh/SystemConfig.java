package com.mypham.cau_hinh;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

@Entity
@Table(name = "cau_hinh_he_thong")
@Getter
@Setter
public class SystemConfig {

    @Id
    private Long id = 1L;

    @Column(name = "ten_he_thong", nullable = false, length = 255)
    private String tenHeThong = "Tra Cứu Mã Lỗi";

    @Column(name = "logo_url", columnDefinition = "text")
    private String logoUrl;

    @Column(name = "mo_ta", columnDefinition = "text")
    private String moTa;

    @Column(name = "so_dien_thoai", length = 20)
    private String soDienThoai;

    @Column(name = "email_lien_he", length = 100)
    private String emailLienHe;

    @Column(name = "dia_chi", length = 255)
    private String diaChi;

    @Column(name = "link_facebook", columnDefinition = "text")
    private String linkFacebook;

    @Column(name = "link_youtube", columnDefinition = "text")
    private String linkYoutube;

    @Column(name = "updated_at", insertable = false, updatable = false)
    private Instant updatedAt;
}
