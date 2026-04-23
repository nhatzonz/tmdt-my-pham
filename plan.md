# PLAN — Hệ thống bán mỹ phẩm trực tuyến tích hợp gợi ý cá nhân hóa (RAG)

## Context

Đồ án tốt nghiệp của Nguyễn Xuân Hoàng (64HTTT3, ĐH Thủy Lợi). Hiện workspace chỉ có `readme.md` (đề cương) và `321_NguyenXuanHoang_Dacta.pdf` (báo cáo tuần 3-4 với đầy đủ ERD, Use Case, Sequence, Class Diagram, BPMN). Chưa có code.

Plan này **bám sát 100% PDF tuần 3-4** — chỉ dùng đúng công nghệ, entity, API naming trong tài liệu thầy đã duyệt. Mọi thứ không có trong PDF đã được loại bỏ.

**Quyết định kỹ thuật đã chốt:**
- **Stack theo PDF mục 2.3.4**: NextJS + Tailwind CSS (FE), Java SpringBoot (BE main), Python FastAPI (AI micro-service), JWT (auth), PostgreSQL 3NF (DB), REST API (giao tiếp).
- **LLM cho RAG**: call API bên ngoài (Gemini free / Claude / OpenAI) — abstraction để swap. Không train model.
- **Vector storage**: extension `pgvector` trong PostgreSQL — không thêm DB riêng (bắt buộc cho RAG, là cách tối giản nhất).
- **Payment**: Mock COD.
- **Môi trường**: chỉ chạy LOCAL, không Docker, không deploy.
- **Thứ tự phát triển**: dựng base BE + FE trước, sau đó code **song song BE và FE theo từng module** (không làm BE xong mới sang FE). Module AI làm CUỐI CÙNG.

---

## Kiến trúc tổng thể

Theo đúng PDF 2.3.4: **MVC cho cốt lõi nghiệp vụ, kết hợp Micro-services nhẹ dành riêng cho module AI.**

```
┌────────────────┐   REST    ┌──────────────────┐   JDBC    ┌──────────────────────┐
│ Next.js        │──────────▶│ Spring Boot      │──────────▶│ PostgreSQL (3NF)     │
│ + Tailwind     │           │ (Backend main)   │           │ + pgvector (cho AI)  │
└────────────────┘           └────────┬─────────┘           └──────────┬───────────┘
                                      │ REST (làm sau cùng)            │
                                      ▼                                │
                             ┌──────────────────┐                      │
                             │ FastAPI AI Svc   │──── call LLM API ──▶ │ Gemini/Claude
                             │ (micro-service)  │                      │
                             └──────────────────┘                      │
                                      │                                │
                                      └─── pgvector similarity ────────┘
```

**Layout dự án:**
```
tmdt-my-pham/
├── frontend/    # NextJS + Tailwind CSS
├── backend/     # Java SpringBoot
├── ai-service/  # Python FastAPI (làm CUỐI)
├── database/    # SQL migrations
└── docs/        # ERD, Use Case, BPMN, Class Diagram, OpenAPI
```

**Cài đặt local (macOS):**
- Java 21: `brew install --cask temurin@21`
- Node.js 20 + npm
- Python 3.11: `brew install python@3.11`
- PostgreSQL 16 + pgvector: `brew install postgresql@16 pgvector`
- Khởi động DB: `brew services start postgresql@16`

---

## 1. Database schema (PostgreSQL 3NF) — khớp ERD PDF 2.6

### 1.1. 8 bảng chính theo ERD PDF

