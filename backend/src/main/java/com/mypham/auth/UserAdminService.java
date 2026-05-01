package com.mypham.auth;

import com.mypham.common.exception.BusinessException;
import com.mypham.common.exception.ErrorCode;
import com.mypham.common.exception.ResourceNotFoundException;
import com.mypham.don_hang.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * Quản lý người dùng (admin only).
 *
 * Guard rails quan trọng (senior-dev):
 *  - Không cho admin tự xoá / tự hạ vai trò chính mình
 *  - Không cho hạ vai trò admin cuối cùng → đảm bảo hệ thống luôn có admin
 *  - User đã có đơn → soft-delete (giữ lịch sử); chưa có đơn → hard-delete
 *  - Email trùng với user đã soft-delete: rename email cũ thành __deleted_<id>_<email>
 */
@Service
@RequiredArgsConstructor
public class UserAdminService {

    private final UserRepository userRepository;
    private final OrderRepository orderRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional(readOnly = true)
    public List<UserAdminResponse> list() {
        List<User> users = userRepository.findByTrangThaiOrderByIdDesc(User.TrangThai.ACTIVE);
        // Batch count đơn — tránh N+1 nếu sau này nhiều user
        Map<Long, Long> orderCounts = new HashMap<>();
        for (User u : users) {
            orderCounts.put(u.getId(), 0L);
        }
        // Đơn giản: 1 user list ~chục → countByNguoiDungId per user OK; nếu list lớn refactor sang GROUP BY
        List<User> allUsers = users;
        for (User u : allUsers) {
            long count = orderRepository.findByNguoiDungIdOrderByIdDesc(u.getId()).size();
            orderCounts.put(u.getId(), count);
        }
        return users.stream()
                .map(u -> UserAdminResponse.from(u, orderCounts.getOrDefault(u.getId(), 0L)))
                .toList();
    }

    @Transactional(readOnly = true)
    public UserAdminResponse getById(Long id) {
        User u = loadActive(id);
        long count = orderRepository.findByNguoiDungIdOrderByIdDesc(u.getId()).size();
        return UserAdminResponse.from(u, count);
    }

    @Transactional
    public UserAdminResponse create(UserAdminRequest req) {
        if (req.matKhau() == null || req.matKhau().isBlank()) {
            throw new BusinessException(ErrorCode.VALIDATION_FAILED, "Mật khẩu bắt buộc khi tạo user mới");
        }
        String email = req.email().trim().toLowerCase();
        String sdt = blankToNull(req.soDienThoai());

        // Email: trùng với user ACTIVE → reject; trùng HIDDEN → rename để giải phóng UNIQUE
        Optional<User> existing = userRepository.findByEmail(email);
        if (existing.isPresent() && existing.get().getTrangThai() == User.TrangThai.ACTIVE) {
            throw new BusinessException(ErrorCode.EMAIL_ALREADY_EXISTS, "Email đã tồn tại");
        }
        if (existing.isPresent() && existing.get().getTrangThai() == User.TrangThai.HIDDEN) {
            User old = existing.get();
            old.setEmail("__deleted_" + old.getId() + "_" + old.getEmail());
            userRepository.saveAndFlush(old);
        }

        // SDT: chỉ check unique trong ACTIVE user (HIDDEN giải phóng SDT)
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

        // Self-protect: không cho admin tự hạ vai trò mình
        if (isSelf && u.getVaiTro() == User.Role.ADMIN && req.vaiTro() != User.Role.ADMIN) {
            throw new BusinessException(
                    ErrorCode.VALIDATION_FAILED,
                    "Không thể tự hạ vai trò ADMIN của chính bạn");
        }
        // Last-admin: không cho hạ admin cuối cùng
        if (u.getVaiTro() == User.Role.ADMIN && req.vaiTro() != User.Role.ADMIN) {
            long activeAdmins = userRepository.countByVaiTroAndTrangThai(
                    User.Role.ADMIN, User.TrangThai.ACTIVE);
            if (activeAdmins <= 1) {
                throw new BusinessException(
                        ErrorCode.VALIDATION_FAILED,
                        "Phải còn ít nhất 1 admin trong hệ thống");
            }
        }

        // Đổi email → check trùng (loại trừ chính nó, loại HIDDEN)
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

        // SDT: check trùng (loại trừ chính nó, loại HIDDEN)
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
        long count = orderRepository.findByNguoiDungIdOrderByIdDesc(u.getId()).size();
        return UserAdminResponse.from(userRepository.save(u), count);
    }

    /** Admin reset mật khẩu cho user — không cần biết mật khẩu cũ. */
    @Transactional
    public void resetPassword(Long id, PasswordResetRequest req) {
        User u = loadActive(id);
        u.setMatKhau(passwordEncoder.encode(req.matKhauMoi()));
        userRepository.save(u);
    }

    /**
     * Xoá user:
     *  - Không cho xoá chính mình
     *  - Không cho xoá admin cuối cùng
     *  - Đã có đơn → soft-delete (rename email để giải phóng UNIQUE)
     *  - Chưa có đơn → hard-delete
     */
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

        boolean hasOrder = !orderRepository.findByNguoiDungIdOrderByIdDesc(u.getId()).isEmpty();
        if (hasOrder) {
            // Soft-delete: chỉ set HIDDEN, GIỮ NGUYÊN email gốc.
            // Khi user đó cố login → check password vẫn đúng → trả ACCOUNT_DISABLED 403
            //   với message "Tài khoản đã bị vô hiệu hoá" (UX rõ ràng).
            // Email sẽ được rename thành __deleted_<id>_<email> CHỈ KHI admin tạo
            //   user mới trùng email — xử lý ở method create()/update().
            u.setTrangThai(User.TrangThai.HIDDEN);
            userRepository.save(u);
            return;
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
