# Mỹ Phẩm — Backend

Backend cho hệ thống bán mỹ phẩm trực tuyến. Spring Boot 3.3 + Java 17 + PostgreSQL.

## Yêu cầu
- Java 17+
- Maven 3.9+
- PostgreSQL 16 đang chạy trên `localhost:5432` với DB `mypham` (xem `../database/my-pham.sql`)

## Cấu trúc
```
src/main/java/com/mypham/
├── MyPhamApplication.java         # entry point
├── common/                        # cross-cutting
│   ├── dto/                       # ApiResponse, PageResponse
│   ├── exception/                 # ErrorCode, BusinessException, handler
│   └── util/                      # SecurityUtils
├── config/                        # Jpa, Web (CORS), OpenAPI
├── security/                      # JwtService, filter, entry point, SecurityConfig
├── ping/                          # PingController (healthcheck)
# Các module feature sẽ thêm theo từng tuần:
# ├── auth/       — tuần 6
# ├── user/       — tuần 6
# ├── product/    — tuần 7
# ├── category/   — tuần 7
# ├── cart/       — tuần 8
# ├── order/      — tuần 8
# ├── inventory/  — tuần 9
# ├── coupon/     — tuần 10
# ├── report/     — tuần 11
# └── ai/         — tuần 12-13 (cuối)
```

## Chạy local

```bash
# 1. Đảm bảo DB mypham đã tạo (chạy database/my-pham.sql ở thư mục cha)
# 2. Khởi động
mvn spring-boot:run
```

Backend chạy ở `http://localhost:8080`.

## Endpoints hiện có
| Method | URL | Mô tả |
|---|---|---|
| GET | `/api/ping` | Healthcheck — public |
| GET | `/swagger-ui.html` | Swagger UI — public |
| GET | `/v3/api-docs` | OpenAPI spec JSON |

## Build

```bash
mvn clean package -DskipTests   # build không test
mvn clean verify                # build + test
```

Jar output: `target/mypham-backend.jar`.

## Các convention

- **API response**: tất cả endpoint trả về `ApiResponse<T>` (code, message, data, timestamp).
- **Exception**: service throw `BusinessException(ErrorCode)`. `GlobalExceptionHandler` xử lý thành response chuẩn.
- **Security**: JWT Bearer token. Các endpoint public xem `SecurityConfig.PUBLIC_ENDPOINTS`.
- **Validation**: dùng `@Valid` + Bean Validation ở controller.
- **Logging**: `@Slf4j` (Lombok). Log DEBUG cho package `com.mypham`.
