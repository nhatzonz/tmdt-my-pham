package com.mypham.common.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

/**
 * Mã lỗi chuẩn hóa toàn hệ thống.
 * Format: prefix 2 chữ + 3 số. Ví dụ VA001, AU001, RS001.
 */
@Getter
public enum ErrorCode {

    // Chung
    INTERNAL_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "SY500", "Lỗi hệ thống"),
    VALIDATION_FAILED(HttpStatus.BAD_REQUEST, "VA001", "Dữ liệu không hợp lệ"),
    BAD_REQUEST(HttpStatus.BAD_REQUEST, "VA002", "Yêu cầu không hợp lệ"),

    // Auth
    UNAUTHORIZED(HttpStatus.UNAUTHORIZED, "AU001", "Chưa đăng nhập hoặc token hết hạn"),
    FORBIDDEN(HttpStatus.FORBIDDEN, "AU002", "Không có quyền truy cập"),
    INVALID_CREDENTIALS(HttpStatus.UNAUTHORIZED, "AU003", "Email hoặc mật khẩu không đúng"),
    EMAIL_ALREADY_EXISTS(HttpStatus.CONFLICT, "AU004", "Email đã tồn tại"),
    ACCOUNT_DISABLED(HttpStatus.FORBIDDEN, "AU005", "Tài khoản đã bị vô hiệu hoá"),

    // Resource
    RESOURCE_NOT_FOUND(HttpStatus.NOT_FOUND, "RS001", "Không tìm thấy tài nguyên"),

    // Business — sẽ bổ sung theo từng module
    OUT_OF_STOCK(HttpStatus.CONFLICT, "BS001", "Sản phẩm hết hàng"),
    COUPON_INVALID(HttpStatus.BAD_REQUEST, "BS002", "Mã giảm giá không hợp lệ"),
    ORDER_STATUS_INVALID(HttpStatus.BAD_REQUEST, "BS003", "Không thể chuyển trạng thái đơn hàng");

    private final HttpStatus httpStatus;
    private final String code;
    private final String defaultMessage;

    ErrorCode(HttpStatus httpStatus, String code, String defaultMessage) {
        this.httpStatus = httpStatus;
        this.code = code;
        this.defaultMessage = defaultMessage;
    }
}
