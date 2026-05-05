#!/usr/bin/env bash
set -euo pipefail

DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-mypham}"
DB_USER="${DB_USER:-mypham}"
DB_PASSWORD="${DB_PASSWORD:-mypham123}"

PSQL=""
for cand in \
    "$(command -v psql 2>/dev/null || true)" \
    "/Library/PostgreSQL/16/bin/psql" \
    "/Applications/Postgres.app/Contents/Versions/16/bin/psql" \
    "/usr/lib/postgresql/16/bin/psql" \
    "/c/Program Files/PostgreSQL/16/bin/psql"
do
    if [ -n "$cand" ] && [ -x "$cand" ]; then PSQL="$cand"; break; fi
done
if [ -z "$PSQL" ]; then
    echo "❌ Không tìm thấy psql. Cài Postgres hoặc thêm psql vào PATH." >&2
    exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
UPLOADS_DIR="$SCRIPT_DIR/../backend/uploads"
if [ ! -d "$UPLOADS_DIR" ]; then
    echo "❌ Không thấy folder $UPLOADS_DIR" >&2
    exit 1
fi

IMAGES=()
while IFS= read -r line; do
    IMAGES+=("$line")
done < <(
    find "$UPLOADS_DIR" -maxdepth 1 -type f \
        \( -iname "*.jpg" -o -iname "*.jpeg" -o -iname "*.png" -o -iname "*.webp" \) \
        -print | sort
)
if [ "${#IMAGES[@]}" -eq 0 ]; then
    echo "❌ Folder uploads rỗng — copy ảnh vào $UPLOADS_DIR rồi chạy lại." >&2
    exit 1
fi
echo "→ Tìm thấy ${#IMAGES[@]} file ảnh trong uploads/"

export PGPASSWORD="$DB_PASSWORD"
PSQL_ARGS=(-h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -A)

PRODUCT_IDS=()
while IFS= read -r line; do
    [ -n "$line" ] && PRODUCT_IDS+=("$line")
done < <(
    "$PSQL" "${PSQL_ARGS[@]}" \
        -c "SELECT id FROM san_pham WHERE trang_thai='ACTIVE' ORDER BY id;"
)
if [ "${#PRODUCT_IDS[@]}" -eq 0 ]; then
    echo "❌ Không có sp ACTIVE — chạy migration database/my-pham.sql trước." >&2
    exit 1
fi
echo "→ Có ${#PRODUCT_IDS[@]} sp ACTIVE: ${PRODUCT_IDS[*]}"

echo "→ Xoá san_pham_anh cũ..."
PRODUCT_IDS_CSV=$(IFS=,; echo "${PRODUCT_IDS[*]}")
"$PSQL" "${PSQL_ARGS[@]}" \
    -c "DELETE FROM san_pham_anh WHERE san_pham_id IN ($PRODUCT_IDS_CSV);" >/dev/null

echo "→ Insert ảnh mới..."
i=0
for pid in "${PRODUCT_IDS[@]}"; do
    img="${IMAGES[$((i % ${#IMAGES[@]}))]}"
    fname=$(basename "$img")
    url="/uploads/$fname"
    "$PSQL" "${PSQL_ARGS[@]}" \
        -c "INSERT INTO san_pham_anh (san_pham_id, url, thu_tu) VALUES ($pid, '$url', 0);" >/dev/null
    echo "  sp #$pid ← $fname"
    i=$((i + 1))
done

echo "✅ Đã seed ${#PRODUCT_IDS[@]} sp với ảnh từ uploads/"
