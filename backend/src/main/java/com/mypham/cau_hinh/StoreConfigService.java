package com.mypham.cau_hinh;

import com.mypham.upload.UploadService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class StoreConfigService {

    private static final Long SINGLETON_ID = 1L;

    private final StoreConfigRepository repository;
    private final UploadService uploadService;

    /** Lấy cấu hình. Tự tạo row default nếu chưa có (lần boot đầu). */
    @Transactional
    public StoreConfigResponse get() {
        return StoreConfigResponse.from(loadOrCreate());
    }

    @Transactional
    public StoreConfigResponse update(StoreConfigRequest req) {
        StoreConfig c = loadOrCreate();
        String oldLogo = c.getLogoUrl();
        String newLogo = blankToNull(req.logoUrl());

        c.setTenCuaHang(req.tenCuaHang().trim());
        c.setLogoUrl(newLogo);
        c.setDiaChiTinh(blankToNull(req.diaChiTinh()));
        c.setDiaChiQuan(blankToNull(req.diaChiQuan()));
        c.setDiaChiPhuong(blankToNull(req.diaChiPhuong()));
        c.setDiaChiChiTiet(blankToNull(req.diaChiChiTiet()));
        c.setSoDienThoai(blankToNull(req.soDienThoai()));
        c.setEmailLienHe(blankToNull(req.emailLienHe()));
        c.setLinkFacebook(blankToNull(req.linkFacebook()));
        c.setLinkInstagram(blankToNull(req.linkInstagram()));
        c.setLinkTiktok(blankToNull(req.linkTiktok()));
        c.setLinkYoutube(blankToNull(req.linkYoutube()));
        c.setUpdatedAt(Instant.now());
        StoreConfig saved = repository.save(c);

        // Xoá file logo cũ nếu admin đã thay (hoặc xoá hẳn).
        // deleteByUrl chỉ động vào file trong /uploads/, URL ngoài tự bỏ qua.
        if (oldLogo != null && !Objects.equals(oldLogo, newLogo)) {
            uploadService.deleteByUrl(oldLogo);
        }

        return StoreConfigResponse.from(saved);
    }

    private StoreConfig loadOrCreate() {
        return repository.findById(SINGLETON_ID).orElseGet(() -> {
            StoreConfig c = new StoreConfig();
            c.setId(SINGLETON_ID);
            c.setTenCuaHang("Ngọc Lan Beauty");
            c.setUpdatedAt(Instant.now());
            return repository.save(c);
        });
    }

    private static String blankToNull(String s) {
        return s == null || s.isBlank() ? null : s.trim();
    }
}
