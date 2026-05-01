package com.mypham.auth;

import com.mypham.common.dto.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

/**
 * Sequence 2.5.1 (PDF):
 * - POST /api/auth/register
 * - POST /api/auth/login
 * - GET  /api/auth/me
 */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest req) {
        AuthResponse result = authService.register(req);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.created(result));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest req) {
        AuthResponse result = authService.login(req);
        return ResponseEntity.ok(ApiResponse.success("Đăng nhập thành công", result));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<AuthResponse.UserInfo>> me(Authentication authentication) {
        AuthResponse.UserInfo info = authService.getCurrentUser(authentication.getName());
        return ResponseEntity.ok(ApiResponse.success(info));
    }

    @PutMapping("/me")
    public ResponseEntity<ApiResponse<AuthResponse.UserInfo>> updateMe(
            Authentication auth,
            @Valid @RequestBody UpdateMeRequest req
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                "Đã cập nhật thông tin",
                authService.updateMe(auth.getName(), req)));
    }

    @PutMapping("/me/password")
    public ResponseEntity<ApiResponse<Void>> changePassword(
            Authentication auth,
            @Valid @RequestBody ChangePasswordRequest req
    ) {
        authService.changePassword(auth.getName(), req);
        return ResponseEntity.ok(ApiResponse.success("Đã đổi mật khẩu", null));
    }
}
