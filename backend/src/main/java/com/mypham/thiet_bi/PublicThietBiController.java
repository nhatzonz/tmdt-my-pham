package com.mypham.thiet_bi;

import com.mypham.common.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/thiet-bi")
@RequiredArgsConstructor
public class PublicThietBiController {

    private final ThietBiService thietBiService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<ThietBiResponse>>> list() {
        return ResponseEntity.ok(ApiResponse.success(thietBiService.list()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ThietBiResponse>> detail(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(thietBiService.getById(id)));
    }
}
