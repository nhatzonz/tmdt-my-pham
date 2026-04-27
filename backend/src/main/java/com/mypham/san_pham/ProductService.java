package com.mypham.san_pham;

import com.mypham.common.exception.BusinessException;
import com.mypham.common.exception.ErrorCode;
import com.mypham.common.exception.ResourceNotFoundException;
import com.mypham.danh_muc.CategoryRepository;
import com.mypham.upload.UploadService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final ProductImageRepository imageRepository;
    private final CategoryRepository categoryRepository;
    private final UploadService uploadService;

    // ---------- Admin ----------
    @Transactional
    public ProductResponse create(ProductRequest req) {
        validateCategory(req.danhMucId());
        Product p = new Product();
        applyFields(p, req);
        p.setTrangThai(Product.TrangThai.ACTIVE);
        Product saved = productRepository.save(p);

        List<String> urls = saveImages(saved.getId(), req.hinhAnh());
        return ProductResponse.from(saved, urls);
    }

    @Transactional
    public ProductResponse update(Long id, ProductRequest req) {
        Product p = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("sản phẩm", id));
        validateCategory(req.danhMucId());
        applyFields(p, req);
        Product saved = productRepository.save(p);

        // Cleanup ảnh cũ không còn trong list mới
        List<ProductImage> oldImages = imageRepository.findBySanPhamIdOrderByThuTuAsc(id);
        Set<String> newUrls = req.hinhAnh() == null ? Set.of() : new HashSet<>(req.hinhAnh());
        for (ProductImage img : oldImages) {
            if (!newUrls.contains(img.getUrl())) {
                uploadService.deleteByUrl(img.getUrl());
            }
        }
        imageRepository.deleteBySanPhamId(id);

        List<String> urls = saveImages(id, req.hinhAnh());
        return ProductResponse.from(saved, urls);
    }

    @Transactional
    public void delete(Long id) {
        Product p = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("sản phẩm", id));

        // Xoá file vật lý trước khi xoá DB row
        List<ProductImage> images = imageRepository.findBySanPhamIdOrderByThuTuAsc(id);
        for (ProductImage img : images) {
            uploadService.deleteByUrl(img.getUrl());
        }
        // CASCADE sẽ xoá san_pham_anh khi delete san_pham
        productRepository.delete(p);
    }

    @Transactional(readOnly = true)
    public List<ProductResponse> list() {
        return productRepository.findAll().stream()
                .map(p -> ProductResponse.from(p, getImageUrls(p.getId())))
                .toList();
    }

    // ---------- Public ----------
    @Transactional(readOnly = true)
    public List<ProductResponse> listPublic(
            List<Long> danhMucIds,
            List<Product.LoaiDa> loaiDas,
            List<String> thuongHieus,
            BigDecimal priceMin,
            BigDecimal priceMax,
            String sort
    ) {
        Set<String> brands = thuongHieus == null
                ? Set.of()
                : thuongHieus.stream()
                    .filter(s -> s != null && !s.isBlank())
                    .map(String::trim)
                    .map(String::toLowerCase)
                    .collect(java.util.stream.Collectors.toSet());

        var stream = productRepository.findByTrangThaiOrderByIdDesc(Product.TrangThai.ACTIVE).stream()
                .filter(p -> isEmpty(danhMucIds) || danhMucIds.contains(p.getDanhMucId()))
                .filter(p -> isEmpty(loaiDas) || loaiDas.contains(p.getLoaiDa()))
                .filter(p -> brands.isEmpty()
                        || (p.getThuongHieu() != null
                            && brands.contains(p.getThuongHieu().toLowerCase())))
                .filter(p -> priceMin == null || p.getGia().compareTo(priceMin) >= 0)
                .filter(p -> priceMax == null || p.getGia().compareTo(priceMax) <= 0);

        if ("price_asc".equalsIgnoreCase(sort)) {
            stream = stream.sorted(java.util.Comparator.comparing(Product::getGia));
        } else if ("price_desc".equalsIgnoreCase(sort)) {
            stream = stream.sorted(java.util.Comparator.comparing(Product::getGia).reversed());
        }

        return stream
                .map(p -> ProductResponse.from(p, getImageUrls(p.getId())))
                .toList();
    }

    @Transactional(readOnly = true)
    public ProductResponse getById(Long id) {
        Product p = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("sản phẩm", id));
        if (p.getTrangThai() != Product.TrangThai.ACTIVE) {
            throw new ResourceNotFoundException("sản phẩm", id);
        }
        return ProductResponse.from(p, getImageUrls(id));
    }

    @Transactional(readOnly = true)
    public List<ProductResponse> search(String q) {
        String keyword = q == null ? "" : q.trim();
        return productRepository.searchActive(keyword).stream()
                .map(p -> ProductResponse.from(p, getImageUrls(p.getId())))
                .toList();
    }

    // ---------- Helpers ----------
    private static boolean isEmpty(List<?> list) {
        return list == null || list.isEmpty();
    }

    private void validateCategory(Long danhMucId) {
        if (!categoryRepository.existsById(danhMucId)) {
            throw new BusinessException(ErrorCode.VALIDATION_FAILED, "Danh mục không tồn tại");
        }
    }

    private void applyFields(Product p, ProductRequest req) {
        p.setMaSanPham(blankToNull(req.maSanPham()));
        p.setTenSanPham(req.tenSanPham());
        p.setGia(req.gia());
        p.setLoaiDa(req.loaiDa());
        p.setDanhMucId(req.danhMucId());
        p.setMoTa(req.moTa());
        p.setThuongHieu(req.thuongHieu());
    }

    private static String blankToNull(String s) {
        return s == null || s.isBlank() ? null : s.trim();
    }

    private List<String> getImageUrls(Long sanPhamId) {
        return imageRepository.findBySanPhamIdOrderByThuTuAsc(sanPhamId).stream()
                .map(ProductImage::getUrl)
                .toList();
    }

    /** Lưu các URL thành ProductImage rows (không trùng), giữ thứ tự. */
    private List<String> saveImages(Long sanPhamId, List<String> urls) {
        if (urls == null || urls.isEmpty()) return List.of();
        Set<String> seen = new HashSet<>();
        int order = 0;
        for (String url : urls) {
            if (url == null || url.isBlank() || !seen.add(url)) continue;
            ProductImage img = new ProductImage();
            img.setSanPhamId(sanPhamId);
            img.setUrl(url);
            img.setThuTu(order++);
            imageRepository.save(img);
        }
        return urls.stream().filter(u -> u != null && !u.isBlank()).distinct().toList();
    }
}
