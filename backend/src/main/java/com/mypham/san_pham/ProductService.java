package com.mypham.san_pham;

import com.mypham.common.exception.BusinessException;
import com.mypham.common.exception.ErrorCode;
import com.mypham.common.exception.ResourceNotFoundException;
import com.mypham.danh_muc.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;

    // ---------- Admin ----------
    @Transactional
    public ProductResponse create(ProductRequest req) {
        validateCategory(req.danhMucId());
        Product p = new Product();
        applyFields(p, req);
        p.setTrangThai(Product.TrangThai.ACTIVE);
        return ProductResponse.from(productRepository.save(p));
    }

    @Transactional
    public ProductResponse update(Long id, ProductRequest req) {
        Product p = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("sản phẩm", id));
        validateCategory(req.danhMucId());
        applyFields(p, req);
        return ProductResponse.from(productRepository.save(p));
    }

    @Transactional
    public void delete(Long id) {
        if (!productRepository.existsById(id)) {
            throw new ResourceNotFoundException("sản phẩm", id);
        }
        productRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public List<ProductResponse> list() {
        return productRepository.findAll().stream().map(ProductResponse::from).toList();
    }

    // ---------- Public ----------
    @Transactional(readOnly = true)
    public List<ProductResponse> listPublic(
            List<Long> danhMucIds,
            List<Product.LoaiDa> loaiDas,
            List<String> thuongHieus,
            String sort
    ) {
        java.util.Set<String> brands = thuongHieus == null
                ? java.util.Set.of()
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
                            && brands.contains(p.getThuongHieu().toLowerCase())));

        if ("price_asc".equalsIgnoreCase(sort)) {
            stream = stream.sorted(java.util.Comparator.comparing(Product::getGia));
        } else if ("price_desc".equalsIgnoreCase(sort)) {
            stream = stream.sorted(java.util.Comparator.comparing(Product::getGia).reversed());
        }

        return stream.map(ProductResponse::from).toList();
    }

    private static boolean isEmpty(List<?> list) {
        return list == null || list.isEmpty();
    }

    @Transactional(readOnly = true)
    public ProductResponse getById(Long id) {
        Product p = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("sản phẩm", id));
        if (p.getTrangThai() != Product.TrangThai.ACTIVE) {
            throw new ResourceNotFoundException("sản phẩm", id);
        }
        return ProductResponse.from(p);
    }

    @Transactional(readOnly = true)
    public List<ProductResponse> search(String q) {
        String keyword = q == null ? "" : q.trim();
        return productRepository.searchActive(keyword).stream()
                .map(ProductResponse::from).toList();
    }

    // ---------- Helpers ----------
    private void validateCategory(Long danhMucId) {
        if (!categoryRepository.existsById(danhMucId)) {
            throw new BusinessException(ErrorCode.VALIDATION_FAILED, "Danh mục không tồn tại");
        }
    }

    private void applyFields(Product p, ProductRequest req) {
        p.setTenSanPham(req.tenSanPham());
        p.setGia(req.gia());
        p.setLoaiDa(req.loaiDa());
        p.setDanhMucId(req.danhMucId());
        p.setMoTa(req.moTa());
        p.setThuongHieu(req.thuongHieu());
        p.setHinhAnh(req.hinhAnh());
    }
}
