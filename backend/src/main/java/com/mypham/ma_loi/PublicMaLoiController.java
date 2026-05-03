package com.mypham.ma_loi;

import com.mypham.common.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ma-loi")
@RequiredArgsConstructor
public class PublicMaLoiController {

    private final MaLoiService maLoiService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<MaLoiResponse>>> list(
            @RequestParam(required = false) List<Long> thietBiId,
            @RequestParam(required = false) List<MaLoi.MucDo> mucDo,
            @RequestParam(required = false) String sort
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(maLoiService.listPublic(thietBiId, mucDo, sort))
        );
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<MaLoiResponse>>> search(
            @RequestParam(required = false, defaultValue = "") String q
    ) {
        return ResponseEntity.ok(ApiResponse.success(maLoiService.search(q)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<MaLoiResponse>> detail(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(maLoiService.getById(id, true)));
    }
}
