#!/usr/bin/env bash
#
# Trigger thủ công job dọn file orphan trong /uploads/.
# Cùng logic với cron 3h sáng — tiện chạy on-demand khi cần.
#
# Usage:
#   ./scripts/cleanup-uploads.sh                                   # dùng env mặc định
#   API_URL=http://localhost:8080 ./scripts/cleanup-uploads.sh
#   ADMIN_EMAIL=admin@mypham.local ADMIN_PW=admin12345 ./scripts/cleanup-uploads.sh
#
set -euo pipefail

API_URL="${API_URL:-http://localhost:8080}"
ADMIN_EMAIL="${ADMIN_EMAIL:-admin@mypham.local}"
ADMIN_PW="${ADMIN_PW:-admin12345}"

# Màu cho terminal
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
BOLD='\033[1m'
RESET='\033[0m'

echo -e "${BOLD}🧹 Cleanup orphan uploads${RESET}"
echo "   API: $API_URL"
echo "   Admin: $ADMIN_EMAIL"
echo ""

# 1. Login lấy token
echo -e "${BLUE}→ Đang đăng nhập admin...${RESET}"
LOGIN_RES=$(curl -s -X POST "$API_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$ADMIN_EMAIL\",\"matKhau\":\"$ADMIN_PW\"}")

TOKEN=$(echo "$LOGIN_RES" | python3 -c "
import sys, json
try:
    d = json.load(sys.stdin)
    print(d.get('data', {}).get('token', ''))
except Exception:
    print('')
")

if [ -z "$TOKEN" ]; then
  echo -e "${RED}✗ Đăng nhập thất bại:${RESET}"
  echo "$LOGIN_RES" | python3 -m json.tool 2>/dev/null || echo "$LOGIN_RES"
  exit 1
fi
echo -e "${GREEN}✓ OK${RESET}"
echo ""

# 2. Trigger cleanup
echo -e "${BLUE}→ Trigger cleanup...${RESET}"
RES=$(curl -s -X POST "$API_URL/api/admin/uploads/cleanup" \
  -H "Authorization: Bearer $TOKEN")

# 3. Pretty print kết quả
RES="$RES" python3 <<'PY'
import os, json, sys
raw = os.environ.get("RES", "")
try:
    d = json.loads(raw)
except Exception as e:
    print(f"  ✗ Response không phải JSON: {e}")
    print(f"  raw: {raw[:200]}")
    sys.exit(1)

if d.get("code") != 200:
    print(f"  ✗ HTTP {d.get('code')}: {d.get('message')}")
    sys.exit(1)

data = d.get("data", {})
scanned       = data.get("scanned", 0)
referenced    = data.get("referenced", 0)
orphan        = data.get("orphan", 0)
skipped_young = data.get("skippedYoung", 0)
deleted       = data.get("deleted", 0)
deleted_files = data.get("deletedFiles", []) or []

GREEN  = "\033[0;32m"
YELLOW = "\033[0;33m"
RED    = "\033[0;31m"
BLUE   = "\033[0;34m"
BOLD   = "\033[1m"
RESET  = "\033[0m"

print(f"{GREEN}✓ {d.get('message')}{RESET}")
print()
print(f"  {BOLD}📊 Kết quả{RESET}")
print(f"     Quét trong /uploads/  : {BOLD}{scanned}{RESET} file")
print(f"     Đang dùng (DB)        : {GREEN}{referenced}{RESET} URL")
print(f"     Phát hiện orphan      : {YELLOW}{orphan}{RESET} file")
print(f"     Skip (< 24h tuổi)     : {BLUE}{skipped_young}{RESET} file")
print(f"     Đã xoá                : {RED if deleted else GREEN}{deleted}{RESET} file")

if deleted_files:
    print()
    print(f"  {BOLD}🗑  File đã xoá:{RESET}")
    for f in deleted_files[:20]:
        print(f"     - {f}")
    if len(deleted_files) > 20:
        print(f"     ... và {len(deleted_files) - 20} file khác")
PY
