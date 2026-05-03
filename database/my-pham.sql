
DROP TABLE IF EXISTS chi_tiet_don_hang CASCADE;
DROP TABLE IF EXISTS don_hang CASCADE;
DROP TABLE IF EXISTS khuyen_mai CASCADE;
DROP TABLE IF EXISTS ton_kho CASCADE;
DROP TABLE IF EXISTS san_pham CASCADE;
DROP TABLE IF EXISTS danh_muc CASCADE;
DROP TABLE IF EXISTS nguoi_dung CASCADE;


CREATE TABLE nguoi_dung (
    id            BIGSERIAL PRIMARY KEY,
    ho_ten        VARCHAR(100) NOT NULL,
    email         VARCHAR(100) UNIQUE NOT NULL,
    mat_khau      VARCHAR(255) NOT NULL,  -- bcrypt hash
    vai_tro       VARCHAR(20)  NOT NULL DEFAULT 'CUSTOMER'
                  CHECK (vai_tro IN ('CUSTOMER', 'ADMIN')),
    so_dien_thoai VARCHAR(20),
    created_at    TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE danh_muc (
    id            BIGSERIAL PRIMARY KEY,
    ten_danh_muc  VARCHAR(100) NOT NULL,
    parent_id     BIGINT REFERENCES danh_muc(id) ON DELETE SET NULL,
    hinh_anh      TEXT,
    thu_tu        INT NOT NULL DEFAULT 0,
    trang_thai    VARCHAR(20) NOT NULL DEFAULT 'ACTIVE'
                  CHECK (trang_thai IN ('ACTIVE', 'HIDDEN'))
);


CREATE TABLE san_pham (
    id            BIGSERIAL PRIMARY KEY,
    ma_san_pham   VARCHAR(50) UNIQUE,
    ten_san_pham  VARCHAR(255) NOT NULL,
    gia           NUMERIC(12,2) NOT NULL CHECK (gia >= 0),
    loai_da       VARCHAR(50)  NOT NULL
                  CHECK (loai_da IN ('OILY','DRY','COMBINATION','SENSITIVE','NORMAL','ALL')),
    danh_muc_id   BIGINT       NOT NULL REFERENCES danh_muc(id),
    mo_ta         TEXT,
    thuong_hieu   VARCHAR(100),
    trang_thai    VARCHAR(20) DEFAULT 'ACTIVE'
                  CHECK (trang_thai IN ('ACTIVE', 'HIDDEN')),
    created_at    TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_san_pham_danh_muc ON san_pham(danh_muc_id);
CREATE INDEX idx_san_pham_loai_da  ON san_pham(loai_da);

-- Ảnh sản phẩm (1 sp - N ảnh)
CREATE TABLE san_pham_anh (
    id           BIGSERIAL PRIMARY KEY,
    san_pham_id  BIGINT NOT NULL REFERENCES san_pham(id) ON DELETE CASCADE,
    url          TEXT NOT NULL,
    thu_tu       INT NOT NULL DEFAULT 0,
    created_at   TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_san_pham_anh_san_pham ON san_pham_anh(san_pham_id);


CREATE TABLE ton_kho (
    id            BIGSERIAL PRIMARY KEY,
    san_pham_id   BIGINT UNIQUE NOT NULL REFERENCES san_pham(id) ON DELETE CASCADE,
    so_luong_ton  INTEGER NOT NULL DEFAULT 0 CHECK (so_luong_ton >= 0),
    nguong_canh_bao INTEGER DEFAULT 10        -- dưới mức này thì cảnh báo
);

-- Audit log nhập / xuất / đặt / đơn hàng (mỗi thay đổi 1 row)
CREATE TABLE lich_su_kho (
    id            BIGSERIAL PRIMARY KEY,
    san_pham_id   BIGINT NOT NULL REFERENCES san_pham(id) ON DELETE CASCADE,
    nguoi_dung_id BIGINT REFERENCES nguoi_dung(id),
    action        VARCHAR(20) NOT NULL CHECK (action IN ('IMPORT','EXPORT','SET','ORDER')),
    so_luong      INT NOT NULL,                  -- giá trị input
    ton_truoc     INT NOT NULL,                  -- snapshot trước
    ton_sau       INT NOT NULL,                  -- snapshot sau
    nguon         VARCHAR(100),                  -- 'admin_panel' | 'don_hang_<id>'
    ghi_chu       TEXT,
    created_at    TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_lich_su_kho_san_pham ON lich_su_kho(san_pham_id, created_at DESC);


CREATE TABLE khuyen_mai (
    id              BIGSERIAL PRIMARY KEY,
    ma_code         VARCHAR(50) UNIQUE NOT NULL,
    phan_tram_giam  NUMERIC(5,2) NOT NULL CHECK (phan_tram_giam > 0 AND phan_tram_giam <= 100),
    start_at        TIMESTAMPTZ NOT NULL,
    end_at          TIMESTAMPTZ NOT NULL,
    status          VARCHAR(20) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'HIDDEN')),
    so_luong        INTEGER,                                  -- NULL = không giới hạn
    da_su_dung      INTEGER NOT NULL DEFAULT 0,
    CHECK (end_at > start_at),
    CHECK (so_luong IS NULL OR so_luong >= da_su_dung)
);


CREATE TABLE don_hang (
    id             BIGSERIAL PRIMARY KEY,
    nguoi_dung_id  BIGINT NOT NULL REFERENCES nguoi_dung(id),
    tong_tien      NUMERIC(12,2) NOT NULL CHECK (tong_tien >= 0),
    trang_thai     VARCHAR(20) NOT NULL DEFAULT 'PENDING'
                   CHECK (trang_thai IN ('PENDING', 'SHIPPING', 'COMPLETED', 'CANCELLED')),
    dia_chi_giao   TEXT NOT NULL,
    phuong_thuc_tt VARCHAR(20) DEFAULT 'COD',
    khuyen_mai_id  BIGINT REFERENCES khuyen_mai(id) ON DELETE SET NULL,
    created_at     TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_don_hang_nguoi_dung ON don_hang(nguoi_dung_id, created_at DESC);

CREATE TABLE chi_tiet_don_hang (
    id            BIGSERIAL PRIMARY KEY,
    don_hang_id   BIGINT NOT NULL REFERENCES don_hang(id) ON DELETE CASCADE,
    san_pham_id   BIGINT NOT NULL REFERENCES san_pham(id),
    so_luong      INTEGER NOT NULL CHECK (so_luong > 0),
    gia_ban       NUMERIC(12,2) NOT NULL CHECK (gia_ban >= 0)  -- snapshot giá lúc đặt
);
CREATE INDEX idx_chi_tiet_don_hang_don_hang ON chi_tiet_don_hang(don_hang_id);

-- Cấu hình cửa hàng — singleton (luôn 1 row id=1)
CREATE TABLE cau_hinh_cua_hang (
    id                BIGINT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
    ten_cua_hang      VARCHAR(255) NOT NULL DEFAULT 'Ngọc Lan Beauty',
    logo_url          TEXT,
    dia_chi_tinh      VARCHAR(100),
    dia_chi_quan      VARCHAR(100),
    dia_chi_phuong    VARCHAR(100),
    dia_chi_chi_tiet  VARCHAR(255),
    so_dien_thoai     VARCHAR(20),
    email_lien_he     VARCHAR(100),
    link_facebook     TEXT,
    link_instagram    TEXT,
    link_tiktok       TEXT,
    link_youtube      TEXT,
    updated_at        TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO cau_hinh_cua_hang (id, ten_cua_hang) VALUES (1, 'Ngọc Lan Beauty');



-- Tài khoản test sẽ được AuthSeeder tạo khi BE boot (profile=dev).
--   admin@mypham.local / admin12345 (ADMIN)
--   thuha@email.com    / thuha12345 (CUSTOMER)
-- Không insert user vào SQL để tránh hash lệch.

-- Danh mục mẫu
INSERT INTO danh_muc (ten_danh_muc) VALUES
  ('Chăm sóc da'),
  ('Trang điểm'),
  ('Chăm sóc tóc'),
  ('Nước hoa'),
  ('Chăm sóc cơ thể');

-- Sản phẩm mẫu (10 sản phẩm để test, seed 100 sẽ làm sau)
INSERT INTO san_pham (ten_san_pham, gia, loai_da, danh_muc_id, mo_ta, thuong_hieu) VALUES
  ('Sữa rửa mặt CeraVe cho da dầu',      250000, 'OILY',         1, 'Sữa rửa mặt dịu nhẹ, kiểm soát dầu',                   'CeraVe'),
  ('Kem dưỡng ẩm La Roche-Posay',        450000, 'DRY',          1, 'Kem dưỡng cho da khô, cấp ẩm sâu',                      'La Roche-Posay'),
  ('Toner Klairs không cồn',             320000, 'SENSITIVE',    1, 'Toner dịu nhẹ cho da nhạy cảm',                         'Klairs'),
  ('Serum Vitamin C Some By Mi',         380000, 'ALL',          1, 'Serum dưỡng trắng, làm sáng da',                        'Some By Mi'),
  ('Son kem lì 3CE Velvet',              320000, 'ALL',          2, 'Son lì lâu trôi, màu chuẩn',                            '3CE'),
  ('Phấn phủ Innisfree No Sebum',        210000, 'OILY',         2, 'Phấn phủ kiềm dầu',                                     'Innisfree'),
  ('Dầu gội TRESemmé Keratin Smooth',    180000, 'ALL',          3, 'Dầu gội phục hồi tóc hư tổn',                           'TRESemmé'),
  ('Nước hoa Chanel Coco Mademoiselle',  3200000,'ALL',          4, 'Nước hoa nữ hương hoa cỏ',                              'Chanel'),
  ('Sữa tắm Dove Nourishing',            150000, 'ALL',          5, 'Sữa tắm dưỡng ẩm cho da',                               'Dove'),
  ('Kem chống nắng Anessa Perfect UV',   520000, 'ALL',          1, 'Kem chống nắng SPF50+ PA++++',                          'Anessa');

-- Tồn kho cho 10 sản phẩm
INSERT INTO ton_kho (san_pham_id, so_luong_ton)
  SELECT id, 50 FROM san_pham;

-- Mã giảm giá mẫu
INSERT INTO khuyen_mai (ma_code, phan_tram_giam, start_at, end_at) VALUES
  ('WELCOME10',  10, NOW(), NOW() + INTERVAL '30 days'),
  ('SALE20',     20, NOW(), NOW() + INTERVAL '7 days');