| Bảng PDF | Tên SQL | Cột chính | Ghi chú |
|---|---|---|---|
| `NGUOI_DUNG` | `nguoi_dung` | id, ho_ten, email UNIQUE, mat_khau (bcrypt), vai_tro (CUSTOMER/ADMIN) | |
| `SAN_PHAM` | `san_pham` | id, ten_san_pham, gia, loai_da, danh_muc_id, mo_ta, hinh_anh, trang_thai | **loai_da = input AI** (UC 2.3.3) |
| `DANH_MUC` | `danh_muc` | id, ten_danh_muc | |
| `DON_HANG` | `don_hang` | id, nguoi_dung_id, tong_tien, trang_thai (PENDING/SHIPPING/COMPLETED), dia_chi_giao, created_at | khớp PDF 3 trạng thái |
| `CHI_TIET_DON_HANG` | `chi_tiet_don_hang` | id, don_hang_id, san_pham_id, so_luong, gia_ban | snapshot giá |
| `TON_KHO` | `ton_kho` | id, san_pham_id UNIQUE, so_luong_ton | 1-1 với sản phẩm |
| `KHUYEN_MAI` | `khuyen_mai` | id, ma_code UNIQUE, phan_tram_giam, start_at, end_at | |
| `GOI_Y_AI` | `goi_y_ai` | id, nguoi_dung_id, san_pham_id, diem_tuong_thich (score) | |

**Quan hệ (PDF 2.6):**
- NGUOI_DUNG — DON_HANG: 1:N
- SAN_PHAM — DANH_MUC: N:1
- DON_HANG — CHI_TIET_DON_HANG: 1:N (composition)
- SAN_PHAM — TON_KHO: 1:1
- DON_HANG — KHUYEN_MAI: N:0..1
- GOI_Y_AI — NGUOI_DUNG & SAN_PHAM

### 1.2. Bảng bổ sung cho RAG (V2 — làm CUỐI ở phase AI)

Bổ sung tối thiểu để RAG hoạt động:

| Bảng | Cột | Ghi chú |
|---|---|---|
| `product_embeddings` | san_pham_id PK, embedding vector(768), updated_at | pgvector HNSW index |
| `chat_sessions` | id, nguoi_dung_id, created_at | |
| `chat_messages` | id, session_id, role (USER/ASSISTANT), noi_dung, san_pham_ids BIGINT[], created_at | |

Giỏ hàng: lưu tại **localStorage của FE** (không cần bảng DB) — checkout gửi nguyên danh sách sp + số lượng. Khớp với PDF sequence 2.5.4.

### 1.3. Migrations
- `database/V1__init.sql` — 8 bảng core.
- `database/V2__seed.sql` — 100 sản phẩm mẫu (từ Kaggle cosmetics dataset).
- `database/V3__ai.sql` — làm ở phase AI: `CREATE EXTENSION vector;` + 3 bảng ở §1.2.

---

## 2. Backend (Spring Boot + Java 21)

**Dependencies (Spring Initializr):** `web, data-jpa, security, validation, postgresql`.

### 2.1. Package & Class mapping khớp Class Diagram PDF 2.8

```
com.mypham/
├── config/      # SecurityConfig, JwtAuthFilter
├── auth/        # User entity + AuthService (login, register)
├── san_pham/    # Product + ProductService
├── danh_muc/    # Category
├── don_hang/    # Order + OrderService (createOrder, applyCoupon)
├── ton_kho/     # Inventory + InventoryService (checkAvailability, updateStock)
├── khuyen_mai/  # Coupon + CouponService (isValid)
├── bao_cao/     # ReportService
├── ai/          # AIService (analyzeUserBehavior, getRecommendations) — làm CUỐI
├── common/      # GlobalExceptionHandler, ApiResponse
└── MyPhamApp.java
```

**Mapping Class Diagram PDF → Spring class (method name giữ đúng PDF):**

| PDF | Spring |
|---|---|
| `User` (fullName, email, password, role) + `login()`, `register()` | `User` entity + `AuthService` |
| `Product` (name, price, skinType, description) + `getDetails()` | `Product` entity + `ProductService` |
| `Category` (categoryName) | `Category` entity |
| `Order` (orderDate, totalAmount, status) + `calculateTotal()`, `updateStatus()` | `Order` entity |
| `OrderDetail` (quantity, unitPrice) | `OrderDetail` entity |
| `Inventory` (stockQuantity) + `checkAvailability()`, `updateStock()` | `Inventory` + `InventoryService` |
| `Coupon` (code, discountPercent) + `isValid()` | `Coupon` + `CouponService` |
| `AI_Recommendation` (score) + `generateSuggestions()` | `GoiYAI` entity + `AIService` |
| Service `OrderService`: `createOrder(User, Cart)`, `applyCoupon(Order, Coupon)` | `@Service OrderService` |
| Service `AIService`: `analyzeUserBehavior(User)`, `getRecommendations(User)` | `@Service AIService` proxy → FastAPI |

