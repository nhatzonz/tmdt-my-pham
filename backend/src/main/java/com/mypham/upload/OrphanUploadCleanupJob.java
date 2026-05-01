package com.mypham.upload;

import com.mypham.cau_hinh.StoreConfigRepository;
import com.mypham.danh_muc.CategoryRepository;
import com.mypham.san_pham.ProductImageRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.Stream;

/**
 * Dọn file orphan trong /uploads/ — file vật lý không còn URL tham chiếu trong DB.
 * Lý do tồn tại: upload là eager (file lên disk ngay khi click), nếu admin
 * tạo sản phẩm/danh mục/cấu hình bị fail validation hoặc đóng tab giữa chừng
 * → file vẫn ở disk, không bao giờ được liên kết.
 *
 * Cơ chế:
 *  - Cron `0 0 3 * * *` (3h sáng theo giờ Việt Nam) — chạy khi BE đang up.
 *  - Endpoint /api/admin/uploads/cleanup — admin trigger thủ công.
 *  - Guard: chỉ xoá file ≥ 24h tuổi (tránh xoá nhầm file admin vừa upload
 *    mà chưa kịp Submit form).
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class OrphanUploadCleanupJob {

    private static final long MIN_AGE_MS = 24L * 60 * 60 * 1000;

    @Value("${app.uploads.dir:uploads}")
    private String uploadsDir;

    private final ProductImageRepository productImageRepository;
    private final CategoryRepository categoryRepository;
    private final StoreConfigRepository storeConfigRepository;

    /** Kết quả 1 lần dọn rác. */
    public record CleanupResult(
            int scanned,         // tổng file vật lý quét được
            int referenced,      // số URL đang được tham chiếu trong DB
            int orphan,          // file không có trong DB (= scanned - referenced trong /uploads/)
            int skippedYoung,    // orphan nhưng < 24h tuổi → skip
            int deleted,         // số file đã xoá
            List<String> deletedFiles
    ) {}

    /** Cron production: 3h sáng mỗi ngày theo giờ VN. */
    @Scheduled(cron = "0 0 3 * * *", zone = "Asia/Ho_Chi_Minh")
    public void scheduled() {
        log.info("[CleanupJob] Cron 3h sáng — bắt đầu dọn file orphan");
        CleanupResult res = run();
        log.info(
                "[CleanupJob] Hoàn tất: scanned={}, referenced(DB)={}, orphan={}, skippedYoung={}, deleted={}",
                res.scanned, res.referenced, res.orphan, res.skippedYoung, res.deleted);
    }

    /** Logic chính — gọi từ cron + endpoint admin. */
    public CleanupResult run() {
        long start = System.currentTimeMillis();

        // 1. Thu thập tất cả URL đang được tham chiếu trong DB
        Set<String> referencedUrls = new HashSet<>();
        productImageRepository.findAll().forEach(img -> {
            if (img.getUrl() != null) referencedUrls.add(img.getUrl());
        });
        categoryRepository.findAll().forEach(c -> {
            if (c.getHinhAnh() != null) referencedUrls.add(c.getHinhAnh());
        });
        storeConfigRepository.findAll().forEach(c -> {
            if (c.getLogoUrl() != null) referencedUrls.add(c.getLogoUrl());
        });

        // Quy về tên file (bỏ prefix /uploads/) để so với file trên disk
        Set<String> referencedFilenames = referencedUrls.stream()
                .filter(u -> u.startsWith("/uploads/"))
                .map(u -> u.substring("/uploads/".length()))
                .collect(Collectors.toSet());

        log.info("[CleanupJob] Tham chiếu trong DB: {} URL ({} file trong /uploads/)",
                referencedUrls.size(), referencedFilenames.size());

        // 2. Quét thư mục uploads
        Path dir = Paths.get(uploadsDir).toAbsolutePath();
        if (!Files.isDirectory(dir)) {
            log.warn("[CleanupJob] Thư mục không tồn tại: {}", dir);
            return new CleanupResult(0, referencedFilenames.size(), 0, 0, 0, List.of());
        }

        int scanned = 0;
        int orphan = 0;
        int skippedYoung = 0;
        int deleted = 0;
        List<String> deletedFiles = new ArrayList<>();
        long now = System.currentTimeMillis();

        try (Stream<Path> stream = Files.list(dir)) {
            for (Path p : stream.toList()) {
                if (!Files.isRegularFile(p)) continue;
                scanned++;
                String filename = p.getFileName().toString();
                if (referencedFilenames.contains(filename)) continue;

                orphan++;
                long age;
                try {
                    age = now - Files.getLastModifiedTime(p).toMillis();
                } catch (IOException ex) {
                    log.warn("[CleanupJob] Không đọc được mtime {}: {}", filename, ex.getMessage());
                    continue;
                }
                if (age < MIN_AGE_MS) {
                    skippedYoung++;
                    log.debug("[CleanupJob] Skip {} ({}h tuổi)", filename, age / 3600000);
                    continue;
                }
                try {
                    Files.deleteIfExists(p);
                    deleted++;
                    deletedFiles.add(filename);
                    log.info("[CleanupJob] Đã xoá orphan: {}", filename);
                } catch (Exception ex) {
                    log.warn("[CleanupJob] Lỗi xoá {}: {}", filename, ex.getMessage());
                }
            }
        } catch (IOException ex) {
            log.error("[CleanupJob] Lỗi quét thư mục " + dir, ex);
        }

        long ms = System.currentTimeMillis() - start;
        log.info(
                "[CleanupJob] {}ms | scanned={} | referenced(DB)={} | orphan={} | skipped<24h={} | deleted={}",
                ms, scanned, referencedFilenames.size(), orphan, skippedYoung, deleted);
        return new CleanupResult(scanned, referencedFilenames.size(), orphan, skippedYoung, deleted, deletedFiles);
    }
}
