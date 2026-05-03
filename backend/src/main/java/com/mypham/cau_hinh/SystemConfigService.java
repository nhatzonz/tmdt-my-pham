package com.mypham.cau_hinh;

import com.mypham.upload.UploadService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Objects;

@Service
@RequiredArgsConstructor
public class SystemConfigService {

    private final SystemConfigRepository repository;
    private final UploadService uploadService;

    @Transactional(readOnly = true)
    public SystemConfigResponse get() {
        SystemConfig c = repository.findById(1L).orElseGet(this::createDefault);
        return SystemConfigResponse.from(c);
    }

    @Transactional
    public SystemConfigResponse update(SystemConfigRequest req) {
        SystemConfig c = repository.findById(1L).orElseGet(this::createDefault);
        String oldLogo = c.getLogoUrl();

        c.setTenHeThong(req.tenHeThong().trim());
        c.setLogoUrl(blankToNull(req.logoUrl()));
        c.setMoTa(req.moTa());
        c.setSoDienThoai(blankToNull(req.soDienThoai()));
        c.setEmailLienHe(blankToNull(req.emailLienHe()));
        c.setDiaChi(blankToNull(req.diaChi()));
        c.setLinkFacebook(blankToNull(req.linkFacebook()));
        c.setLinkYoutube(blankToNull(req.linkYoutube()));

        SystemConfig saved = repository.save(c);
        if (oldLogo != null && !Objects.equals(oldLogo, saved.getLogoUrl())) {
            uploadService.deleteByUrl(oldLogo);
        }
        return SystemConfigResponse.from(saved);
    }

    private SystemConfig createDefault() {
        SystemConfig c = new SystemConfig();
        c.setId(1L);
        c.setTenHeThong("Tra Cứu Mã Lỗi");
        return repository.save(c);
    }

    private static String blankToNull(String s) {
        return s == null || s.isBlank() ? null : s.trim();
    }
}
