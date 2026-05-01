# PLAN — Phần còn lại của đồ án

## Context

Đồ án tốt nghiệp Nguyễn Xuân Hoàng (64HTTT3, ĐH Thuỷ Lợi). Stack chốt theo PDF tuần 3-4 §2.3.4: Next.js 15 + Tailwind 4 (FE), Spring Boot 3.3.5 + Java 17 (BE), Python FastAPI (AI service — chưa làm), PostgreSQL 16 (DB), JWT, REST.

**Đã hoàn thành (Tuần 5-11) — Phase 1 + 2:** auth, sản phẩm, danh mục, giỏ hàng, đặt hàng, tồn kho + lịch sử kho, khuyến mãi (quota + soft-delete), đơn hàng admin (state machine + restock + customer cancel), upload ảnh (magic-byte verify), pessimistic lock chống oversell, soft-delete Product/Category/Coupon, WebSocket realtime cho coupon + inventory, modal chọn mã giảm giá. Chi tiết xem git log.

**Còn lại 3 việc — đây là nội dung file này.**

---

## Tổng quan thời gian (~14-17 ngày)

| Sprint | Phạm vi | Thời gian | Ưu tiên |
|---|---|---|---|
| Sprint 1 | Reports + Dashboard chart (UC 2.5.9) | 1-2 ngày | Cao — đóng Tuần 11 |
| Sprint 2 | AI / RAG (UC 2.5.5, BPMN 2.7.2) | 7-10 ngày | Cao — điểm nhấn đồ án |
| Sprint 3 | Báo cáo + slide + demo | 3-5 ngày | Bắt buộc bảo vệ |

Làm tuần tự. **Không nhảy Sprint 2 trước Sprint 1** — Sprint 1 cung cấp dashboard skeleton mà Sprint 2 sẽ cắm thêm chart AI CTR.

---

## Sprint 1 — Reports + Dashboard (1-2 ngày)

### Mục tiêu
Đóng deliverable Tuần 11 còn dở: trang `/quan-tri` thay 4 card hiện tại bằng dashboard có biểu đồ thực tế từ data hệ thống.

### Backend
**Package mới `com.mypham.bao_cao`:**
- `ReportController` `GET /api/admin/reports?type=...`
- `ReportService` 3 query JPQL/native:

| Type | Trả về | Query gợi ý |
|---|---|---|
| `revenue` | `[{date, total}]` 30 ngày gần nhất | `SELECT DATE(created_at), SUM(tong_tien) FROM don_hang WHERE trang_thai='COMPLETED' GROUP BY DATE` |
| `top_products` | `[{sanPhamId, tenSanPham, soLuongDaBan, doanhThu}]` top 10 | JOIN `chi_tiet_don_hang` + `don_hang` + `san_pham`, lọc COMPLETED |
| `order_status` | `Map<TrangThai, Long>` | đã có `OrderRepository.countByTrangThai` |

**Lưu ý kỹ thuật:**
- Chỉ tính đơn `COMPLETED` cho doanh thu (đơn `CANCELLED` không tính, `SHIPPING/PENDING` chưa kết toán).
- Trả timezone `Asia/Ho_Chi_Minh` (đã set trong `application.yml`).
- Response tối thiểu — không over-engineer pagination/filter cho phase này.

### Frontend
- Dependency: `recharts` (lightweight, tree-shakable, hợp Tailwind 4) — `npm i recharts`.
- Refactor `/quan-tri/page.tsx`:
  - Card stat hàng đầu: Tổng doanh thu 30 ngày · Số đơn COMPLETED · Số đơn CANCELLED · Số sp HET_HANG (lấy từ `inventoryApi.listAdmin` filter `hetHang`).
  - Chart 1: LineChart doanh thu 30 ngày.
  - Chart 2: BarChart top 10 sp bán chạy.
  - Chart 3: PieChart phân bố trạng thái đơn.
- Giữ link điều hướng tới các module (Sản phẩm/Tồn kho/...) ở sidebar — không xoá.
- Số liệu trống: hiển thị empty state "Chưa có đơn nào", không vẽ chart trống.

