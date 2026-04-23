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
        if (userRepository.existsByEmail(req.email())) {
            throw new BusinessException(ErrorCode.EMAIL_ALREADY_EXISTS);
        }
        User user = new User();
        user.setHoTen(req.hoTen());
        user.setEmail(req.email());
        user.setMatKhau(passwordEncoder.encode(req.matKhau()));
        user.setSoDienThoai(req.soDienThoai());
        user.setVaiTro(User.Role.CUSTOMER);

        User saved = userRepository.save(user);
        return issueToken(saved);
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest req) {
        User user = userRepository.findByEmail(req.email())
                .orElseThrow(() -> new BadCredentialsException("Invalid credentials"));
        if (!passwordEncoder.matches(req.matKhau(), user.getMatKhau())) {
            throw new BadCredentialsException("Invalid credentials");
        }
        return issueToken(user);
    }

    @Transactional(readOnly = true)
    public AuthResponse.UserInfo getCurrentUser(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng"));
        return toUserInfo(user);
    }

    private AuthResponse issueToken(User user) {
        String token = jwtService.generateAccessToken(user.getEmail(), Map.of(
                "userId", user.getId(),
                "role", user.getVaiTro().name()
        ));
        return new AuthResponse(token, toUserInfo(user));
    }

    private AuthResponse.UserInfo toUserInfo(User u) {
        return new AuthResponse.UserInfo(u.getId(), u.getHoTen(), u.getEmail(), u.getVaiTro());
    }
}
