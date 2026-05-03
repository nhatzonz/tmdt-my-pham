package com.mypham.ma_loi;

import com.mypham.common.exception.BusinessException;
import com.mypham.common.exception.ErrorCode;
import com.mypham.common.exception.ResourceNotFoundException;
import com.mypham.thiet_bi.ThietBi;
import com.mypham.thiet_bi.ThietBiRepository;
import com.mypham.upload.UploadService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Slf4j
@Service
@RequiredArgsConstructor
public class MaLoiService {

    private final MaLoiRepository maLoiRepository;
    private final MaLoiAnhRepository anhRepository;
    private final ThietBiRepository thietBiRepository;
    private final UploadService uploadService;

    @Transactional
    public MaLoiResponse create(MaLoiRequest req) {
        validateThietBi(req.thietBiId());
        validateMaLoiUnique(req.thietBiId(), req.maLoi(), null);
        MaLoi m = new MaLoi();
        applyFields(m, req);
        m.setTrangThai(MaLoi.TrangThai.ACTIVE);
        m.setLuotXem(0L);
        MaLoi saved = maLoiRepository.save(m);

        List<String> urls = saveImages(saved.getId(), req.hinhAnh());
        return toResponse(saved, urls);
    }

    @Transactional
    public MaLoiResponse update(Long id, MaLoiRequest req) {
        MaLoi m = maLoiRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("mã lỗi", id));
        validateThietBi(req.thietBiId());
        validateMaLoiUnique(req.thietBiId(), req.maLoi(), id);
        applyFields(m, req);
        MaLoi saved = maLoiRepository.save(m);

        List<MaLoiAnh> oldImages = anhRepository.findByMaLoiIdOrderByThuTuAsc(id);
        List<String> newUrls = req.hinhAnh() == null
                ? List.of()
                : req.hinhAnh().stream()
                        .filter(u -> u != null && !u.isBlank())
                        .distinct()
                        .toList();
        Set<String> newUrlSet = new HashSet<>(newUrls);

        for (MaLoiAnh img : oldImages) {
            if (!newUrlSet.contains(img.getUrl())) {
                uploadService.deleteByUrl(img.getUrl());
                anhRepository.delete(img);
            }
        }