### Definition of Done
- [ ] `GET /api/admin/reports?type=revenue` trả mảng JSON có dữ liệu thật từ đơn COMPLETED
- [ ] 3 chart render đúng dữ liệu trên `/quan-tri`
- [ ] Đặt 1 đơn test, đổi sang COMPLETED → chart cập nhật sau reload
- [ ] Build clean, không TS error

---

## Sprint 2 — AI / RAG (7-10 ngày)

### Mục tiêu
UC 2.5.5 (gợi ý sản phẩm), BPMN 2.7.2 (chatbot trả lời tiếng Việt + dẫn link sp). Là điểm nhấn đồ án.

### Quyết định kỹ thuật
- **LLM**: Gemini 1.5 Flash (free tier 60 req/min, 1500 req/ngày — đủ cho demo + 30 câu test). Backup: Anthropic Claude Haiku.
- **Embedding model**: `text-embedding-004` của Google (768 dimensions, cùng nhà cung cấp với LLM để tránh quản lý 2 API key).
- **Vector store**: pgvector trong cùng Postgres `mypham` — không thêm DB riêng.
- **Layer abstraction**: `LLMClient` interface để swap Gemini ↔ Claude qua env `LLM_PROVIDER`. Thầy hỏi "swap được không?" → có chứng cứ.

### Sprint 2a — Pre-flight (0.5 ngày, làm ĐẦU TIÊN)
Senior-dev rule: **smoke-test rủi ro lớn trước khi viết feature**.

1. **Cài pgvector trên Postgres local:**
   ```bash
   brew install pgvector
   psql -d mypham -c "CREATE EXTENSION IF NOT EXISTS vector;"
   psql -d mypham -c "SELECT '[1,2,3]'::vector;"  # phải trả về ok
   ```
   Nếu fail → giải quyết NGAY trước khi code. Nếu Postgres.app không hỗ trợ pgvector → cài Postgres mới qua brew.

2. **Lấy Gemini API key:** https://aistudio.google.com/apikey → key free tier. Lưu vào `ai-service/.env` (không commit).

3. **Smoke test embedding + chat:** viết 1 file `scripts/smoke.py` ngoài app, chạy 1 request embedding + 1 request chat → in output. Pass rồi mới scaffold service.

**Chỉ tiến qua Sprint 2b nếu cả 3 bước trên xanh.**

### Sprint 2b — Hạ tầng AI (2-3 ngày)

**Database (`V3__ai.sql`):**
```sql
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE product_embeddings (
    san_pham_id BIGINT PRIMARY KEY REFERENCES san_pham(id) ON DELETE CASCADE,
    embedding   vector(768) NOT NULL,
    updated_at  TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_product_embeddings_hnsw
    ON product_embeddings USING hnsw (embedding vector_cosine_ops);

CREATE TABLE chat_sessions (
    id            BIGSERIAL PRIMARY KEY,
    nguoi_dung_id BIGINT REFERENCES nguoi_dung(id),  -- NULL = guest
    created_at    TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE chat_messages (
    id          BIGSERIAL PRIMARY KEY,
    session_id  BIGINT NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
    role        VARCHAR(20) NOT NULL CHECK (role IN ('USER','ASSISTANT')),
    noi_dung    TEXT NOT NULL,
    san_pham_ids BIGINT[],     -- sp được retrieve
    created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE goi_y_ai (
    id              BIGSERIAL PRIMARY KEY,
    nguoi_dung_id   BIGINT REFERENCES nguoi_dung(id),
    san_pham_id     BIGINT NOT NULL REFERENCES san_pham(id) ON DELETE CASCADE,
    diem_tuong_thich NUMERIC(4,3),
    impression      BOOLEAN NOT NULL DEFAULT TRUE,
    clicked         BOOLEAN NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_goi_y_ai_user ON goi_y_ai(nguoi_dung_id, created_at DESC);
```

Set `ddl-auto: validate` cho production sau này nhưng giữ `update` cho dev — Spring tự pick lên các bảng mới.

