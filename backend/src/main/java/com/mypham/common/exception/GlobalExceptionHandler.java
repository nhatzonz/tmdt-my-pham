package com.mypham.common.exception;

import com.mypham.common.dto.ApiResponse;
import jakarta.validation.ConstraintViolationException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Bắt mọi exception trong controller layer → trả về ApiResponse chuẩn.
 */
@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    // ---- Nghiệp vụ tự định nghĩa ----

    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ApiResponse<Object>> handleBusiness(BusinessException ex) {
        ErrorCode code = ex.getErrorCode();
        log.warn("[Business] {} — {}", code.getCode(), ex.getMessage());
        return ResponseEntity
                .status(code.getHttpStatus())
                .body(new ApiResponse<>(
                        code.getHttpStatus().value(),
                        ex.getMessage(),
                        Map.of("errorCode", code.getCode()),
                        Instant.now()));
    }

    // ---- Validation ----

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Object>> handleValidation(MethodArgumentNotValidException ex) {
        Map<String, String> fieldErrors = ex.getBindingResult().getFieldErrors().stream()
                .collect(Collectors.toMap(
                        FieldError::getField,
                        err -> err.getDefaultMessage() == null ? "invalid" : err.getDefaultMessage(),
                        (a, b) -> a,
                        LinkedHashMap::new));
        log.warn("[Validation] {}", fieldErrors);
        // 1 field lỗi → đưa message cụ thể lên top-level cho FE hiển thị trực tiếp;
        // nhiều field → giữ message tổng quát + chi tiết trong data.fields.
        String topMessage = fieldErrors.size() == 1
                ? fieldErrors.values().iterator().next()
                : ErrorCode.VALIDATION_FAILED.getDefaultMessage();
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(new ApiResponse<>(
                        400,
                        topMessage,
                        Map.of("errorCode", ErrorCode.VALIDATION_FAILED.getCode(),
                               "fields", fieldErrors),
                        Instant.now()));
    }

    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ApiResponse<Object>> handleTypeMismatch(MethodArgumentTypeMismatchException ex) {
        String type = ex.getRequiredType() == null ? "?" : ex.getRequiredType().getSimpleName();
        String msg = String.format("Tham số '%s' giá trị '%s' không hợp lệ (kỳ vọng %s)",
                ex.getName(), ex.getValue(), type);
        log.warn("[TypeMismatch] {}", msg);
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(new ApiResponse<>(
                        400,
                        msg,
                        Map.of("errorCode", ErrorCode.VALIDATION_FAILED.getCode(),
                               "param", ex.getName()),
                        Instant.now()));
    }

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ApiResponse<Object>> handleConstraint(ConstraintViolationException ex) {
        log.warn("[Constraint] {}", ex.getMessage());
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(new ApiResponse<>(
                        400,
                        ex.getMessage(),
                        Map.of("errorCode", ErrorCode.VALIDATION_FAILED.getCode()),
                        Instant.now()));
    }

    // ---- Security ----

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ApiResponse<Object>> handleBadCredentials(BadCredentialsException ex) {
        return ResponseEntity
                .status(HttpStatus.UNAUTHORIZED)
                .body(new ApiResponse<>(
                        401,
                        ErrorCode.INVALID_CREDENTIALS.getDefaultMessage(),
                        Map.of("errorCode", ErrorCode.INVALID_CREDENTIALS.getCode()),
                        Instant.now()));
    }

    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<ApiResponse<Object>> handleAuth(AuthenticationException ex) {
        return ResponseEntity
                .status(HttpStatus.UNAUTHORIZED)
                .body(new ApiResponse<>(
                        401,
                        ErrorCode.UNAUTHORIZED.getDefaultMessage(),
                        Map.of("errorCode", ErrorCode.UNAUTHORIZED.getCode()),
                        Instant.now()));
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiResponse<Object>> handleAccessDenied(AccessDeniedException ex) {
        return ResponseEntity
                .status(HttpStatus.FORBIDDEN)
                .body(new ApiResponse<>(
                        403,
                        ErrorCode.FORBIDDEN.getDefaultMessage(),
                        Map.of("errorCode", ErrorCode.FORBIDDEN.getCode()),
                        Instant.now()));
    }

    // ---- Fallback ----

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Object>> handleUnexpected(Exception ex) {
        log.error("[Unexpected] {}", ex.getMessage(), ex);
        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ApiResponse<>(
                        500,
                        ErrorCode.INTERNAL_ERROR.getDefaultMessage(),
                        Map.of("errorCode", ErrorCode.INTERNAL_ERROR.getCode()),
                        Instant.now()));
    }
}