### 2.2. Common infrastructure (tối giản theo PDF)
- `SecurityConfig` + `JwtAuthFilter` — stateless JWT.
- `GlobalExceptionHandler` → format `{code, message, data}`.
- `@PreAuthorize("hasRole('ADMIN')")` cho admin endpoints.
- CORS whitelist `http://localhost:3000`.
- JPA parameterized query (chống SQL injection — yêu cầu phi chức năng PDF 2.2.2).

### 2.3. API endpoints — khớp Sequence Diagram PDF 2.5.x

**Auth — sequence 2.5.1**
- `POST /api/auth/register` → lưu user (mã hóa mật khẩu) → 201.
- `POST /api/auth/login` → kiểm tra → trả JWT + thông tin user (hoặc 401).
- `GET /api/auth/me`

**Product — sequence 2.5.2 & 2.5.6**
- Public:
  - `GET /api/products` (filter danh_muc, loai_da, giá, sort, pagination)
  - `GET /api/products/{id}`
  - `GET /api/products/search?q=keyword` ← đúng tên PDF
- Admin (JWT role ADMIN):
  - `POST /api/admin/products` ← đúng tên PDF sequence 2.5.6
  - `PUT /api/admin/products/{id}`
  - `DELETE /api/admin/products/{id}`
  - **UC 2.3.3 "include Thiết lập thuộc tính da cho AI"**: validate `loai_da` bắt buộc khi tạo.
- Upload ảnh: lưu local `/uploads`, Spring static serve.

**Category** — CRUD cơ bản (admin).

**Cart — sequence 2.5.3** (client-side cart, server chỉ kiểm tra tồn kho)
- `POST /api/cart/add` ← đúng tên PDF — body `{san_pham_id, so_luong}`, BE kiểm tra `TON_KHO.so_luong_ton`:
  - Còn hàng: trả `{ok: true, ton_kho_con: N}` để FE cập nhật localStorage.
  - Hết hàng: trả `{ok: false, error: "Hết hàng"}`.

**Order — sequence 2.5.4 & BPMN 2.7.1**
- `POST /api/orders/checkout` ← đúng tên PDF — body `{items: [{san_pham_id, so_luong}], ma_coupon, dia_chi}`:
  1. Kiểm tra tồn kho tất cả items.
  2. Kiểm tra mã coupon (`CouponService.isValid`).
  3. Tính tổng tiền.
  4. INSERT `don_hang` + `chi_tiet_don_hang`.
  5. UPDATE `ton_kho` (trừ số lượng).
  6. Trả về order_id.
  - Toàn bộ `@Transactional`.
- `GET /api/orders/me` — lịch sử đơn user hiện tại.
- `GET /api/orders/{id}` — chi tiết đơn.
- Admin:
  - `GET /api/admin/orders`
  - `PUT /api/admin/orders/{id}/status` — admin đổi `PENDING → SHIPPING → COMPLETED` thủ công (BPMN 2.7.1 "Admin xác nhận → Giao hàng cho đơn vị vận chuyển → Hoàn thành"). **Không tích hợp API shipping**, chỉ là thao tác admin.

**Inventory — sequence 2.5.7**
- `GET /api/admin/inventory` — xem tồn kho.
- `POST /api/admin/inventory/update` ← đúng tên PDF — body `{san_pham_id, so_luong}` → UPDATE TON_KHO. Nếu `so_luong_ton < ngưỡng` → trả cảnh báo "Sắp hết hàng" (sequence 2.5.7 "alt [Dưới ngưỡng]").

**Coupon — sequence 2.5.8**
- Admin: `GET/POST/PUT/DELETE /api/admin/coupons` (code, phan_tram_giam, start_at, end_at).
- Customer: áp mã khi checkout (không cần endpoint apply riêng, BE validate trong checkout).

