-- Sprint 2 — AI / RAG schema (theo plan §1.2)
-- Chạy SAU khi đã CREATE EXTENSION vector
-- (xem docs/SETUP-AI.md)

CREATE EXTENSION IF NOT EXISTS vector;

-- ====== Embeddings sản phẩm ======
CREATE TABLE IF NOT EXISTS product_embeddings (
    san_pham_id BIGINT PRIMARY KEY REFERENCES san_pham(id) ON DELETE CASCADE,
    embedding   vector(768) NOT NULL,
    -- model name + version để biết khi nào re-ingest
    model       VARCHAR(50) NOT NULL DEFAULT 'text-embedding-004',
    -- text gốc đã embed (debug + so sánh)
    source_text TEXT,
    updated_at  TIMESTAMPTZ DEFAULT now()
);

-- HNSW index cho cosine similarity — fast retrieve
CREATE INDEX IF NOT EXISTS idx_product_embeddings_hnsw
    ON product_embeddings
    USING hnsw (embedding vector_cosine_ops);

-- ====== Chat sessions ======
CREATE TABLE IF NOT EXISTS chat_sessions (
    id            BIGSERIAL PRIMARY KEY,
    nguoi_dung_id BIGINT REFERENCES nguoi_dung(id) ON DELETE SET NULL,  -- NULL = guest
    created_at    TIMESTAMPTZ DEFAULT now(),
    updated_at    TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_user
    ON chat_sessions(nguoi_dung_id, created_at DESC);

CREATE TABLE IF NOT EXISTS chat_messages (
    id            BIGSERIAL PRIMARY KEY,
    session_id    BIGINT NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
    role          VARCHAR(20) NOT NULL CHECK (role IN ('USER','ASSISTANT','SYSTEM')),
    noi_dung      TEXT NOT NULL,
    san_pham_ids  BIGINT[],     -- sp được retrieve / dẫn link
    created_at    TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_chat_messages_session
    ON chat_messages(session_id, created_at);

-- ====== Gợi ý AI + tracking CTR ======
-- (Thay thế bảng goi_y_ai cũ vì cần thêm field tracking)
DROP TABLE IF EXISTS goi_y_ai CASCADE;
CREATE TABLE goi_y_ai (
    id              BIGSERIAL PRIMARY KEY,
    nguoi_dung_id   BIGINT REFERENCES nguoi_dung(id) ON DELETE CASCADE,
    san_pham_id     BIGINT NOT NULL REFERENCES san_pham(id) ON DELETE CASCADE,
    diem_tuong_thich NUMERIC(5,4),         -- score cosine 0-1
    nguon           VARCHAR(20) NOT NULL DEFAULT 'HOMEPAGE'
                    CHECK (nguon IN ('CHAT', 'HOMEPAGE', 'PRODUCT_DETAIL')),
    da_click        BOOLEAN NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_goi_y_ai_nguoi_dung
    ON goi_y_ai(nguoi_dung_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_goi_y_ai_ctr
    ON goi_y_ai(created_at DESC, da_click);

COMMENT ON TABLE product_embeddings IS 'Vector 768d embed bằng text-embedding-004 cho RAG retrieve';
COMMENT ON TABLE chat_sessions IS 'Mỗi session là 1 hội thoại liên tục với chatbot';
COMMENT ON TABLE goi_y_ai IS 'Mỗi row = 1 lần hệ thống gợi ý 1 sp (impression). da_click=true khi user click → tính CTR';