**AI service (Python FastAPI ở port 8000):**
```
ai-service/
├── app/
│   ├── main.py              # FastAPI app
│   ├── core/
│   │   ├── llm.py           # LLMClient interface + GeminiClient
│   │   ├── embedding.py     # embed(text) -> vector
│   │   └── retriever.py     # query pgvector top-K
│   ├── routers/
│   │   ├── ingest.py        # POST /ingest (1 sp), POST /ingest/full
│   │   ├── chat.py          # POST /chat
│   │   └── recommend.py     # GET /recommend/{userId}
│   └── db.py                # asyncpg pool
├── scripts/smoke.py
├── requirements.txt
└── .env.example
```

**Endpoints:**
- `POST /ingest` body `{sanPhamId, tenSanPham, moTa, loaiDa, thuongHieu}` → embed + upsert.
- `POST /ingest/full` → đọc tất cả sp ACTIVE từ DB, ingest tuần tự, log progress.
- `POST /chat` body `{message, sessionId?, userId?}` → embed query → top-5 sp → prompt LLM → trả `{reply, sanPhamIds}`. Lưu cả 2 message vào `chat_messages`.
- `GET /recommend/{userId}` → đọc `chi_tiet_don_hang` của user → embed các sp đã mua → average → search top-K loại trừ sp đã mua → trả + ghi `goi_y_ai`.

**BE Spring (`com.mypham.ai`):**
- `AIClient` (HTTP client gọi FastAPI, configurable URL qua env `AI_SERVICE_URL=http://localhost:8000`).
- `AIService` 2 method đúng PDF: `analyzeUserBehavior(User)`, `getRecommendations(User)`.
- `AIController`:
  - `POST /api/ai/chat` → forward body.
  - `GET /api/recommendations/{userId}` → forward + chỉ cho user truy cập của chính họ (IDOR check).
  - `POST /api/ai/click` → tracking `goi_y_ai.clicked=true` cho recommend ID nào đó.
- Hook `ProductService.create/update` → async call `/ingest` (fire-and-forget, không fail product save nếu AI down).

**Definition of Done Sprint 2b:**
- [ ] `POST /ingest/full` chạy thành công cho 100 sp, `SELECT COUNT(*) FROM product_embeddings` = số sp ACTIVE
- [ ] `curl POST /api/ai/chat -d '{"message":"có serum nào cho da dầu không"}'` trả JSON có `reply` tiếng Việt + 3-5 `sanPhamIds`
- [ ] `GET /api/recommendations/{userId}` trả 5 sp khác sp user đã mua
- [ ] FastAPI down → `POST /api/admin/products` vẫn tạo được sp (không fail)

### Sprint 2c — UI + tracking (2-3 ngày)

**FE:**
- `components/chatbot/ChatWidget.tsx` — floating button góc dưới phải `fixed bottom-6 right-6 z-50`. Click mở panel 380×500. Lưu `sessionId` localStorage để tiếp nối hội thoại sau reload. Loading state animate trong khi chờ. Khi reply có `sanPhamIds` → render mini ProductCard kèm link.
- Trang chủ `app/page.tsx`: nếu có `user`, gọi `GET /api/recommendations/{user.id}`, render section "Dành riêng cho bạn" 5 sp ngang. Click sp → POST `/api/ai/click` để tracking CTR.
- Trang chi tiết sp: `GET /api/ai/similar/{productId}` (endpoint mới — embed sp hiện tại + retrieve top-4 ≠ chính nó). Section "Sản phẩm tương tự".
- **Update sidebar admin** thêm card "AI / Gợi ý" → `/quan-tri/ai` xem chat sessions gần đây + CTR.

**Admin AI dashboard (`/quan-tri/ai`):**
- BarChart CTR theo ngày (`COUNT(clicked)/COUNT(*)` từ `goi_y_ai` group by ngày).
- Bảng 20 chat session gần nhất + click vào xem messages.
- BE: `GET /api/admin/reports?type=revenue_ai` đã có schema từ plan PDF — trả CTR + impact.

