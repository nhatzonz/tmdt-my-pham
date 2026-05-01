package com.mypham.upload;

import com.mypham.common.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequestMapping("/api/admin/uploads")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class UploadAdminController {

    private final OrphanUploadCleanupJob job;

    /** Admin trigger thủ công — trả luôn kết quả để FE/script in ra. */
    @PostMapping("/cleanup")
    public ResponseEntity<ApiResponse<OrphanUploadCleanupJob.CleanupResult>> cleanup(
            Authentication auth
    ) {
        log.info("[CleanupJob] Admin trigger thủ công bởi {}", auth.getName());
        OrphanUploadCleanupJob.CleanupResult res = job.run();
        return ResponseEntity.ok(ApiResponse.success(
                "Dọn rác hoàn tất",
                res));
    }
}
