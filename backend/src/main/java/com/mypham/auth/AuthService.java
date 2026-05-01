package com.mypham.auth;

import com.mypham.common.exception.BusinessException;
import com.mypham.common.exception.ErrorCode;
import com.mypham.common.exception.ResourceNotFoundException;
import com.mypham.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

/**
 * Sequence 2.5.1 (PDF): đăng ký / đăng nhập.
 * Class Diagram PDF 2.8: login(), register().
 */
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    @Transactional
    public AuthResponse register(RegisterRequest req) {
        String email = req.email().trim().toLowerCase();
        String hoTen = req.hoTen().trim();
        String sdt = req.soDienThoai() == null || req.soDienThoai().isBlank()
                ? null
                : req.soDienThoai().trim();

        // Check email: chỉ với user ACTIVE; user HIDDEN dùng email cũ → tự rename
        // để giải phóng UNIQUE constraint cho user mới.
        var existing = userRepository.findByEmail(email);
        if (existing.isPresent() && existing.get().getTrangThai() == User.TrangThai.ACTIVE) {
            throw new BusinessException(ErrorCode.EMAIL_ALREADY_EXISTS);
        }
        if (existing.isPresent() && existing.get().getTrangThai() == User.TrangThai.HIDDEN) {
            User old = existing.get();
            old.setEmail("__deleted_" + old.getId() + "_" + old.getEmail());
            userRepository.saveAndFlush(old);
        }
        // Check SDT: chỉ với user ACTIVE (HIDDEN giải phóng SDT).
        if (sdt != null) {
            userRepository.findBySoDienThoaiAndTrangThai(sdt, User.TrangThai.ACTIVE)
                    .ifPresent(u -> {
                        throw new BusinessException(
                                ErrorCode.VALIDATION_FAILED,
                                "Số điện thoại đã được sử dụng");
                    });
        }

        User user = new User();
        user.setHoTen(hoTen);
        user.setEmail(email);
        user.setMatKhau(passwordEncoder.encode(req.matKhau()));
        user.setSoDienThoai(sdt);
        user.setVaiTro(User.Role.CUSTOMER);
        user.setTrangThai(User.TrangThai.ACTIVE);

        User saved = userRepository.save(user);
        return issueToken(saved);
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest req) {
        User user = userRepository.findByEmail(req.email())
                .orElseThrow(() -> new BadCredentialsException("Invalid credentials"));
        // Check mật khẩu TRƯỚC — sai mật khẩu luôn trả thông điệp generic để
        // tránh email enumeration. Mật khẩu đúng + tài khoản HIDDEN → mới báo
        // rõ "đã bị vô hiệu hoá" cho user nhận diện.
        if (!passwordEncoder.matches(req.matKhau(), user.getMatKhau())) {
            throw new BadCredentialsException("Invalid credentials");
        }
        if (user.getTrangThai() == User.TrangThai.HIDDEN) {
            throw new BusinessException(ErrorCode.ACCOUNT_DISABLED);
        }
        return issueToken(user);
    }

    @Transactional(readOnly = true)
    public AuthResponse.UserInfo getCurrentUser(String email) {
        return toUserInfo(loadActiveUser(email));
    }

    /** Customer cập nhật hoTen + soDienThoai. Không cho đổi email/vai trò qua đây. */
    @Transactional
    public AuthResponse.UserInfo updateMe(String email, UpdateMeRequest req) {
        User user = loadActiveUser(email);
        String newSdt = req.soDienThoai() == null || req.soDienThoai().isBlank()
                ? null
                : req.soDienThoai().trim();

        if (newSdt != null) {
            userRepository.findBySoDienThoaiAndTrangThai(newSdt, User.TrangThai.ACTIVE)
                    .filter(other -> !other.getId().equals(user.getId()))
                    .ifPresent(other -> {
                        throw new BusinessException(
                                ErrorCode.VALIDATION_FAILED,
                                "Số điện thoại đã được sử dụng");
                    });
        }

        user.setHoTen(req.hoTen().trim());
        user.setSoDienThoai(newSdt);
        return toUserInfo(userRepository.save(user));
    }

    /** Customer đổi mật khẩu — phải nhập đúng mật khẩu hiện tại. */
    @Transactional
    public void changePassword(String email, ChangePasswordRequest req) {
        User user = loadActiveUser(email);
        if (!passwordEncoder.matches(req.matKhauCu(), user.getMatKhau())) {
            throw new BusinessException(
                    ErrorCode.VALIDATION_FAILED,
                    "Mật khẩu hiện tại không đúng");
        }
        if (passwordEncoder.matches(req.matKhauMoi(), user.getMatKhau())) {
            throw new BusinessException(
                    ErrorCode.VALIDATION_FAILED,
                    "Mật khẩu mới phải khác mật khẩu hiện tại");
        }
        user.setMatKhau(passwordEncoder.encode(req.matKhauMoi()));
        userRepository.save(user);
    }

    private User loadActiveUser(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng"));
        if (user.getTrangThai() == User.TrangThai.HIDDEN) {
            throw new ResourceNotFoundException("Không tìm thấy người dùng");
        }
        return user;
    }

    private AuthResponse issueToken(User user) {
        String token = jwtService.generateAccessToken(user.getEmail(), Map.of(
                "userId", user.getId(),
                "role", user.getVaiTro().name()
        ));
        return new AuthResponse(token, toUserInfo(user));
    }

    private AuthResponse.UserInfo toUserInfo(User u) {
        return new AuthResponse.UserInfo(
                u.getId(), u.getHoTen(), u.getEmail(), u.getSoDienThoai(), u.getVaiTro());
    }
}
