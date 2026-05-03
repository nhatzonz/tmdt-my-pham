-- ======================================================================
-- TRA CỨU MÃ LỖI THIẾT BỊ ĐIỆN TỬ
-- Schema cho database `tracuu_maloi`
-- ======================================================================

DROP TABLE IF EXISTS ma_loi_anh CASCADE;
DROP TABLE IF EXISTS ma_loi CASCADE;
DROP TABLE IF EXISTS thiet_bi CASCADE;
DROP TABLE IF EXISTS nguoi_dung CASCADE;
DROP TABLE IF EXISTS cau_hinh_he_thong CASCADE;


-- Người dùng (chỉ dùng cho admin login)
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


-- Thiết bị: TV, tủ lạnh, máy giặt, điều hoà, ...
CREATE TABLE thiet_bi (
    id            BIGSERIAL PRIMARY KEY,
    ten_thiet_bi  VARCHAR(150) NOT NULL,
    hang          VARCHAR(100),
    hinh_anh      TEXT,
    mo_ta         TEXT,
    thu_tu        INT NOT NULL DEFAULT 0,
    trang_thai    VARCHAR(20) NOT NULL DEFAULT 'ACTIVE'
                  CHECK (trang_thai IN ('ACTIVE', 'HIDDEN'))
);


-- Mã lỗi
CREATE TABLE ma_loi (
    id              BIGSERIAL PRIMARY KEY,
    ma_loi          VARCHAR(50) NOT NULL,
    ten_loi         VARCHAR(255) NOT NULL,
    thiet_bi_id     BIGINT NOT NULL REFERENCES thiet_bi(id),
    mo_ta           TEXT,
    nguyen_nhan     TEXT,
    cach_khac_phuc  TEXT,
    muc_do          VARCHAR(20) NOT NULL DEFAULT 'TRUNG_BINH'
                    CHECK (muc_do IN ('NHE', 'TRUNG_BINH', 'NGHIEM_TRONG')),
    trang_thai      VARCHAR(20) NOT NULL DEFAULT 'ACTIVE'
                    CHECK (trang_thai IN ('ACTIVE', 'HIDDEN')),
    luot_xem        BIGINT NOT NULL DEFAULT 0,
    created_at      TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (thiet_bi_id, ma_loi)
);
CREATE INDEX idx_ma_loi_thiet_bi ON ma_loi(thiet_bi_id);
CREATE INDEX idx_ma_loi_ma       ON ma_loi(ma_loi);
CREATE INDEX idx_ma_loi_muc_do   ON ma_loi(muc_do);


