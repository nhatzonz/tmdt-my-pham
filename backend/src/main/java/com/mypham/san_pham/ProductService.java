package com.mypham.san_pham;

import com.mypham.ai.AIClient;
import com.mypham.ai.AIProperties;
import com.mypham.common.exception.BusinessException;
import com.mypham.common.exception.ErrorCode;
import com.mypham.common.exception.ResourceNotFoundException;
import com.mypham.danh_muc.Category;
import com.mypham.danh_muc.CategoryRepository;
import com.mypham.don_hang.OrderDetailRepository;
import com.mypham.ton_kho.Inventory;
import com.mypham.ton_kho.InventoryRepository;
import com.mypham.ton_kho.InventoryService;
import com.mypham.upload.UploadService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Slf4j
@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final ProductImageRepository imageRepository;
    private final CategoryRepository categoryRepository;
    private final UploadService uploadService;
    private final InventoryService inventoryService;
    private final InventoryRepository inventoryRepository;
    private final OrderDetailRepository orderDetailRepository;
    private final AIClient aiClient;
    private final AIProperties aiProperties;

    @Transactional
    public ProductResponse create(ProductRequest req) {
        validateCategory(req.danhMucId());
        validateMaSanPhamUnique(req.maSanPham(), null);
        Product p = new Product();
        applyFields(p, req);
        p.setTrangThai(Product.TrangThai.ACTIVE);
        Product saved = productRepository.save(p);

        List<String> urls = saveImages(saved.getId(), req.hinhAnh());

        inventoryService.ensureRow(saved.getId());
        triggerIngest(saved);
        return ProductResponse.from(saved, urls);
    }

    @Transactional
    public ProductResponse update(Long id, ProductRequest req) {
        Product p = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("sản phẩm", id));
        validateCategory(req.danhMucId());
        validateMaSanPhamUnique(req.maSanPham(), id);
        applyFields(p, req);
        Product saved = productRepository.save(p);

        List<ProductImage> oldImages = imageRepository.findBySanPhamIdOrderByThuTuAsc(id);
        List<String> newUrls = req.hinhAnh() == null
                ? List.of()
                : req.hinhAnh().stream()
                        .filter(u -> u != null && !u.isBlank())
                        .distinct()
                        .toList();
        Set<String> newUrlSet = new HashSet<>(newUrls);

        for (ProductImage img : oldImages) {
            if (!newUrlSet.contains(img.getUrl())) {
                uploadService.deleteByUrl(img.getUrl());
                imageRepository.delete(img);
            }
        }

        java.util.Map<String, ProductImage> existingByUrl = new java.util.HashMap<>();
        for (ProductImage img : oldImages) existingByUrl.put(img.getUrl(), img);
        int order = 0;
        for (String url : newUrls) {
            ProductImage existing = existingByUrl.get(url);
            if (existing != null) {
                if (existing.getThuTu() == null || existing.getThuTu() != order) {
                    existing.setThuTu(order);
                    imageRepository.save(existing);
                }
            } else {
                ProductImage img = new ProductImage();
                img.setSanPhamId(id);
                img.setUrl(url);
                img.setThuTu(order);
                imageRepository.save(img);
            }
            order++;
        }
        triggerIngest(saved);
        return ProductResponse.from(saved, newUrls);
    }

    @Transactional
    public void delete(Long id) {
        Product p = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("sản phẩm", id));

        if (orderDetailRepository.existsBySanPhamId(id)) {

            p.setMaSanPham(null);
            p.setTrangThai(Product.TrangThai.HIDDEN);
            productRepository.save(p);
            triggerDeleteEmbedding(id);
            return;
        }

        List<ProductImage> images = imageRepository.findBySanPhamIdOrderByThuTuAsc(id);
        for (ProductImage img : images) {
            uploadService.deleteByUrl(img.getUrl());
        }

        productRepository.delete(p);
        triggerDeleteEmbedding(id);
    }

    @Transactional(readOnly = true)
    public List<ProductResponse> list() {

        return buildListResponses(
                productRepository.findByTrangThaiOrderByIdDesc(Product.TrangThai.ACTIVE));
    }

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

        Set<Long> activeCategoryIds = categoryRepository
                .findByTrangThaiOrderByThuTuAscIdAsc(com.mypham.danh_muc.Category.TrangThai.ACTIVE)
                .stream()
                .map(com.mypham.danh_muc.Category::getId)
                .collect(java.util.stream.Collectors.toSet());

        var stream = productRepository.findByTrangThaiOrderByIdDesc(Product.TrangThai.ACTIVE).stream()
                .filter(p -> activeCategoryIds.contains(p.getDanhMucId()))
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

        return buildListResponses(stream.toList());
    }

    @Transactional(readOnly = true)
    public ProductResponse getById(Long id) {
        Product p = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("sản phẩm", id));
        if (p.getTrangThai() != Product.TrangThai.ACTIVE) {
            throw new ResourceNotFoundException("sản phẩm", id);
        }

        com.mypham.danh_muc.Category cat = categoryRepository.findById(p.getDanhMucId()).orElse(null);
        if (cat == null || cat.getTrangThai() != com.mypham.danh_muc.Category.TrangThai.ACTIVE) {
            throw new ResourceNotFoundException("sản phẩm", id);
        }
        Integer ton = inventoryRepository.findBySanPhamId(id)
                .map(Inventory::getSoLuongTon)
                .orElse(0);
        return ProductResponse.from(p, getImageUrls(id), ton);
    }

    @Transactional(readOnly = true)
    public List<ProductResponse> search(String q) {
        String keyword = q == null ? "" : q.trim();
        String keywordNorm = stripDiacritics(keyword);
        Set<Long> activeCategoryIds = categoryRepository
                .findByTrangThaiOrderByThuTuAscIdAsc(com.mypham.danh_muc.Category.TrangThai.ACTIVE)
                .stream()
                .map(com.mypham.danh_muc.Category::getId)
                .collect(java.util.stream.Collectors.toSet());
        List<Product> filtered = productRepository.searchActive(keyword, keywordNorm).stream()
                .filter(p -> activeCategoryIds.contains(p.getDanhMucId()))
                .toList();
        return buildListResponses(filtered);
    }

    private static String stripDiacritics(String s) {
        if (s == null || s.isEmpty()) return "";
        String n = java.text.Normalizer.normalize(s, java.text.Normalizer.Form.NFD)
                .replaceAll("\\p{InCombiningDiacriticalMarks}+", "");
        return n.replace('đ', 'd').replace('Đ', 'D');
    }

    private List<ProductResponse> buildListResponses(List<Product> products) {
        if (products.isEmpty()) return List.of();

        Set<Long> ids = new HashSet<>();
        for (Product p : products) ids.add(p.getId());

        Map<Long, List<String>> imagesByProductId = new HashMap<>();
        for (ProductImage img : imageRepository
                .findBySanPhamIdInOrderBySanPhamIdAscThuTuAsc(ids)) {
            imagesByProductId
                    .computeIfAbsent(img.getSanPhamId(), k -> new java.util.ArrayList<>())
                    .add(img.getUrl());
        }

        Map<Long, Integer> tonByProductId = new HashMap<>();
        for (Inventory inv : inventoryRepository.findBySanPhamIdIn(ids)) {
            tonByProductId.put(inv.getSanPhamId(), inv.getSoLuongTon());
        }

        return products.stream()
                .map(p -> ProductResponse.from(
                        p,
                        imagesByProductId.getOrDefault(p.getId(), List.of()),
                        tonByProductId.getOrDefault(p.getId(), 0)))
                .toList();
    }

    private static boolean isEmpty(List<?> list) {
        return list == null || list.isEmpty();
    }

    private void validateCategory(Long danhMucId) {
        if (!categoryRepository.existsById(danhMucId)) {
            throw new BusinessException(ErrorCode.VALIDATION_FAILED, "Danh mục không tồn tại");
        }
    }

    private void validateMaSanPhamUnique(String maSanPham, Long excludeId) {
        String code = blankToNull(maSanPham);
        if (code == null) return;
        productRepository.findByMaSanPhamAndTrangThai(code, Product.TrangThai.ACTIVE)
                .filter(other -> excludeId == null || !other.getId().equals(excludeId))
                .ifPresent(other -> {
                    throw new BusinessException(
                            ErrorCode.VALIDATION_FAILED,
                            "Mã sản phẩm \"" + code + "\" đã được sử dụng");
                });
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

    private void triggerIngest(Product p) {
        if (!aiProperties.isIngestOnProductChange()) return;
        if (p.getTrangThai() != Product.TrangThai.ACTIVE) return;

        String tenDanhMuc = categoryRepository.findById(p.getDanhMucId())
                .map(Category::getTenDanhMuc)
                .orElse(null);
        String loaiDa = p.getLoaiDa() == null ? null : p.getLoaiDa().name();

        var payload = aiClient.ingestPayload(
                p.getId(),
                p.getTenSanPham(),
                p.getMoTa(),
                loaiDa,
                p.getThuongHieu(),
                tenDanhMuc
        );
        try {
            aiClient.postAsync("/ingest", payload);
        } catch (Exception ex) {
            log.warn("[AI ingest] product={} failed: {}", p.getId(), ex.getMessage());
        }
    }

    private void triggerDeleteEmbedding(Long sanPhamId) {
        if (!aiProperties.isIngestOnProductChange()) return;
        try {
            aiClient.postAsync("/ingest/delete", java.util.Map.of("sanPhamId", sanPhamId));
        } catch (Exception ex) {
            log.warn("[AI ingest delete] product={} failed: {}", sanPhamId, ex.getMessage());
        }
    }

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
