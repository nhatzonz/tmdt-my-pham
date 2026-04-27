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
import java.nio.file.StandardCopyOption;
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
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_TYPES.contains(contentType)) {
            throw new BusinessException(ErrorCode.VALIDATION_FAILED,
                    "Chỉ chấp nhận JPEG/PNG/WEBP");
        }

        try {
            Path dir = Paths.get(uploadsDir).toAbsolutePath();
            Files.createDirectories(dir);

            String ext = switch (contentType) {
                case "image/jpeg" -> ".jpg";
                case "image/png" -> ".png";
                case "image/webp" -> ".webp";
                default -> "";
            };
            String filename = UUID.randomUUID() + ext;
            Path target = dir.resolve(filename);

            try (var in = file.getInputStream()) {
                Files.copy(in, target, StandardCopyOption.REPLACE_EXISTING);
            }

            String url = "/uploads/" + filename;
            log.info("Uploaded {} -> {}", file.getOriginalFilename(), url);
            return new UploadResponse(url, filename, file.getSize());
        } catch (IOException e) {
            throw new BusinessException(ErrorCode.INTERNAL_ERROR,
                    "Lỗi lưu file: " + e.getMessage());
        }
    }
}
