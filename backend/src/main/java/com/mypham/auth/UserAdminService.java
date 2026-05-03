package com.mypham.auth;

import com.mypham.common.exception.BusinessException;
import com.mypham.common.exception.ErrorCode;
import com.mypham.common.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserAdminService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional(readOnly = true)
    public List<UserAdminResponse> list() {
        List<User> users = userRepository.findByTrangThaiOrderByIdDesc(User.TrangThai.ACTIVE);
        return users.stream().map(u -> UserAdminResponse.from(u, 0L)).toList();
    }

    @Transactional(readOnly = true)
    public UserAdminResponse getById(Long id) {
        User u = loadActive(id);
        return UserAdminResponse.from(u, 0L);
    }

    @Transactional
    public UserAdminResponse create(UserAdminRequest req) {
        if (req.matKhau() == null || req.matKhau().isBlank()) {
            throw new BusinessException(ErrorCode.VALIDATION_FAILED, "Mật khẩu bắt buộc khi tạo user mới");
        }
        String email = req.email().trim().toLowerCase();
        String sdt = blankToNull(req.soDienThoai());

        Optional<User> existing = userRepository.findByEmail(email);
        if (existing.isPresent() && existing.get().getTrangThai() == User.TrangThai.ACTIVE) {
            throw new BusinessException(ErrorCode.EMAIL_ALREADY_EXISTS, "Email đã tồn tại");
        }
        if (existing.isPresent() && existing.get().getTrangThai() == User.TrangThai.HIDDEN) {
            User old = existing.get();
            old.setEmail("__deleted_" + old.getId() + "_" + old.getEmail());
            userRepository.saveAndFlush(old);
        }

        if (sdt != null) {
            userRepository.findBySoDienThoaiAndTrangThai(sdt, User.TrangThai.ACTIVE)
                    .ifPresent(u -> {
                        throw new BusinessException(
                                ErrorCode.VALIDATION_FAILED,
                                "Số điện thoại đã được sử dụng");
                    });
        }

        User u = new User();
        u.setHoTen(req.hoTen().trim());
        u.setEmail(email);
        u.setSoDienThoai(sdt);
        u.setVaiTro(req.vaiTro());
        u.setMatKhau(passwordEncoder.encode(req.matKhau()));
        u.setTrangThai(User.TrangThai.ACTIVE);
        return UserAdminResponse.from(userRepository.save(u), 0L);
    }

    @Transactional
    public UserAdminResponse update(Long id, UserAdminRequest req, String currentAdminEmail) {
        User u = loadActive(id);
        boolean isSelf = u.getEmail().equalsIgnoreCase(currentAdminEmail);

        if (isSelf && u.getVaiTro() == User.Role.ADMIN && req.vaiTro() != User.Role.ADMIN) {
            throw new BusinessException(
                    ErrorCode.VALIDATION_FAILED,
                    "Không thể tự hạ vai trò ADMIN của chính bạn");
        }

        if (u.getVaiTro() == User.Role.ADMIN && req.vaiTro() != User.Role.ADMIN) {
            long activeAdmins = userRepository.countByVaiTroAndTrangThai(
                    User.Role.ADMIN, User.TrangThai.ACTIVE);
            if (activeAdmins <= 1) {
                throw new BusinessException(
                        ErrorCode.VALIDATION_FAILED,
                        "Phải còn ít nhất 1 admin trong hệ thống");
            }
        }

        String newEmail = req.email().trim().toLowerCase();
        if (!u.getEmail().equalsIgnoreCase(newEmail)) {
            Optional<User> dup = userRepository.findByEmail(newEmail);
            if (dup.isPresent() && dup.get().getTrangThai() == User.TrangThai.ACTIVE
                    && !dup.get().getId().equals(u.getId())) {
                throw new BusinessException(ErrorCode.EMAIL_ALREADY_EXISTS, "Email đã tồn tại");
            }
            if (dup.isPresent() && dup.get().getTrangThai() == User.TrangThai.HIDDEN) {
                User old = dup.get();
                old.setEmail("__deleted_" + old.getId() + "_" + old.getEmail());
                userRepository.saveAndFlush(old);
            }
        }

        String newSdt = blankToNull(req.soDienThoai());
        boolean sdtChanged = newSdt != null
                && !newSdt.equalsIgnoreCase(u.getSoDienThoai() == null ? "" : u.getSoDienThoai());
        if (sdtChanged) {
            userRepository.findBySoDienThoaiAndTrangThai(newSdt, User.TrangThai.ACTIVE)
                    .filter(other -> !other.getId().equals(u.getId()))
                    .ifPresent(other -> {
                        throw new BusinessException(
                                ErrorCode.VALIDATION_FAILED,
                                "Số điện thoại đã được sử dụng");
                    });
        }

        u.setHoTen(req.hoTen().trim());
        u.setEmail(newEmail);
        u.setSoDienThoai(newSdt);
        u.setVaiTro(req.vaiTro());
        return UserAdminResponse.from(userRepository.save(u), 0L);
    }

    @Transactional
    public void resetPassword(Long id, PasswordResetRequest req) {
        User u = loadActive(id);
        u.setMatKhau(passwordEncoder.encode(req.matKhauMoi()));
        userRepository.save(u);
    }

    @Transactional
    public void delete(Long id, String currentAdminEmail) {
        User u = loadActive(id);
        if (u.getEmail().equalsIgnoreCase(currentAdminEmail)) {
            throw new BusinessException(
                    ErrorCode.VALIDATION_FAILED,
                    "Không thể xoá tài khoản đang đăng nhập");
        }
        if (u.getVaiTro() == User.Role.ADMIN) {
            long activeAdmins = userRepository.countByVaiTroAndTrangThai(
                    User.Role.ADMIN, User.TrangThai.ACTIVE);
            if (activeAdmins <= 1) {
                throw new BusinessException(
                        ErrorCode.VALIDATION_FAILED,
                        "Phải còn ít nhất 1 admin trong hệ thống");
            }
        }
        userRepository.delete(u);
    }

    private User loadActive(Long id) {
        User u = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("người dùng", id));
        if (u.getTrangThai() == User.TrangThai.HIDDEN) {
            throw new ResourceNotFoundException("người dùng", id);
        }
        return u;
    }

    private static String blankToNull(String s) {
        return s == null || s.isBlank() ? null : s.trim();
    }
}
