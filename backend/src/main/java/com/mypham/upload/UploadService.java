package com.mypham.upload;

import com.mypham.common.exception.BusinessException;
import com.mypham.common.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Set;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class UploadService {

    @Value("${app.uploads.dir:uploads}")
    private String uploadsDir;

    private static final Set<String> ALLOWED_TYPES = Set.of(
            "image/jpeg", "image/png", "image/webp"
    );

    public UploadResponse store(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BusinessException(ErrorCode.VALIDATION_FAILED, "File rỗng");
        }
        String claimedType = file.getContentType();
        if (claimedType == null || !ALLOWED_TYPES.contains(claimedType)) {
            throw new BusinessException(ErrorCode.VALIDATION_FAILED,
                    "Chỉ chấp nhận JPEG/PNG/WEBP");
        }

        try {
            byte[] bytes = file.getBytes();
            String detectedType = detectImageType(bytes);
            if (detectedType == null) {
                throw new BusinessException(ErrorCode.VALIDATION_FAILED,
                        "Nội dung file không phải ảnh JPEG/PNG/WEBP");
            }
            if (!detectedType.equals(claimedType)) {
                throw new BusinessException(ErrorCode.VALIDATION_FAILED,
                        "Định dạng file không khớp: header=" + claimedType + " nhưng nội dung=" + detectedType);
            }

            Path dir = Paths.get(uploadsDir).toAbsolutePath();
            Files.createDirectories(dir);

            String ext = switch (detectedType) {
                case "image/jpeg" -> ".jpg";
                case "image/png" -> ".png";
                case "image/webp" -> ".webp";
                default -> "";
            };
            String filename = UUID.randomUUID() + ext;
            Path target = dir.resolve(filename);
            Files.write(target, bytes);

            String url = "/uploads/" + filename;
            log.info("Uploaded {} -> {} ({})", file.getOriginalFilename(), url, detectedType);
            return new UploadResponse(url, filename, file.getSize());
        } catch (IOException e) {
            throw new BusinessException(ErrorCode.INTERNAL_ERROR,
                    "Lỗi lưu file: " + e.getMessage());
        }
    }

    /** Detect image MIME type bằng magic bytes — chống giả mạo Content-Type header. */
    private static String detectImageType(byte[] data) {
        if (data == null || data.length < 12) return null;
        // JPEG: FF D8 FF
        if ((data[0] & 0xFF) == 0xFF && (data[1] & 0xFF) == 0xD8 && (data[2] & 0xFF) == 0xFF) {
            return "image/jpeg";
        }
        // PNG: 89 50 4E 47 0D 0A 1A 0A
        if ((data[0] & 0xFF) == 0x89 && data[1] == 'P' && data[2] == 'N' && data[3] == 'G'
                && data[4] == 0x0D && data[5] == 0x0A && data[6] == 0x1A && data[7] == 0x0A) {
            return "image/png";
        }
        // WEBP: "RIFF" .... "WEBP"
        if (data[0] == 'R' && data[1] == 'I' && data[2] == 'F' && data[3] == 'F'
                && data[8] == 'W' && data[9] == 'E' && data[10] == 'B' && data[11] == 'P') {
            return "image/webp";
        }
        return null;
    }

    /** Xoá file vật lý nếu URL trỏ tới /uploads/ — bỏ qua nếu là URL ngoài. */
    public void deleteByUrl(String url) {
        if (url == null || !url.startsWith("/uploads/")) return;
        String filename = url.substring("/uploads/".length());
        if (filename.isBlank() || filename.contains("/") || filename.contains("..")) {
            log.warn("Skip suspicious filename: {}", filename);
            return;
        }
        try {
            Path target = Paths.get(uploadsDir).toAbsolutePath().resolve(filename);
            boolean deleted = Files.deleteIfExists(target);
            log.info("Delete file {}: {}", target, deleted ? "ok" : "not found");
        } catch (IOException e) {
            log.warn("Lỗi xoá file {}: {}", url, e.getMessage());
        }
    }
}