**Report — sequence 2.5.9**
- `GET /api/admin/reports?type=revenue` — tổng doanh thu theo thời gian.
- `GET /api/admin/reports?type=top_products` — sản phẩm bán chạy.
- `GET /api/admin/reports?type=revenue_ai` ← đúng tên PDF — doanh thu + tỷ lệ chuyển đổi AI (chỉ có data sau khi AI module ra đời).
- Xuất báo cáo PDF/Excel (BPMN 2.4.9) — dùng Apache POI hoặc dùng CSV đơn giản.

---

## 3. Frontend (Next.js + Tailwind CSS)

Chỉ dùng những gì PDF nêu: **NextJS + Tailwind CSS**. Không dùng shadcn/ui, Zustand, TanStack Query — dùng thuần React hooks + fetch/axios + localStorage.

**Layout:**
```
frontend/src/
├── app/
│   ├── (shop)/                # khách hàng
│   │   ├── page.tsx           # trang chủ
│   │   ├── san-pham/          # listing & detail
│   │   ├── gio-hang/
│   │   ├── thanh-toan/        # checkout
│   │   └── don-hang/          # lịch sử đơn
│   ├── (admin)/quan-tri/      # admin dashboard
│   │   ├── san-pham/ don-hang/ ton-kho/ khuyen-mai/ bao-cao/
│   ├── dang-ky/ dang-nhap/
├── components/
│   ├── ui/                    # component tự viết (Button, Input, Card, Table, Modal)
│   ├── san-pham/              # ProductCard, ProductList
│   └── chart/                 # biểu đồ báo cáo (dùng Chart.js hoặc SVG thuần)
│   # Thư mục chatbot/ thêm ở phase AI cuối
├── lib/
│   ├── api.ts                 # fetch wrapper + JWT
│   ├── cart.ts                # localStorage cart
│   └── auth.ts                # lưu JWT localStorage
└── middleware.ts              # bảo vệ /quan-tri/*
```

**Chart**: đề cương yêu cầu "biểu đồ doanh thu thời gian thực" — dùng Chart.js (CDN hoặc npm) là đủ. Không cần Recharts.

**State**: JWT + cart lưu localStorage. Không cần Redux/Zustand.

---

## 4. Bảo mật (theo PDF 2.2.2 yêu cầu phi chức năng)

| PDF yêu cầu | Biện pháp |
|---|---|
| Xác thực JWT | Spring Security + JWT filter |
| Phân quyền khách / admin | `@PreAuthorize("hasRole('ADMIN')")` |
| Mã hóa mật khẩu | bcrypt |
| Chuẩn hóa 3NF | Đã ở §1 |
| SQL injection | JPA parameterized query |

---

## 5. Testing

- **Unit test BE** (JUnit 5 + Mockito): service layer chính.
- **Test thủ công** trên browser: đi qua toàn bộ use case PDF 2.3.1.
- Không dùng Testcontainers, Playwright — đề cương không yêu cầu.

---

## 6. Roadmap — phát triển theo module, BE + FE song song

### Phase 0 — Thiết kế (Tuần 1-4) — ĐÃ XONG
Đã có PDF tuần 3-4 với đầy đủ ERD, Use Case, Sequence, Class Diagram, BPMN.

### Phase 1 — Dựng base BE + FE (Tuần 5)
Setup khung dự án, chưa có tính năng cụ thể.

**Backend:**
- `spring init` → scaffold
- Cấu hình `application.properties` kết nối PostgreSQL.
- Tạo `SecurityConfig`, `JwtAuthFilter`, `GlobalExceptionHandler`, `ApiResponse`.
- Chạy migration `V1__init.sql` (8 bảng core) + `V2__seed.sql`.
- Endpoint test `GET /api/ping` → OK.

**Frontend:**
- `npx create-next-app` → scaffold (TypeScript + Tailwind).
- Layout chung: header, footer, layout khách + layout admin.
- `lib/api.ts` fetch wrapper.
- `lib/auth.ts` JWT localStorage helper.
- `middleware.ts` bảo vệ `/quan-tri/*`.
- Trang trắng `/`, `/dang-nhap`, `/quan-tri` chạy được.

