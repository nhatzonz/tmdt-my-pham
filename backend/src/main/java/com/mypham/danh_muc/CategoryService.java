package com.mypham.danh_muc;

import com.mypham.common.exception.BusinessException;
import com.mypham.common.exception.ErrorCode;
import com.mypham.common.exception.ResourceNotFoundException;
import com.mypham.san_pham.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;

    @Transactional
    public CategoryResponse create(CategoryRequest req) {
        // Chỉ check trùng tên trong danh mục ACTIVE — đã xoá thì có thể tạo lại với tên cũ.
        if (categoryRepository.existsByTenDanhMucAndTrangThai(
                req.tenDanhMuc(), Category.TrangThai.ACTIVE)) {
            throw new BusinessException(ErrorCode.VALIDATION_FAILED, "Danh mục đã tồn tại");
        }
        Category c = new Category();
        applyFields(c, req);
        c.setTrangThai(Category.TrangThai.ACTIVE);
        return toResponse(categoryRepository.save(c));
    }

    @Transactional
    public CategoryResponse update(Long id, CategoryRequest req) {
        Category c = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("danh mục", id));
        // Đổi tên → check trùng trong ACTIVE (loại trừ chính nó).
        if (!c.getTenDanhMuc().equalsIgnoreCase(req.tenDanhMuc())
                && categoryRepository.existsByTenDanhMucAndTrangThai(
                        req.tenDanhMuc(), Category.TrangThai.ACTIVE)) {
            throw new BusinessException(ErrorCode.VALIDATION_FAILED, "Danh mục đã tồn tại");
        }
        applyFields(c, req);
        return toResponse(categoryRepository.save(c));
    }

    /**
     * Xoá danh mục:
     *  - Nếu còn sản phẩm tham chiếu (kể cả HIDDEN) → soft-delete (set HIDDEN)
     *  - Nếu không có sản phẩm nào → hard delete
     */
    @Transactional
    public void delete(Long id) {
        Category c = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("danh mục", id));
        if (productRepository.countByDanhMucId(id) > 0) {
            c.setTrangThai(Category.TrangThai.HIDDEN);
            categoryRepository.save(c);
            return;
        }
        categoryRepository.delete(c);
    }

    @Transactional(readOnly = true)
    public List<CategoryResponse> list() {
        List<Category> categories = categoryRepository
                .findByTrangThaiOrderByThuTuAscIdAsc(Category.TrangThai.ACTIVE);
        Map<Long, Long> countMap = new HashMap<>();
        for (Object[] row : productRepository.countActiveGroupByDanhMucId()) {
            countMap.put((Long) row[0], (Long) row[1]);
        }
        return categories.stream()
                .map(c -> CategoryResponse.from(c, countMap.getOrDefault(c.getId(), 0L)))
                .toList();
    }

    private void applyFields(Category c, CategoryRequest req) {
        c.setTenDanhMuc(req.tenDanhMuc());
        c.setHinhAnh(req.hinhAnh());
        c.setThuTu(req.thuTu() == null ? 0 : req.thuTu());
    }

    private CategoryResponse toResponse(Category c) {
        return CategoryResponse.from(c, productRepository.countActiveByDanhMucId(c.getId()));
    }
}