-- Hình ảnh của mã lỗi
CREATE TABLE ma_loi_anh (
    id          BIGSERIAL PRIMARY KEY,
    ma_loi_id   BIGINT NOT NULL REFERENCES ma_loi(id) ON DELETE CASCADE,
    url         TEXT NOT NULL,
    thu_tu      INT NOT NULL DEFAULT 0,
    created_at  TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_ma_loi_anh_ma_loi ON ma_loi_anh(ma_loi_id);


-- Cấu hình hệ thống — singleton
CREATE TABLE cau_hinh_he_thong (
    id                BIGINT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
    ten_he_thong      VARCHAR(255) NOT NULL DEFAULT 'Tra Cứu Mã Lỗi',
    logo_url          TEXT,
    mo_ta             TEXT,
    so_dien_thoai     VARCHAR(20),
    email_lien_he     VARCHAR(100),
    dia_chi           VARCHAR(255),
    link_facebook     TEXT,
    link_youtube      TEXT,
    updated_at        TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO cau_hinh_he_thong (id, ten_he_thong, mo_ta, so_dien_thoai, email_lien_he, dia_chi)
VALUES (
    1,
    'Tra Cứu Mã Lỗi Thiết Bị',
    'Hệ thống tra cứu nhanh mã lỗi của tủ lạnh, máy giặt, điều hoà, tivi và nhiều thiết bị khác — kèm hình ảnh minh hoạ và cách khắc phục cụ thể.',
    '1900 0000',
    'support@tracuumaloi.vn',
    '175 Tây Sơn, Đống Đa, Hà Nội'
);


-- Tài khoản admin sẽ được AuthSeeder tạo khi BE boot (profile=dev).
--   admin@tracuu.local / admin12345 (ADMIN)


-- ======================================================================
-- DỮ LIỆU MẪU
-- ======================================================================

-- Thiết bị mẫu (đa dạng hãng, đa dạng loại)
INSERT INTO thiet_bi (ten_thiet_bi, hang, mo_ta, thu_tu) VALUES
  ('Máy giặt cửa trước Inverter',  'Samsung',   'Dòng máy giặt cửa trước Samsung WW Series — phổ biến tại Việt Nam, hỗ trợ EcoBubble, 8-10kg.',                            1),
  ('Máy giặt cửa trên',            'LG',        'Máy giặt LG cửa trên Smart Inverter, lồng giặt thông minh, 9-13kg.',                                                       2),
  ('Tủ lạnh Inverter Side-by-side','LG',        'Tủ lạnh LG ngăn đôi Side-by-side với InstaView, công nghệ Linear Inverter tiết kiệm điện.',                                3),
  ('Tủ lạnh Multi Door',           'Hitachi',   'Tủ lạnh Hitachi nhiều ngăn dung tích lớn, cảm biến Eco-Sensor, làm lạnh sâu.',                                             4),
  ('Điều hoà 1 chiều Inverter',    'Daikin',    'Máy lạnh Daikin treo tường FTKB Series — gas R32, làm lạnh nhanh, tiết kiệm điện.',                                        5),
  ('Điều hoà 2 chiều Inverter',    'Panasonic', 'Điều hoà Panasonic 2 chiều nóng-lạnh, lọc nanoeX, phù hợp khí hậu miền Bắc.',                                              6),
  ('Smart TV LED 4K',              'Sony',      'Tivi Sony Bravia X Series, xử lý hình ảnh X1 4K HDR, hệ điều hành Google TV.',                                             7),
  ('Smart TV QLED 4K',             'Samsung',   'Tivi Samsung QLED 4K Quantum Dot, Tizen OS, Magic Remote.',                                                                8),
  ('Lò vi sóng cơ',                'Panasonic', 'Lò vi sóng Panasonic dung tích 23L, công suất 800W, có nướng và rã đông.',                                                 9),
  ('Bình nóng lạnh trực tiếp',     'Ariston',   'Bình nóng lạnh Ariston SM Series có chống giật ELCB, phù hợp gia đình 2-4 người.',                                        10),
  ('Bếp từ đôi',                   'Bosch',     'Bếp từ đôi Bosch nhập khẩu Đức, công suất 2 vùng nấu, chức năng Boost.',                                                  11),
  ('Máy lọc nước RO',              'Karofi',    'Máy lọc nước Karofi 9-10 cấp lọc, lõi RO Filmtec, có nóng-lạnh.',                                                         12);

-- Mã lỗi mẫu — soạn theo mã lỗi thật được ghi trong tài liệu của hãng

-- ============ MÁY GIẶT SAMSUNG (id=1) ============
INSERT INTO ma_loi (ma_loi, ten_loi, thiet_bi_id, mo_ta, nguyen_nhan, cach_khac_phuc, muc_do) VALUES
  ('4E', 'Lỗi cấp nước',                   1,
   'Máy giặt Samsung không cấp được nước vào lồng giặt sau khi bấm nút Start. Đèn báo nhấp nháy, máy không hoạt động.',
   E'- Vòi nước cấp đang khoá hoặc áp lực nước yếu.\n- Lưới lọc đầu ống cấp nước bị tắc do cặn, rỉ sét.\n- Van cấp nước (water inlet valve) bị hỏng.\n- Ống cấp nước bị gập, nứt.',
   E'1. Kiểm tra vòi nước có mở chưa, áp lực nước có đủ không.\n2. Tháo ống cấp nước, vệ sinh lưới lọc bằng bàn chải mềm.\n3. Kiểm tra ống cấp có bị gập không, thay ống nếu cần.\n4. Nếu vẫn không cấp được nước, gọi kỹ thuật để thay van cấp.',
   'NHE'),

  ('5E', 'Lỗi xả nước',                    1,
   'Máy giặt không xả được nước sau chu trình giặt. Lồng giặt còn nước, không vắt được.',
   E'- Bộ lọc bơm xả (drain filter) bị kẹt tóc, sợi vải, đồng xu.\n- Ống xả nước bị tắc, gập hoặc đặt cao quá 1m.\n- Bơm xả nước bị hỏng motor.',
   E'1. Tắt máy, rút điện. Mở nắp che bộ lọc xả ở góc dưới phải.\n2. Đặt khay hứng nước, vặn bộ lọc ngược chiều kim đồng hồ để tháo.\n3. Vệ sinh sạch bộ lọc, rửa với nước.\n4. Kiểm tra ống xả không bị gập, đầu ống không cao quá 1m.\n5. Nếu vẫn lỗi, gọi thợ thay bơm xả.',
   'TRUNG_BINH'),

  ('UE', 'Lỗi mất cân bằng lồng giặt',     1,
   'Máy giặt rung lắc mạnh khi vắt, kêu to, không vắt khô được. Đèn báo UE/UB nhấp nháy.',
   E'- Quần áo dồn cục về một phía của lồng giặt.\n- Giặt quá ít đồ (1-2 món) hoặc quá nhiều vượt tải trọng.\n- Máy đặt không cân bằng trên sàn.\n- Có vật nặng giặt cùng (giày, chăn dày).',
   E'1. Mở nắp, sắp xếp lại quần áo cho đều quanh lồng giặt.\n2. Thêm hoặc bớt đồ để khối lượng vừa phải (3-4kg cho máy 8kg).\n3. Kiểm tra máy có đặt cân không (dùng thước thuỷ).\n4. Điều chỉnh chân máy để máy đứng vững, không bị nghiêng.',
   'NHE'),

  ('DC', 'Lỗi cửa máy giặt',                1,
   'Máy giặt báo lỗi DC, không khởi động được do cửa máy không đóng kín.',
   E'- Cửa máy giặt chưa đóng chặt.\n- Quần áo bị kẹt ở mép cửa.\n- Khoá điện cửa (door lock) bị hỏng.\n- Cảm biến cửa bị lỗi.',
   E'1. Mở cửa, kiểm tra không có quần áo kẹt ở mép.\n2. Đóng cửa thật chặt cho đến khi nghe tiếng "click".\n3. Nếu vẫn báo lỗi, gọi thợ kiểm tra khoá điện cửa.',
   'NHE'),

  ('HE', 'Lỗi gia nhiệt nước',             1,
   'Máy không gia nhiệt được nước cho chu trình giặt nóng. Nước vẫn lạnh dù đã chọn nhiệt độ.',
   E'- Thanh đốt (heater) bị cháy, đứt dây.\n- Cảm biến nhiệt (NTC) bị hỏng.\n- Cặn vôi bám dày trên thanh đốt làm giảm hiệu quả.',
   E'1. Lỗi này cần kỹ thuật viên xử lý — không tự sửa.\n2. Liên hệ trung tâm bảo hành Samsung để thay thanh đốt.\n3. Sau sửa, dùng nước mềm hoặc nước có chất khử cặn định kỳ.',
   'NGHIEM_TRONG');

-- ============ MÁY GIẶT LG (id=2) ============
INSERT INTO ma_loi (ma_loi, ten_loi, thiet_bi_id, mo_ta, nguyen_nhan, cach_khac_phuc, muc_do) VALUES
  ('IE', 'Lỗi cấp nước',                   2,
   'Máy giặt LG không cấp được nước, không bắt đầu được chu trình.',
   E'- Vòi cấp nước đóng hoặc nước yếu.\n- Lưới lọc cấp nước bị tắc.\n- Van cấp bị hỏng.',
   E'1. Mở vòi cấp nước, kiểm tra áp lực.\n2. Vệ sinh lưới lọc đầu ống cấp.\n3. Nếu vẫn lỗi, liên hệ kỹ thuật LG (1800-1503).',
   'NHE'),

  ('OE', 'Lỗi xả nước',                    2,
   'Máy LG không xả được nước, lồng giặt còn nước.',
   E'- Bộ lọc xả tắc.\n- Ống xả gập hoặc tắc.\n- Bơm xả hỏng.',
   E'1. Tháo bộ lọc xả ở góc dưới, vệ sinh sạch.\n2. Kiểm tra ống xả có thông không.\n3. Liên hệ kỹ thuật nếu bơm xả hỏng.',
   'TRUNG_BINH'),

  ('UE', 'Mất cân bằng',                   2,
   'Lồng giặt rung mạnh khi vắt, không vắt khô được.',
   E'- Đồ giặt dồn cục.\n- Tải trọng không hợp lý.',
   E'1. Sắp xếp lại đồ giặt cho đều.\n2. Thêm/bớt đồ cho hợp tải trọng.',
   'NHE'),

  ('TE', 'Lỗi cảm biến nhiệt',             2,
   'Lỗi cảm biến nhiệt độ NTC.',
   E'- Cảm biến NTC hỏng hoặc đứt dây.\n- Bo mạch điều khiển lỗi.',
   E'Liên hệ kỹ thuật LG để kiểm tra cảm biến và bo mạch.',
   'NGHIEM_TRONG');

-- ============ TỦ LẠNH LG (id=3) ============
INSERT INTO ma_loi (ma_loi, ten_loi, thiet_bi_id, mo_ta, nguyen_nhan, cach_khac_phuc, muc_do) VALUES
  ('Er IF', 'Lỗi quạt ngăn đá',            3,
   'Tủ lạnh LG báo lỗi Er IF — quạt dàn lạnh ngăn đá không hoạt động, ngăn đá không đủ lạnh.',
   E'- Quạt dàn lạnh bị kẹt do tuyết bám.\n- Motor quạt bị cháy.\n- Dây cấp điện cho quạt bị đứt.',
   E'1. Rút điện tủ, để xả tuyết tự nhiên 6-12 tiếng.\n2. Vệ sinh khu vực quạt sạch, không còn đá.\n3. Cắm điện lại, theo dõi 24h.\n4. Nếu vẫn lỗi, gọi kỹ thuật thay motor quạt.',
   'TRUNG_BINH'),

  ('Er FF', 'Lỗi quạt ngăn mát',           3,
   'Quạt ngăn mát hoạt động bất thường, ngăn mát không lạnh đều.',
   E'- Motor quạt ngăn mát hỏng.\n- Dây cảm biến lỏng.',
   E'Cần kỹ thuật thay motor quạt và kiểm tra dây cảm biến.',
   'TRUNG_BINH'),

  ('Er rS', 'Lỗi cảm biến nhiệt',          3,
   'Cảm biến nhiệt độ trong tủ bị hỏng — tủ làm lạnh sai nhiệt độ cài đặt.',
   E'- Cảm biến NTC hở mạch hoặc đứt dây.\n- Đầu cắm cảm biến trên bo mạch lỏng.',
   E'Lỗi cần kỹ thuật xử lý — thay cảm biến mới.',
   'NGHIEM_TRONG'),

  ('Er dH', 'Lỗi xả đá tự động',           3,
   'Hệ thống xả đá (defrost) không hoạt động, ngăn đá đóng tuyết dày.',
   E'- Thanh đốt xả đá bị cháy.\n- Cầu chì nhiệt (thermal fuse) đứt.\n- Bo mạch điều khiển lỗi.',
   E'Cần kỹ thuật thay thanh đốt xả đá hoặc cầu chì nhiệt.',
   'NGHIEM_TRONG');

-- ============ TỦ LẠNH HITACHI (id=4) ============
INSERT INTO ma_loi (ma_loi, ten_loi, thiet_bi_id, mo_ta, nguyen_nhan, cach_khac_phuc, muc_do) VALUES
  ('F0-08', 'Lỗi cảm biến nhiệt ngăn đá',  4,
   'Tủ Hitachi báo F0-08 — cảm biến nhiệt độ ngăn đá hoạt động sai.',
   E'- Cảm biến nhiệt ngăn đá bị hỏng.\n- Dây kết nối từ cảm biến đến bo mạch bị đứt.',
   E'Cần kỹ thuật mở vỏ tủ để kiểm tra và thay cảm biến.',
   'NGHIEM_TRONG'),

  ('F0-22', 'Lỗi quạt dàn lạnh',           4,
   'Quạt dàn lạnh không quay, tủ không làm lạnh đều.',
   E'- Motor quạt cháy.\n- Quạt bị kẹt do đá đóng.',
   E'1. Rút điện 12 tiếng để tự xả đá.\n2. Cắm điện lại — nếu vẫn lỗi gọi kỹ thuật.',
   'TRUNG_BINH'),

  ('F0-04', 'Lỗi máy nén',                 4,
   'Máy nén (compressor) không khởi động được — tủ hoàn toàn không lạnh.',
   E'- Máy nén bị hỏng (cuộn dây cháy, kẹt cơ).\n- Tụ khởi động hỏng.\n- Rơ-le bảo vệ ngắt.',
   E'Lỗi nghiêm trọng — cần kỹ thuật viên có chứng chỉ điện lạnh thay máy nén.',
   'NGHIEM_TRONG');

-- ============ ĐIỀU HOÀ DAIKIN (id=5) ============
INSERT INTO ma_loi (ma_loi, ten_loi, thiet_bi_id, mo_ta, nguyen_nhan, cach_khac_phuc, muc_do) VALUES
  ('U4', 'Lỗi truyền tín hiệu dàn nóng-lạnh', 5,
   'Điều hoà Daikin báo U4 — mất kết nối tín hiệu giữa dàn nóng và dàn lạnh, máy không chạy.',
   E'- Dây tín hiệu giữa 2 dàn bị đứt, lỏng đầu cos.\n- Bo mạch dàn nóng hoặc dàn lạnh hỏng.\n- Có vật thể che chắn ăng-ten Wi-Fi (nếu là model có WiFi).',
   E'1. Tắt CB tổng, kiểm tra dây tín hiệu giữa dàn nóng và dàn lạnh.\n2. Siết lại các đầu cos, kiểm tra dây có bị chuột cắn không.\n3. Bật lại nguồn — chờ 3 phút.\n4. Nếu vẫn báo U4, gọi kỹ thuật Daikin (1800-585854).',
   'NGHIEM_TRONG'),

  ('A5', 'Lỗi cảm biến giàn lạnh',         5,
   'Cảm biến nhiệt độ giàn lạnh báo lỗi — máy hoạt động không ổn định.',
   E'- Cảm biến nhiệt giàn lạnh hỏng.\n- Dây cảm biến bị đứt hoặc chạm.',
   E'Liên hệ kỹ thuật Daikin để thay cảm biến.',
   'TRUNG_BINH'),

  ('E7', 'Lỗi quạt dàn nóng',              5,
   'Quạt dàn nóng không quay hoặc quay yếu, dàn nóng quá nhiệt, máy tự ngắt.',
   E'- Motor quạt dàn nóng cháy.\n- Tụ điện quạt yếu.\n- Cánh quạt bị kẹt vì lá cây, bụi.',
   E'1. Tắt máy, kiểm tra quạt dàn nóng có bị kẹt không.\n2. Vệ sinh dàn nóng, dùng vòi nước xịt nhẹ (đã ngắt điện).\n3. Nếu motor quạt cháy → gọi kỹ thuật thay.',
   'NGHIEM_TRONG'),

  ('AH', 'Báo cần vệ sinh lọc gió',        5,
   'Máy nhắc cần vệ sinh lưới lọc gió định kỳ — đèn báo AH sáng.',
   E'- Lưới lọc bụi đầy sau ~250 giờ sử dụng.',
   E'1. Mở nắp dàn lạnh, tháo 2 lưới lọc bụi.\n2. Rửa lưới lọc với nước sạch, để khô.\n3. Lắp lại, ấn nút Reset hoặc tắt-bật lại để xoá báo.',
   'NHE');

-- ============ ĐIỀU HOÀ PANASONIC (id=6) ============
INSERT INTO ma_loi (ma_loi, ten_loi, thiet_bi_id, mo_ta, nguyen_nhan, cach_khac_phuc, muc_do) VALUES
  ('H11', 'Lỗi truyền tín hiệu',           6,
   'Mất kết nối tín hiệu giữa dàn nóng và dàn lạnh.',
   E'- Dây tín hiệu lỏng hoặc đứt.\n- Bo mạch dàn nóng/dàn lạnh hỏng.',
   E'Gọi kỹ thuật Panasonic kiểm tra dây và bo mạch.',
   'NGHIEM_TRONG'),

  ('H14', 'Lỗi cảm biến nhiệt giàn lạnh',  6,
   'Cảm biến nhiệt độ giàn lạnh hỏng.',
   E'- Cảm biến nhiệt NTC giàn lạnh hỏng hoặc lỏng.',
   E'Cần kỹ thuật mở vỏ máy để kiểm tra và thay cảm biến.',
   'TRUNG_BINH'),

  ('F91', 'Áp suất gas thấp',              6,
   'Máy báo F91 — thiếu gas hoặc rò rỉ gas, máy không lạnh.',
   E'- Hệ thống gas bị rò rỉ.\n- Lượng gas nạp không đủ.',
   E'1. Gọi kỹ thuật kiểm tra điểm rò gas.\n2. Hàn lại các mối nối, nạp lại gas.\n3. Không tự ý nạp gas — yêu cầu chứng chỉ.',
   'NGHIEM_TRONG');

-- ============ TIVI SONY (id=7) ============
INSERT INTO ma_loi (ma_loi, ten_loi, thiet_bi_id, mo_ta, nguyen_nhan, cach_khac_phuc, muc_do) VALUES
  ('2 lần nháy', 'Lỗi backlight (đèn nền)', 7,
   'Tivi Sony Bravia có tiếng nhưng không lên hình, đèn standby nháy 2 lần liên tục.',
   E'- Mạch điều khiển đèn nền (LED driver) bị hỏng.\n- Một số dải LED bị cháy.\n- Nguồn cấp đèn nền không ổn định.',
   E'Cần kỹ thuật chuyên TV LED — thay LED driver hoặc dải LED. Không tự sửa vì điện áp cao.',
   'NGHIEM_TRONG'),

  ('6 lần nháy', 'Lỗi nguồn',              7,
   'Tivi Sony không khởi động được, đèn standby nháy 6 lần.',
   E'- Bo mạch nguồn hỏng tụ phồng.\n- Cầu chì nguồn đứt.',
   E'Cần kỹ thuật thay tụ hoặc cầu chì trên bo nguồn.',
   'NGHIEM_TRONG'),

  ('Không lên Wi-Fi', 'Mất kết nối Wi-Fi', 7,
   'Tivi không kết nối được với Wi-Fi nhà, không vào được Google TV / YouTube.',
   E'- Router Wi-Fi cách xa hoặc tín hiệu yếu.\n- Mật khẩu Wi-Fi đã đổi nhưng tivi vẫn lưu cũ.\n- Lỗi firmware tạm thời.',
   E'1. Vào Settings → Network → Network Setup → quên mạng cũ và kết nối lại.\n2. Khởi động lại router và tivi.\n3. Nếu vẫn không được, reset network từ menu Settings.',
   'NHE');

-- ============ TIVI SAMSUNG (id=8) ============
INSERT INTO ma_loi (ma_loi, ten_loi, thiet_bi_id, mo_ta, nguyen_nhan, cach_khac_phuc, muc_do) VALUES
  ('No Signal', 'Không nhận tín hiệu',     8,
   'Tivi Samsung báo "No Signal" hoặc "Không có tín hiệu", màn hình đen/xanh.',
   E'- Cáp HDMI/AV chưa cắm chặt hoặc hỏng.\n- Đầu phát (set-top-box, đầu đĩa) chưa bật.\n- Chọn sai nguồn vào (Source).',
   E'1. Bấm nút Source trên remote, chọn đúng cổng đang cắm thiết bị.\n2. Kiểm tra dây cáp HDMI cắm chặt 2 đầu.\n3. Khởi động lại đầu phát và tivi.',
   'NHE'),

  ('Tự khởi động lại', 'Tivi tự reset',     8,
   'Tivi Samsung tự động tắt và khởi động lại nhiều lần, không sử dụng được.',
   E'- Lỗi firmware sau cập nhật.\n- Bo nguồn quá nhiệt.\n- Tụ nguồn bị phồng.',
   E'1. Rút điện tivi 30 phút, cắm lại.\n2. Vào Settings → Support → Self Diagnosis → Reset.\n3. Nếu vẫn lỗi, liên hệ Samsung Care (1800-588-889).',
   'TRUNG_BINH');

-- ============ LÒ VI SÓNG PANASONIC (id=9) ============
INSERT INTO ma_loi (ma_loi, ten_loi, thiet_bi_id, mo_ta, nguyen_nhan, cach_khac_phuc, muc_do) VALUES
  ('H97', 'Lỗi đèn báo magnetron',         9,
   'Lò không phát sóng được, hâm nóng không nóng dù đèn vẫn sáng.',
   E'- Magnetron (bóng phát vi sóng) hỏng.\n- Tụ cao áp hỏng.\n- Diode cao áp đứt.',
   E'Lỗi nghiêm trọng — có điện áp cao 4000V. CHỈ kỹ thuật chuyên môn được sửa.',
   'NGHIEM_TRONG'),

  ('Không nóng', 'Cửa lò không đóng kín',  9,
   'Lò chạy nhưng thức ăn không nóng, hoặc lò không khởi động được.',
   E'- Công tắc cửa (door switch) hỏng.\n- Bản lề cửa bị lệch.',
   E'1. Mở cửa, đóng lại thật chặt.\n2. Kiểm tra bản lề có bị cong không.\n3. Nếu vẫn lỗi, gọi kỹ thuật thay công tắc cửa.',
   'TRUNG_BINH');

-- ============ BÌNH NÓNG LẠNH ARISTON (id=10) ============
INSERT INTO ma_loi (ma_loi, ten_loi, thiet_bi_id, mo_ta, nguyen_nhan, cach_khac_phuc, muc_do) VALUES
  ('E1', 'Lỗi quá nhiệt',                  10,
   'Bình nóng lạnh tự ngắt do nước trong bình quá nóng vượt mức an toàn.',
   E'- Cảm biến nhiệt độ hỏng, không ngắt được khi đủ nhiệt.\n- Rơ-le nhiệt hỏng.\n- Cặn bám dày trên thanh đốt.',
   E'1. Tắt CB bình, đợi nước nguội (~2 giờ).\n2. Mở van xả an toàn, xả bớt nước.\n3. Liên hệ kỹ thuật Ariston để thay cảm biến.',
   'NGHIEM_TRONG'),

  ('E3', 'Lỗi cảm biến nhiệt',             10,
   'Cảm biến nhiệt độ NTC bị hỏng hoặc mất tín hiệu.',
   E'- Đầu cảm biến NTC bị đứt dây.\n- Bo mạch không nhận được tín hiệu cảm biến.',
   E'Gọi kỹ thuật Ariston để kiểm tra và thay cảm biến.',
   'TRUNG_BINH'),

  ('Tia điện', 'Đèn ELCB nhảy',            10,
   'Đèn báo chống giật ELCB nhảy ngay khi bật bình.',
   E'- Thanh đốt bị rò điện ra nước.\n- Vỏ bình bị thủng do han gỉ.\n- ELCB bị nhạy quá mức.',
   E'1. NGỪNG SỬ DỤNG ngay — nguy hiểm điện giật.\n2. Khoá CB tổng cấp cho bình.\n3. Gọi kỹ thuật kiểm tra cách điện thanh đốt.',
   'NGHIEM_TRONG');

-- ============ BẾP TỪ BOSCH (id=11) ============
INSERT INTO ma_loi (ma_loi, ten_loi, thiet_bi_id, mo_ta, nguyen_nhan, cach_khac_phuc, muc_do) VALUES
  ('E1', 'Quá nhiệt',                      11,
   'Vùng nấu quá nóng, bếp tự ngắt để bảo vệ.',
   E'- Đáy nồi quá mỏng hoặc nồi bị cong vênh.\n- Quạt làm mát dưới bếp bị bụi.\n- Sử dụng công suất tối đa quá lâu.',
   E'1. Đợi bếp nguội (10-15 phút).\n2. Đổi sang nồi đáy phẳng, từ tính tốt.\n3. Vệ sinh khe gió dưới bếp định kỳ.',
   'TRUNG_BINH'),

  ('E2', 'Không nhận nồi',                 11,
   'Bếp không nhận diện nồi, không phát nhiệt dù đã đặt nồi lên.',
   E'- Nồi không phải vật liệu nhiễm từ (inox 304, nhôm, đồng).\n- Đường kính đáy nồi nhỏ hơn 12cm.\n- Nồi đặt lệch tâm vùng nấu.',
   E'1. Kiểm tra nồi: dùng nam châm thử — hút được mới dùng được trên bếp từ.\n2. Đổi sang nồi inox 430 hoặc gang.\n3. Đặt nồi đúng tâm vùng nấu.',
   'NHE'),

  ('E5', 'Lỗi nguồn điện',                 11,
   'Bếp báo lỗi điện áp — nguồn điện không ổn định.',
   E'- Điện áp lưới quá thấp (<180V) hoặc quá cao (>240V).\n- Dây điện tiết diện không đủ.',
   E'1. Lắp ổn áp cho bếp.\n2. Kiểm tra dây điện cấp riêng cho bếp (CB ≥32A).\n3. Gọi điện lực nếu điện chập chờn cả nhà.',
   'TRUNG_BINH');

-- ============ MÁY LỌC NƯỚC KAROFI (id=12) ============
INSERT INTO ma_loi (ma_loi, ten_loi, thiet_bi_id, mo_ta, nguyen_nhan, cach_khac_phuc, muc_do) VALUES
  ('Không ra nước', 'Máy bơm không hoạt động', 12,
   'Mở vòi nhưng không có nước ra, hoặc nước chảy rất yếu.',
   E'- Lõi lọc bẩn, tắc dòng (đặc biệt lõi 1, 2, 3).\n- Máy bơm áp lực hỏng.\n- Van nguồn nước cấp đóng.\n- Bình chứa áp lực bị xì.',
   E'1. Kiểm tra van cấp nước nguồn — mở hết.\n2. Thay lõi lọc theo định kỳ (lõi 1-3: 6 tháng).\n3. Nghe máy bơm có chạy không — nếu không, gọi kỹ thuật.',
   'TRUNG_BINH'),

  ('Nước có mùi', 'Lõi lọc cần thay',       12,
   'Nước lọc ra có mùi clo, mùi nhựa hoặc vị lạ.',
   E'- Lõi than hoạt tính (lõi 4-5) đã hết tác dụng.\n- Bình chứa lâu không vệ sinh.\n- Đường ống bị cặn.',
   E'1. Thay lõi than hoạt tính (định kỳ 9-12 tháng).\n2. Vệ sinh bình chứa nước.\n3. Liên hệ Karofi (1900-6418) để bảo trì.',
   'NHE'),

  ('Rò rỉ nước', 'Mối nối lỏng',           12,
   'Có nước rò rỉ ở khu vực gầm máy hoặc các mối nối lõi lọc.',
   E'- Mối nối lõi lọc lỏng hoặc gioăng bị mòn.\n- Cốc lõi lọc nứt.\n- Ống nối bị nứt do va chạm.',
   E'1. Khoá van cấp nước nguồn ngay.\n2. Kiểm tra các mối nối, siết lại nếu lỏng.\n3. Gọi kỹ thuật thay cốc lõi nếu nứt.',
   'TRUNG_BINH');

-- ============ ẢNH THIẾT BỊ (Unsplash) ============
UPDATE thiet_bi SET hinh_anh = 'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=800&q=80' WHERE id = 1;
UPDATE thiet_bi SET hinh_anh = 'https://images.unsplash.com/photo-1610465299996-30f240ac2b1c?w=800&q=80' WHERE id = 2;
UPDATE thiet_bi SET hinh_anh = 'https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=800&q=80' WHERE id = 3;
UPDATE thiet_bi SET hinh_anh = 'https://images.unsplash.com/photo-1601944179066-29786cb9d32a?w=800&q=80' WHERE id = 4;
UPDATE thiet_bi SET hinh_anh = 'https://images.unsplash.com/photo-1585503418537-88331351ad99?w=800&q=80' WHERE id = 5;
UPDATE thiet_bi SET hinh_anh = 'https://images.unsplash.com/photo-1620626011761-996317b8d101?w=800&q=80' WHERE id = 6;
UPDATE thiet_bi SET hinh_anh = 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=800&q=80' WHERE id = 7;
UPDATE thiet_bi SET hinh_anh = 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=800&q=80' WHERE id = 8;
UPDATE thiet_bi SET hinh_anh = 'https://images.unsplash.com/photo-1567016432779-094069958ea5?w=800&q=80' WHERE id = 9;
UPDATE thiet_bi SET hinh_anh = 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=800&q=80' WHERE id = 10;
UPDATE thiet_bi SET hinh_anh = 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800&q=80'   WHERE id = 11;
UPDATE thiet_bi SET hinh_anh = 'https://images.unsplash.com/photo-1589923188900-85dae523342b?w=800&q=80' WHERE id = 12;

-- ============ ẢNH MÃ LỖI ============
-- Mỗi mã lỗi 2 ảnh: (1) ảnh thiết bị (Unsplash), (2) ảnh placeholder mã lỗi (màu theo mức độ)
INSERT INTO ma_loi_anh (ma_loi_id, url, thu_tu)
SELECT m.id, t.hinh_anh, 0
FROM ma_loi m
JOIN thiet_bi t ON t.id = m.thiet_bi_id
WHERE t.hinh_anh IS NOT NULL;

INSERT INTO ma_loi_anh (ma_loi_id, url, thu_tu)
SELECT
    m.id,
    'https://placehold.co/800x600/' ||
        CASE m.muc_do
            WHEN 'NHE'          THEN '10b981/ffffff'
            WHEN 'TRUNG_BINH'   THEN 'f59e0b/ffffff'
            WHEN 'NGHIEM_TRONG' THEN 'e11d48/ffffff'
        END
        || '?text=' || REPLACE(REPLACE(m.ma_loi, ' ', '+'), '/', '%2F')
        || '&font=roboto',
    1
FROM ma_loi m;

-- Đánh dấu các mã lỗi phổ biến với lượt xem cao để hiển thị "tra nhiều nhất" trên homepage
UPDATE ma_loi SET luot_xem = 1247 WHERE ma_loi = 'UE'   AND thiet_bi_id = 1;
UPDATE ma_loi SET luot_xem =  892 WHERE ma_loi = 'U4'   AND thiet_bi_id = 5;
UPDATE ma_loi SET luot_xem =  743 WHERE ma_loi = '4E'   AND thiet_bi_id = 1;
UPDATE ma_loi SET luot_xem =  621 WHERE ma_loi = 'OE'   AND thiet_bi_id = 2;
UPDATE ma_loi SET luot_xem =  584 WHERE ma_loi = 'AH'   AND thiet_bi_id = 5;
UPDATE ma_loi SET luot_xem =  512 WHERE ma_loi = 'Er IF' AND thiet_bi_id = 3;
UPDATE ma_loi SET luot_xem =  478 WHERE ma_loi = 'No Signal' AND thiet_bi_id = 8;
UPDATE ma_loi SET luot_xem =  401 WHERE ma_loi = '5E'   AND thiet_bi_id = 1;
