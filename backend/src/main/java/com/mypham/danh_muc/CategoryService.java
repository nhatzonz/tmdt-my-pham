package com.mypham.danh_muc;

import com.mypham.common.exception.BusinessException;
import com.mypham.common.exception.ErrorCode;
import com.mypham.common.exception.ResourceNotFoundException;
import com.mypham.san_pham.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;

    @Transactional
    public CategoryResponse create(CategoryRequest req) {
        if (categoryRepository.existsByTenDanhMuc(req.tenDanhMuc())) {
            throw new BusinessException(ErrorCode.VALIDATION_FAILED, "Danh mục đã tồn tại");
        }
        Category c = new Category();
        applyFields(c, req);
        return toResponse(categoryRepository.save(c));
    }

    @Transactional
    public CategoryResponse update(Long id, CategoryRequest req) {
        Category c = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("danh mục", id));
        applyFields(c, req);
        return toResponse(categoryRepository.save(c));
    }

    @Transactional
    public void delete(Long id) {
        if (!categoryRepository.existsById(id)) {
            throw new ResourceNotFoundException("danh mục", id);
        }
        categoryRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public List<CategoryResponse> list() {
        return categoryRepository.findAllByOrderByThuTuAscIdAsc().stream()
                .map(this::toResponse)
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
