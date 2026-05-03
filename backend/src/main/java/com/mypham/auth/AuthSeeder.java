package com.mypham.auth;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Component
@Profile("dev")
@RequiredArgsConstructor
public class AuthSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        seedIfAbsent("admin@tracuu.local", "Admin Tra Cứu Mã Lỗi", "admin12345", User.Role.ADMIN);
    }

    private void seedIfAbsent(String email, String hoTen, String matKhau, User.Role role) {
        if (userRepository.existsByEmail(email)) return;
        User u = new User();
        u.setEmail(email);
        u.setHoTen(hoTen);
        u.setMatKhau(passwordEncoder.encode(matKhau));
        u.setVaiTro(role);
        userRepository.save(u);
        log.info("Seeded {} user: {}", role, email);
    }
}