**Tracking CTR:**
- Mỗi lần FE render gợi ý → ghi `goi_y_ai` impression=true.
- Click → POST `/api/ai/click` → set `clicked=true`.
- Báo cáo CTR = clicked/impressions.

### Sprint 2d — Đánh giá (1 ngày)
- Soạn `docs/ai-test-prompts.md` 30 câu hỏi tiếng Việt: skin type, brand, price range, "tôi bị mụn", "quà tặng mẹ", v.v.
- Chấm tay theo 4 mức: Hoàn hảo / Tốt / Sai 1 phần / Sai. Target: 80% Hoàn hảo + Tốt.
- Note vào báo cáo Tuần 14.

### Risks & mitigations Sprint 2

| Rủi ro | Khả năng | Mitigation |
|---|---|---|
| pgvector không cài được trên local | Trung | Sprint 2a smoke-test trước; fallback dùng Postgres.app preset hỗ trợ pgvector |
| Free tier Gemini hết quota khi demo | Thấp | Giới hạn 30 prompt test, demo 5-10 prompt thật. Có Claude Haiku backup key |
| LLM hallucination (bịa sp không tồn tại) | Cao | Prompt template ép format JSON, validate `sanPhamIds` ∈ DB trước khi trả FE |
| Latency 3-5s/chat → khách bỏ giữa chừng | Trung | Loading skeleton + abort signal khi user đóng widget |
| Embedding model đổi → phải re-ingest | Thấp | Cố định model name trong `.env`, document |
| Async ingest fail làm sp không có vector | Trung | Endpoint admin `POST /api/admin/ai/reindex` chạy lại `/ingest/full` thủ công |
| Tracking CTR phình bảng `goi_y_ai` | Thấp (đồ án) | Chỉ ghi log impression khi user thật xem (`/api/recommendations/me`), không ghi cho admin preview |

---

## Sprint 3 — Báo cáo + slide + demo (3-5 ngày)

### Mục tiêu
Báo cáo bản cứng + slide đủ để bảo vệ. Đồng bộ tài liệu với code thực tế (đã divergence sau 8 sprint).

### Sub-task
1. **Re-draw sơ đồ** vì code đã thay đổi vs PDF tuần 3-4:
   - **ERD**: từ 8 → 11 bảng (`lich_su_kho`, `product_embeddings`, `chat_sessions`, `chat_messages`, `goi_y_ai` thêm; `gio_hang` đã bỏ).
   - **Class Diagram**: thêm enum `Status.HIDDEN` cho `Coupon` + `Category`, field `soLuong/daSuDung` cho `Coupon`, method `incrementUsed/decrementUsed`, `restockOrder`.
   - **Sequence**:
     - Bổ sung sequence WebSocket cho coupon + inventory (BPMN 2.7.4 mới: realtime sync).
     - Update sequence checkout: thêm bước `+1 daSuDung` sau khi tạo đơn.
   - **Use Case**: thêm UC "Khách huỷ đơn ở trạng thái PENDING" + "Admin huỷ đơn → restock".
   - **BPMN 2.7.2** (Nhận gợi ý AI): vẽ mới ở Sprint 2.
2. **Viết báo cáo bản cứng** theo template Thuỷ Lợi:
   - Chương 1-2: lý thuyết + công nghệ (đã có PDF tuần 3-4, refresh).
   - Chương 3: Phân tích + Thiết kế (sơ đồ mới ở §1).
   - Chương 4: Triển khai (mỗi module 1 mục: API, screenshot trang, đoạn code mấu chốt).
   - Chương 5: Đánh giá (kết quả 30 prompt AI, screenshot dashboard CTR).
   - Chương 6: Kết luận + hướng phát triển (deploy production, payment gateway, mobile app...).
3. **Slide** 25-30 trang:
   - 5 slide intro + lý do chọn đề tài.
   - 5 slide kiến trúc + công nghệ.
   - 10 slide demo flow (mỗi UC 1 slide screenshot).
   - 5 slide AI (RAG flow + dashboard CTR + 1 demo chat live).
   - 3 slide kết luận.
