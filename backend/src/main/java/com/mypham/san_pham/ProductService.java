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
        if (!categoryRepository.existsById(req.danhMucId())) {
            throw new BusinessException(ErrorCode.VALIDATION_FAILED, "Danh mục không tồn tại");
        }
        Product p = new Product();
        p.setTenSanPham(req.tenSanPham());
        p.setGia(req.gia());
        p.setLoaiDa(req.loaiDa());
        p.setDanhMucId(req.danhMucId());
        p.setMoTa(req.moTa());
        p.setThuongHieu(req.thuongHieu());
        p.setTrangThai(Product.TrangThai.ACTIVE);
        return ProductResponse.from(productRepository.save(p));
    }

    @Transactional(readOnly = true)
    public List<ProductResponse> list() {
        return productRepository.findAll().stream().map(ProductResponse::from).toList();
    }

    // ---------- Public ----------
    @Transactional(readOnly = true)
    public List<ProductResponse> listPublic(Long danhMucId, Product.LoaiDa loaiDa) {
        return productRepository.findActiveWithFilters(danhMucId, loaiDa).stream()
                .map(ProductResponse::from).toList();
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
}
