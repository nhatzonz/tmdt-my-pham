-- ======================================================================
-- Bổ sung ảnh thật cho thiết bị và mã lỗi
-- - Ảnh thiết bị: Unsplash (URL ảnh thật)
-- - Ảnh mã lỗi: 1 ảnh thiết bị (Unsplash) + 1 ảnh placeholder mã lỗi (placehold.co)
-- ======================================================================

-- ============ ẢNH THIẾT BỊ ============
UPDATE thiet_bi SET hinh_anh = 'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=800&q=80' WHERE id = 1;  -- Máy giặt cửa trước Samsung
UPDATE thiet_bi SET hinh_anh = 'https://images.unsplash.com/photo-1610465299996-30f240ac2b1c?w=800&q=80' WHERE id = 2;  -- Máy giặt cửa trên LG
UPDATE thiet_bi SET hinh_anh = 'https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=800&q=80' WHERE id = 3;  -- Tủ lạnh LG SBS
UPDATE thiet_bi SET hinh_anh = 'https://images.unsplash.com/photo-1601944179066-29786cb9d32a?w=800&q=80' WHERE id = 4;  -- Tủ lạnh Hitachi
UPDATE thiet_bi SET hinh_anh = 'https://images.unsplash.com/photo-1585503418537-88331351ad99?w=800&q=80' WHERE id = 5;  -- Điều hoà Daikin
UPDATE thiet_bi SET hinh_anh = 'https://images.unsplash.com/photo-1620626011761-996317b8d101?w=800&q=80' WHERE id = 6;  -- Điều hoà Panasonic
UPDATE thiet_bi SET hinh_anh = 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=800&q=80' WHERE id = 7;  -- Smart TV Sony
UPDATE thiet_bi SET hinh_anh = 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=800&q=80' WHERE id = 8;  -- Smart TV Samsung QLED
UPDATE thiet_bi SET hinh_anh = 'https://images.unsplash.com/photo-1567016432779-094069958ea5?w=800&q=80' WHERE id = 9;  -- Lò vi sóng Panasonic
UPDATE thiet_bi SET hinh_anh = 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=800&q=80' WHERE id = 10; -- Bình nóng lạnh Ariston
UPDATE thiet_bi SET hinh_anh = 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800&q=80'   WHERE id = 11; -- Bếp từ Bosch
UPDATE thiet_bi SET hinh_anh = 'https://images.unsplash.com/photo-1589923188900-85dae523342b?w=800&q=80' WHERE id = 12; -- Máy lọc nước Karofi


-- ============ ẢNH MÃ LỖI ============
-- Reset trước (nếu có dữ liệu cũ)
DELETE FROM ma_loi_anh;

-- Helper insert: 2 ảnh / mã lỗi
-- Image 1: ảnh thiết bị (Unsplash) tương ứng
-- Image 2: ảnh placeholder mã lỗi (placehold.co)

-- Hàm tạo URL placehold theo mã lỗi (mỗi muc_do có màu khác)
INSERT INTO ma_loi_anh (ma_loi_id, url, thu_tu)
SELECT
    m.id,
    t.hinh_anh,
    0
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

SELECT
    (SELECT COUNT(*) FROM thiet_bi WHERE hinh_anh IS NOT NULL) AS thiet_bi_co_anh,
    (SELECT COUNT(*) FROM ma_loi_anh) AS tong_anh_ma_loi,
    (SELECT COUNT(DISTINCT ma_loi_id) FROM ma_loi_anh) AS so_ma_loi_co_anh;
