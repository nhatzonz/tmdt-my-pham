package com.mypham.thiet_bi;

import com.mypham.common.dto.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/thiet-bi")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class ThietBiController {

    private final ThietBiService thietBiService;

    @PostMapping
    public ResponseEntity<ApiResponse<ThietBiResponse>> create(@Valid @RequestBody ThietBiRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created(thietBiService.create(req)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ThietBiResponse>> update(
            @PathVariable Long id,
            @Valid @RequestBody ThietBiRequest req
    ) {
        return ResponseEntity.ok(ApiResponse.success(thietBiService.update(id, req)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        thietBiService.delete(id);
        return ResponseEntity.ok(ApiResponse.success("Đã xoá", null));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<ThietBiResponse>>> list() {
        return ResponseEntity.ok(ApiResponse.success(thietBiService.list()));
    }
}