**Deliverable Tuần 5:** base chạy, cả BE và FE khởi động OK, connect DB OK, call được `/api/ping` từ FE.

---

### Phase 2 — Code theo module (Tuần 6-11) — BE và FE **SONG SONG** mỗi tuần

Mỗi tuần làm 1 module, **một người hoặc một phiên làm cả BE + FE của module đó** để tránh blocker.

| Tuần | Module | BE deliverable | FE deliverable |
|---|---|---|---|
| **6** | **Auth** (sequence 2.5.1) | `POST /api/auth/register`, `login`, `GET /me`; JWT filter | Trang `/dang-ky`, `/dang-nhap`, lưu JWT localStorage, redirect theo vai_tro |
| **7** | **Sản phẩm & Danh mục** (sequence 2.5.2 & 2.5.6) | `GET /api/products`, `search`, `{id}`; admin CRUD `/api/admin/products`, `/categories`; validate `loai_da` bắt buộc | Trang danh sách sp (filter loai_da, danh_muc, giá), trang chi tiết sp, trang admin quản lý sp (table + form upload ảnh + chọn loai_da bắt buộc), admin quản lý danh mục |
| **8** | **Giỏ hàng & Đặt hàng** (sequence 2.5.3, 2.5.4, BPMN 2.7.1) | `POST /api/cart/add` (kiểm tồn kho); `POST /api/orders/checkout` (@Transactional); `GET /api/orders/me`, `{id}` | Trang giỏ hàng (localStorage + kiểm tồn kho qua /cart/add), trang checkout (địa chỉ + coupon + COD), trang lịch sử đơn + timeline trạng thái |
| **9** | **Tồn kho** (sequence 2.5.7) | `GET /api/admin/inventory`, `POST /api/admin/inventory/update` (cảnh báo ngưỡng) | Trang admin tồn kho: table + form update số lượng + hiển thị badge "Sắp hết hàng" |
| **10** | **Khuyến mãi** (sequence 2.5.8) | `/api/admin/coupons` CRUD; tích hợp validate coupon vào `/orders/checkout` | Trang admin coupon: CRUD form + xem danh sách; FE checkout có ô nhập mã giảm giá |
| **11** | **Báo cáo & Admin order** (sequence 2.5.9) | `GET /api/admin/reports?type=revenue|top_products`; `GET /api/admin/orders`, `PUT {id}/status` | Trang admin dashboard: chart doanh thu (Chart.js), top sp, trang admin đơn hàng (chuyển trạng thái PENDING→SHIPPING→COMPLETED) |

**Quy tắc song song:**
- Mỗi module định nghĩa **API contract** (URL + request/response JSON) **trước** khi code cả 2 phía.
- Commit riêng biệt BE và FE nhưng trong cùng 1 tuần/module.
- Test tích hợp cuối tuần: chạy cả BE + FE, đi qua flow module đó end-to-end bằng tay.

**→ Sau tuần 11: hệ thống TMĐT đã hoàn chỉnh, chạy được đầy đủ use case PDF TRỪ phần AI.**

---

### Phase 3 — Module AI (Tuần 12-13) — BE proxy + AI service + FE widget SONG SONG

#### Tuần 12 — Nền tảng AI
**AI service (FastAPI):**
- Scaffold `ai-service/` với deps `fastapi, uvicorn, sqlalchemy, pgvector, httpx, google-generativeai` (hoặc anthropic).
- `core/llm.py` abstraction — GeminiClient / AnthropicClient switch qua env `LLM_PROVIDER`.
- `core/embedding.py` — gọi embedding API.
- `core/retriever.py` — query pgvector top-K.
- `POST /ingest` — embed sản phẩm, upsert `product_embeddings`.
- Chạy `POST /ingest/full` 1 lần cho 100 sản phẩm.

**BE:**
- Migration `V3__ai.sql` (`CREATE EXTENSION vector;` + 3 bảng).
- Package `com.mypham.ai`:
  - `AIService` với 2 method đúng PDF: `analyzeUserBehavior(User)`, `getRecommendations(User)`.
  - `AIController`: `POST /api/ai/chat`, `GET /api/recommendations/{userId}` (sequence 2.5.5).