4. **Chuẩn bị demo flow** — viết script:
   - Login khách → search → thêm giỏ → checkout → xem đơn.
   - Login admin → tồn kho → khuyến mãi (mở 2 tab realtime) → đơn hàng.
   - Hỏi chatbot 3 câu (đã thuộc): da dầu, brand cụ thể, gợi ý quà.
   - Show dashboard doanh thu + CTR AI.
5. **Reset DB demo**: dump database hiện có, làm 1 bộ data sạch (10 sp + 5 đơn + 3 mã giảm giá + 1 user khách 1 admin). Tránh demo gặp data nhiễm test cũ.

### Definition of Done
- [ ] PDF báo cáo đủ chương + đầy đủ ảnh
- [ ] PPTX slide đủ section
- [ ] Demo script tập 2 lần ≤ 15 phút không vấp
- [ ] DB demo sạch + commit `database/seed-demo.sql`

---

## Verification — UC matrix

| UC PDF | Trạng thái | Test |
|---|---|---|
| 2.5.1 Auth | ✅ Done | Login admin/customer, JWT cookie/localStorage |
| 2.5.2 Search | ✅ Done | `/san-pham?search=` filter loại da, danh mục |
| 2.5.3 Cart | ✅ Done | `POST /api/cart/add` reject sp HIDDEN, hết hàng |
| 2.5.4 Checkout | ✅ Done | Pessimistic lock, audit log, +1 coupon usage |
| **2.5.5 Gợi ý AI** | 🚧 Sprint 2 | `GET /api/recommendations/{userId}` |
| 2.5.6 Quản lý sp | ✅ Done | Validate `loai_da`, magic-byte upload, soft-delete |
| 2.5.7 Tồn kho | ✅ Done | Threshold cảnh báo, audit log đầy đủ, realtime |
| 2.5.8 Coupon | ✅ Done | Quota, soft-delete, modal chọn mã, realtime |
| **2.5.9 Báo cáo** | 🚧 Sprint 1 | `GET /api/admin/reports?type=revenue` |

| BPMN | Trạng thái |
|---|---|
| 2.7.1 Đặt hàng PENDING→SHIPPING→COMPLETED | ✅ |
| 2.7.2 Nhận gợi ý AI | 🚧 Sprint 2 |
| 2.7.3 Tồn kho cảnh báo | ✅ |
| 2.7.4 Realtime coupon + inventory (mới, ngoài plan) | ✅ — đưa vào báo cáo Sprint 3 |

---

## Tiêu chí hoàn thành đồ án

- [x] 7/9 sequence diagram chạy được local (chỉ thiếu 2.5.5 + 2.5.9)
- [ ] Sprint 1 hoàn thành 2 UC còn lại
- [ ] Sprint 2 chatbot tiếng Việt, có dẫn link sp, không hallucinate sp ngoài DB
- [ ] Sprint 2 dashboard CTR AI hoạt động
- [ ] Sprint 3 báo cáo + slide + demo script sẵn sàng
- [ ] Demo trực tiếp 15 phút trên máy cá nhân khi bảo vệ

---

## Senior-dev notes

1. **Không refactor code đã chạy** ở Sprint 1-3. Đã ổn định, đừng đụng. Phát hiện bug mới → fix nhỏ + ghi PR riêng.
2. **Commit theo Sprint, không gộp**. Mỗi Sprint xong → commit + push, để có timeline rõ trong git.
3. **Sprint 2 viết test trước khi demo** — không demo bằng prompt vừa nghĩ ra; có test fixture từ Sprint 2d. Thầy ấn tượng vì có data.
4. **AI service luôn có fallback degrade**: chatbot down → FE hiện "Trợ lý AI tạm nghỉ, vui lòng dùng tìm kiếm". Không để demo crash.
5. **Đừng đụng pgvector trừ Sprint 2.** Nó là single point of failure — chỉ chạy migration khi đã smoke-test pass.
6. **Backup demo DB**: trước buổi bảo vệ, dump `pg_dump mypham > backup-demo.sql`. Nếu DB bị bẩn 5 phút trước demo → restore.
