package com.mypham.thiet_bi;

import com.mypham.common.exception.BusinessException;
import com.mypham.common.exception.ErrorCode;
import com.mypham.common.exception.ResourceNotFoundException;
import com.mypham.ma_loi.MaLoiRepository;
import com.mypham.upload.UploadService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class ThietBiService {

    private final ThietBiRepository thietBiRepository;
    private final MaLoiRepository maLoiRepository;
    private final UploadService uploadService;

    @Transactional
    public ThietBiResponse create(ThietBiRequest req) {
        if (thietBiRepository.existsByTenThietBiIgnoreCaseAndTrangThai(
                req.tenThietBi(), ThietBi.TrangThai.ACTIVE)) {
            throw new BusinessException(ErrorCode.VALIDATION_FAILED, "Thiết bị đã tồn tại");
        }
        ThietBi t = new ThietBi();
        applyFields(t, req);
        t.setTrangThai(ThietBi.TrangThai.ACTIVE);
        return toResponse(thietBiRepository.save(t));
    }

    @Transactional
    public ThietBiResponse update(Long id, ThietBiRequest req) {
        ThietBi t = thietBiRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("thiết bị", id));

        if (!t.getTenThietBi().equalsIgnoreCase(req.tenThietBi())
                && thietBiRepository.existsByTenThietBiIgnoreCaseAndTrangThai(
                        req.tenThietBi(), ThietBi.TrangThai.ACTIVE)) {
            throw new BusinessException(ErrorCode.VALIDATION_FAILED, "Thiết bị đã tồn tại");
        }
        String oldImg = t.getHinhAnh();
        applyFields(t, req);
        ThietBi saved = thietBiRepository.save(t);

        if (oldImg != null && !Objects.equals(oldImg, saved.getHinhAnh())) {
            uploadService.deleteByUrl(oldImg);
        }
        return toResponse(saved);
    }

    @Transactional
    public void delete(Long id) {
        ThietBi t = thietBiRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("thiết bị", id));
        if (maLoiRepository.countByThietBiId(id) > 0) {
            t.setTrangThai(ThietBi.TrangThai.HIDDEN);
            thietBiRepository.save(t);
            cascadeHideMaLoi(id);
            return;
        }
        if (t.getHinhAnh() != null) {
            uploadService.deleteByUrl(t.getHinhAnh());
        }
        thietBiRepository.delete(t);
    }

    private void cascadeHideMaLoi(Long thietBiId) {
        var list = maLoiRepository.findByThietBiIdAndTrangThai(
                thietBiId, com.mypham.ma_loi.MaLoi.TrangThai.ACTIVE);
        for (var m : list) {
            m.setTrangThai(com.mypham.ma_loi.MaLoi.TrangThai.HIDDEN);
        }
        if (!list.isEmpty()) maLoiRepository.saveAll(list);
    }

    @Transactional(readOnly = true)
    public List<ThietBiResponse> list() {
        List<ThietBi> all = thietBiRepository
                .findByTrangThaiOrderByThuTuAscIdAsc(ThietBi.TrangThai.ACTIVE);
        Map<Long, Long> countMap = new HashMap<>();
        for (Object[] row : maLoiRepository.countActiveGroupByThietBiId()) {
            countMap.put((Long) row[0], (Long) row[1]);
        }
        return all.stream()
                .map(t -> ThietBiResponse.from(t, countMap.getOrDefault(t.getId(), 0L)))
                .toList();
    }

    @Transactional(readOnly = true)
    public ThietBiResponse getById(Long id) {
        ThietBi t = thietBiRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("thiết bị", id));
        if (t.getTrangThai() != ThietBi.TrangThai.ACTIVE) {
            throw new ResourceNotFoundException("thiết bị", id);
        }
        return toResponse(t);
    }

    private void applyFields(ThietBi t, ThietBiRequest req) {
        t.setTenThietBi(req.tenThietBi().trim());
        t.setHang(blankToNull(req.hang()));
        t.setHinhAnh(blankToNull(req.hinhAnh()));
        t.setMoTa(req.moTa());
        t.setThuTu(req.thuTu() == null ? 0 : req.thuTu());
    }

    private static String blankToNull(String s) {
        return s == null || s.isBlank() ? null : s.trim();
    }

    private ThietBiResponse toResponse(ThietBi t) {
        return ThietBiResponse.from(t, maLoiRepository.countActiveByThietBiId(t.getId()));
    }
}