- Hook `ProductService.create/update` → HTTP call `/ingest`.

**FE:**
- Chưa cần widget — chỉ check API backend call được AI service.

#### Tuần 13 — Tích hợp đầy đủ
**AI service:**
- `POST /chat` — pipeline RAG (embed → retrieve → prompt LLM → validate id → trả JSON).
- `GET /recommend/{userId}` — dựa lịch sử đơn hàng (từ bảng `don_hang`).
- Lưu `chat_messages` + `goi_y_ai`.

**BE:**
- `AIController.chat` forward sang FastAPI.
- `AIController.getRecommendations` forward sang FastAPI.
- `GET /api/admin/reports?type=revenue_ai` tính CTR: `COUNT(clicks) / COUNT(impressions)` từ `goi_y_ai`.

**FE:**
- `components/chatbot/ChatWidget.tsx` — floating button, chat UI, gọi `/api/ai/chat`, hiển thị card sp + link.
- Trang chủ: widget "Dành riêng cho bạn" gọi `/api/recommendations/{userId}` (sequence 2.5.5).
- Trang chi tiết sp: section "Sản phẩm tương tự".
- Admin dashboard: thêm chart AI CTR.
- Tracking click sp từ AI → POST event.

**Đánh giá AI:** bộ 30 câu hỏi mẫu, chấm tay relevance.

---

### Phase 4 — Báo cáo (Tuần 14)
- Viết báo cáo hoàn thiện, slide, chuẩn bị demo.

---

## 7. Verification — Kiểm thử theo Use Case PDF 2.3.1

**Chạy:** mở 2 terminal (+ terminal 3 ở phase AI).
```bash
# Terminal 1
cd backend && ./mvnw spring-boot:run

# Terminal 2
cd frontend && npm run dev

# Terminal 3 (phase AI)
cd ai-service && source venv/bin/activate && uvicorn app.main:app --reload --port 8000
```

**Test 9 use case theo sequence diagram PDF:**

| UC PDF | Hành động test | Kết quả mong đợi |
|---|---|---|
| 2.5.1 Đăng ký/Đăng nhập | `POST /api/auth/register` → login | Trả JWT + thông tin user |
| 2.5.2 Tìm kiếm | `GET /api/products/search?q=kem` | JSON list sp |
| 2.5.3 Giỏ hàng | `POST /api/cart/add` hết hàng → còn hàng | Lỗi "Hết hàng" / thành công |
| 2.5.4 Đặt hàng | `POST /api/orders/checkout` | Order tạo, TON_KHO giảm |
| 2.5.5 Gợi ý AI | `GET /api/recommendations/{userId}` | List sp + điểm tương thích |
| 2.5.6 Quản lý sp | `POST /api/admin/products` không có `loai_da` | 400; có → 201 |
| 2.5.7 Tồn kho | `POST /api/admin/inventory/update` dưới ngưỡng | Cảnh báo "Sắp hết hàng" |
| 2.5.8 Coupon | `POST /api/admin/coupons` | Mã kích hoạt |
| 2.5.9 Báo cáo | `GET /api/admin/reports?type=revenue_ai` | JSON data cho chart |

**Test theo BPMN:**
- 2.7.1 Đặt hàng đầy đủ: Customer → PENDING → Admin SHIPPING → COMPLETED.
- 2.7.2 Nhận gợi ý: gõ chat → hiện sp.
- 2.7.3 Tồn kho: admin nhập kho → cảnh báo ngưỡng.

---

## Tiêu chí hoàn thành đồ án

- **Chạy được 9 sequence diagram PDF 2.5.x** ở local.
- **API, entity, class name khớp PDF** — code và tài liệu đồng bộ.
- **Chatbot RAG** trả lời bằng tiếng Việt, không hallucination, có dẫn link sản phẩm.
- **Dashboard admin** hiển thị doanh thu + tỷ lệ chuyển đổi AI (sequence 2.5.9).
- Demo trực tiếp trên máy cá nhân khi bảo vệ.
