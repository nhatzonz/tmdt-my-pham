package com.mypham.auth;

import com.mypham.common.dto.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/users")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class UserAdminController {

    private final UserAdminService service;

    @GetMapping
    public ResponseEntity<ApiResponse<List<UserAdminResponse>>> list() {
        return ResponseEntity.ok(ApiResponse.success(service.list()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<UserAdminResponse>> detail(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(service.getById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<UserAdminResponse>> create(
            @Valid @RequestBody UserAdminRequest req
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created(service.create(req)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<UserAdminResponse>> update(
            Authentication auth,
            @PathVariable Long id,
            @Valid @RequestBody UserAdminRequest req
    ) {
        return ResponseEntity.ok(ApiResponse.success(service.update(id, req, auth.getName())));
    }

    @PutMapping("/{id}/password")
    public ResponseEntity<ApiResponse<Void>> resetPassword(
            @PathVariable Long id,
            @Valid @RequestBody PasswordResetRequest req
    ) {
        service.resetPassword(id, req);
        return ResponseEntity.ok(ApiResponse.success("Đã đặt lại mật khẩu", null));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(
            Authentication auth,
            @PathVariable Long id
    ) {
        service.delete(id, auth.getName());
        return ResponseEntity.ok(ApiResponse.success("Đã xoá", null));
    }
}
