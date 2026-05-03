package com.mypham.ma_loi;

import com.mypham.common.dto.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/ma-loi")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class MaLoiController {

    private final MaLoiService maLoiService;

    @PostMapping
    public ResponseEntity<ApiResponse<MaLoiResponse>> create(@Valid @RequestBody MaLoiRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created(maLoiService.create(req)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<MaLoiResponse>> update(
            @PathVariable Long id,
            @Valid @RequestBody MaLoiRequest req
    ) {
        return ResponseEntity.ok(ApiResponse.success(maLoiService.update(id, req)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        maLoiService.delete(id);
        return ResponseEntity.ok(ApiResponse.success("Đã xoá", null));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<MaLoiResponse>>> list() {
        return ResponseEntity.ok(ApiResponse.success(maLoiService.list()));
    }
}
