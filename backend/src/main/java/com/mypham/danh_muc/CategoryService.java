package com.mypham.danh_muc;

import com.mypham.common.exception.BusinessException;
import com.mypham.common.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;

    @Transactional
    public CategoryResponse create(CategoryRequest req) {
        if (categoryRepository.existsByTenDanhMuc(req.tenDanhMuc())) {
            throw new BusinessException(ErrorCode.VALIDATION_FAILED, "Danh mục đã tồn tại");
        }
        Category c = new Category();
        c.setTenDanhMuc(req.tenDanhMuc());
        return CategoryResponse.from(categoryRepository.save(c));
    }

    @Transactional(readOnly = true)
    public List<CategoryResponse> list() {
        return categoryRepository.findAll().stream().map(CategoryResponse::from).toList();
    }
}