        Map<String, MaLoiAnh> existingByUrl = new HashMap<>();
        for (MaLoiAnh img : oldImages) existingByUrl.put(img.getUrl(), img);
        int order = 0;
        for (String url : newUrls) {
            MaLoiAnh existing = existingByUrl.get(url);
            if (existing != null) {
                if (existing.getThuTu() == null || existing.getThuTu() != order) {
                    existing.setThuTu(order);
                    anhRepository.save(existing);
                }
            } else {
                MaLoiAnh img = new MaLoiAnh();
                img.setMaLoiId(id);
                img.setUrl(url);
                img.setThuTu(order);
                anhRepository.save(img);
            }
            order++;
        }
        return toResponse(saved, newUrls);
    }

    @Transactional
    public void delete(Long id) {
        MaLoi m = maLoiRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("mã lỗi", id));

        List<MaLoiAnh> images = anhRepository.findByMaLoiIdOrderByThuTuAsc(id);
        for (MaLoiAnh img : images) {
            uploadService.deleteByUrl(img.getUrl());
        }
        maLoiRepository.delete(m);
    }

    @Transactional(readOnly = true)
    public List<MaLoiResponse> list() {
        return buildListResponses(
                maLoiRepository.findByTrangThaiOrderByIdDesc(MaLoi.TrangThai.ACTIVE));
    }

    @Transactional(readOnly = true)
    public List<MaLoiResponse> listPublic(
            List<Long> thietBiIds,
            List<MaLoi.MucDo> mucDos,
            String sort
    ) {
        Set<Long> activeThietBiIds = thietBiRepository
                .findByTrangThaiOrderByThuTuAscIdAsc(ThietBi.TrangThai.ACTIVE)
                .stream()
                .map(ThietBi::getId)
                .collect(java.util.stream.Collectors.toSet());

        var stream = maLoiRepository.findByTrangThaiOrderByIdDesc(MaLoi.TrangThai.ACTIVE).stream()
                .filter(m -> activeThietBiIds.contains(m.getThietBiId()))
                .filter(m -> isEmpty(thietBiIds) || thietBiIds.contains(m.getThietBiId()))
                .filter(m -> isEmpty(mucDos) || mucDos.contains(m.getMucDo()));

        if ("luot_xem_desc".equalsIgnoreCase(sort)) {
            stream = stream.sorted(java.util.Comparator
                    .comparing((MaLoi m) -> m.getLuotXem() == null ? 0L : m.getLuotXem())
                    .reversed());
        } else if ("ma_loi_asc".equalsIgnoreCase(sort)) {
            stream = stream.sorted(java.util.Comparator.comparing(MaLoi::getMaLoi));
        }
        return buildListResponses(stream.toList());
    }

    @Transactional(readOnly = true)
    public List<MaLoiResponse> search(String q) {
        String keyword = q == null ? "" : q.trim();
        String keywordNorm = stripDiacritics(keyword);
        Set<Long> activeThietBiIds = thietBiRepository
                .findByTrangThaiOrderByThuTuAscIdAsc(ThietBi.TrangThai.ACTIVE)
                .stream()
                .map(ThietBi::getId)
                .collect(java.util.stream.Collectors.toSet());
        List<MaLoi> filtered = maLoiRepository.searchActive(keyword, keywordNorm).stream()
                .filter(m -> activeThietBiIds.contains(m.getThietBiId()))
                .toList();
        return buildListResponses(filtered);
    }

    @Transactional
    public MaLoiResponse getById(Long id, boolean increaseView) {
        MaLoi m = maLoiRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("mã lỗi", id));
        if (m.getTrangThai() != MaLoi.TrangThai.ACTIVE) {
            throw new ResourceNotFoundException("mã lỗi", id);
        }
        ThietBi tb = thietBiRepository.findById(m.getThietBiId()).orElse(null);
        if (tb == null || tb.getTrangThai() != ThietBi.TrangThai.ACTIVE) {
            throw new ResourceNotFoundException("mã lỗi", id);
        }
        if (increaseView) {
            m.setLuotXem((m.getLuotXem() == null ? 0L : m.getLuotXem()) + 1);
            m = maLoiRepository.save(m);
        }
        return MaLoiResponse.from(m, tb.getTenThietBi(), tb.getHang(), getImageUrls(id));
    }

    private static String stripDiacritics(String s) {
        if (s == null || s.isEmpty()) return "";
        String n = java.text.Normalizer.normalize(s, java.text.Normalizer.Form.NFD)
                .replaceAll("\\p{InCombiningDiacriticalMarks}+", "");
        return n.replace('đ', 'd').replace('Đ', 'D');
    }

    private List<MaLoiResponse> buildListResponses(List<MaLoi> list) {
        if (list.isEmpty()) return List.of();
        Set<Long> ids = new HashSet<>();
        Set<Long> tbIds = new HashSet<>();
        for (MaLoi m : list) {
            ids.add(m.getId());
            tbIds.add(m.getThietBiId());
        }
        Map<Long, List<String>> imgMap = new HashMap<>();
        for (MaLoiAnh img : anhRepository.findByMaLoiIdInOrderByMaLoiIdAscThuTuAsc(ids)) {
            imgMap.computeIfAbsent(img.getMaLoiId(), k -> new ArrayList<>()).add(img.getUrl());
        }
        Map<Long, ThietBi> tbMap = new HashMap<>();
        for (ThietBi tb : thietBiRepository.findAllById(tbIds)) {
            tbMap.put(tb.getId(), tb);
        }
        return list.stream()
                .map(m -> {
                    ThietBi tb = tbMap.get(m.getThietBiId());
                    return MaLoiResponse.from(
                            m,
                            tb == null ? null : tb.getTenThietBi(),
                            tb == null ? null : tb.getHang(),
                            imgMap.getOrDefault(m.getId(), List.of()));
                })
                .toList();
    }

    private static boolean isEmpty(List<?> list) {
        return list == null || list.isEmpty();
    }

    private void validateThietBi(Long thietBiId) {
        if (!thietBiRepository.existsById(thietBiId)) {
            throw new BusinessException(ErrorCode.VALIDATION_FAILED, "Thiết bị không tồn tại");
        }
    }

    private void validateMaLoiUnique(Long thietBiId, String maLoi, Long excludeId) {
        if (maLoi == null || maLoi.isBlank()) return;
        maLoiRepository.findByThietBiIdAndMaLoiIgnoreCase(thietBiId, maLoi.trim())
                .filter(other -> excludeId == null || !other.getId().equals(excludeId))
                .ifPresent(other -> {
                    throw new BusinessException(
                            ErrorCode.VALIDATION_FAILED,
                            "Mã lỗi \"" + maLoi + "\" đã tồn tại cho thiết bị này");
                });
    }

    private void applyFields(MaLoi m, MaLoiRequest req) {
        m.setMaLoi(req.maLoi().trim());
        m.setTenLoi(req.tenLoi().trim());
        m.setThietBiId(req.thietBiId());
        m.setMoTa(req.moTa());
        m.setNguyenNhan(req.nguyenNhan());
        m.setCachKhacPhuc(req.cachKhacPhuc());
        m.setMucDo(req.mucDo());
    }

    private List<String> getImageUrls(Long maLoiId) {
        return anhRepository.findByMaLoiIdOrderByThuTuAsc(maLoiId).stream()
                .map(MaLoiAnh::getUrl)
                .toList();
    }

    private List<String> saveImages(Long maLoiId, List<String> urls) {
        if (urls == null || urls.isEmpty()) return List.of();
        Set<String> seen = new HashSet<>();
        int order = 0;
        for (String url : urls) {
            if (url == null || url.isBlank() || !seen.add(url)) continue;
            MaLoiAnh img = new MaLoiAnh();
            img.setMaLoiId(maLoiId);
            img.setUrl(url);
            img.setThuTu(order++);
            anhRepository.save(img);
        }
        return urls.stream().filter(u -> u != null && !u.isBlank()).distinct().toList();
    }

    private MaLoiResponse toResponse(MaLoi m, List<String> urls) {
        ThietBi tb = thietBiRepository.findById(m.getThietBiId()).orElse(null);
        return MaLoiResponse.from(m,
                tb == null ? null : tb.getTenThietBi(),
                tb == null ? null : tb.getHang(),
                urls);
    }
}
