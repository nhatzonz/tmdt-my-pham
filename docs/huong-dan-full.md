# HƯỚNG DẪN CÀI ĐẶT & CHẠY DỰ ÁN TRÊN WINDOWS — TỪ A-Z

Hướng dẫn này dành cho **người mới hoàn toàn**, vừa mở máy Windows và chưa biết gì về Java, Python, Node, hay cơ sở dữ liệu. Đọc tuần tự từ trên xuống, 
**làm chính xác từng bước**, không skip. Mỗi mục có hình ảnh mô tả những gì bạn sẽ
thấy.

> **Nguyên tắc**: Nếu một bước không pass "Verify" → quay lại bước đó, đừng đi
> tiếp. 90% lỗi cuối cùng là do skip 1 bước nhỏ ở đầu.

> **Không hiểu thuật ngữ?** Cuối file có [§17 — Giải thích thuật ngữ](#17-giải-thích-thuật-ngữ).

> **Tổng thời gian**: ~60-90 phút lần đầu (chủ yếu chờ download).

---

## Mục lục

1. [Trước khi bắt đầu — chuẩn bị tâm lý](#1-trước-khi-bắt-đầu)
2. [Giải nén dự án](#2-giải-nén-dự-án)
3. [Cài Java JDK 17](#3-cài-java-jdk-17)
4. [Cài Maven](#4-cài-maven)
5. [Cài Node.js 20](#5-cài-nodejs-20)
6. [Cài Python 3.13](#6-cài-python-313)
7. [Cài Git](#7-cài-git)
8. [Cài PostgreSQL 16](#8-cài-postgresql-16)
9. [Tạo database & user](#9-tạo-database--user)
10. [Import dữ liệu mẫu](#10-import-dữ-liệu-mẫu)
11. [Cài pgvector (extension AI)](#11-cài-pgvector-extension-ai)
12. [Lấy Gemini API key](#12-lấy-gemini-api-key)
13. [Chạy AI service](#13-chạy-ai-service-python)
14. [Chạy Backend](#14-chạy-backend-java)
15. [Chạy Frontend](#15-chạy-frontend-nextjs)
16. [Test xem có chạy được không](#16-test-xem-có-chạy-được-không)
17. [Giải thích thuật ngữ](#17-giải-thích-thuật-ngữ)
18. [Troubleshooting — gặp lỗi gì làm gì](#18-troubleshooting)
19. [Mỗi lần ngồi code lại — start nhanh](#19-mỗi-lần-ngồi-code-lại)

---

## 1. Trước khi bắt đầu

### 1.1 Bạn cần biết 2 chương trình duy nhất

| Tên | Cách mở | Dùng để |
|---|---|---|
| **PowerShell** | Bấm phím `Windows`, gõ `powershell`, Enter | Chạy lệnh cài đặt và start service |
| **Notepad** (hoặc bất kỳ trình soạn thảo nào) | Phím `Windows` → gõ `notepad` | Sửa file cấu hình |

### 1.2 Quy ước trong tài liệu này

- **Khối code màu đen** = lệnh bạn copy → paste vào PowerShell → Enter:
  ```powershell
  java -version
  ```
- **Đường dẫn** Windows dùng dấu `\` (vd `C:\du-an\tmdt-my-pham`).
- Khi tài liệu nói "**mở terminal mới**" = mở thêm 1 cửa sổ PowerShell mới (giữ cửa sổ cũ).

### 1.3 Cần ~10GB ổ đĩa trống

Toàn bộ dự án + tooling chiếm ~7-10GB. Check ổ C còn trống không (Windows Explorer → This PC).

---

## 2. Giải nén dự án

1. File bạn nhận được tên `tmdt-my-pham.zip` (hoặc `.tar.gz`).
2. Tạo folder đích: vào ổ `C:\`, tạo folder mới tên **`du-an`** (KHÔNG dấu, KHÔNG khoảng trắng).
3. Click chuột phải vào file zip → **Extract All...** → chọn `C:\du-an\` → Extract.
4. Sau khi xong, bạn sẽ có folder: **`C:\du-an\tmdt-my-pham\`**
5. Mở folder này, kiểm tra phải có các thư mục con:
   - `ai-service` (Python)
   - `backend` (Java)
   - `frontend` (Next.js)
   - `database` (file SQL)
   - `docs` (tài liệu — bao gồm file này)

> **Quan trọng**: Đường dẫn KHÔNG được có khoảng trắng hay dấu tiếng Việt. Nếu lỡ đặt
> ở `C:\Tài liệu\Đồ án tốt nghiệp\` thì DI CHUYỂN sang `C:\du-an\` ngay. Không sẽ lỗi.

---

## 3. Cài Java JDK 17

**Java JDK** = bộ công cụ để chạy backend. Project này YÊU CẦU phiên bản 17 (không phải 8, không phải 21).

### Bước thực hiện

1. Vào https://www.azul.com/downloads/?package=jdk#zulu
2. Chọn:
   - **Java Version**: `Java 17 (LTS)`
   - **Operating System**: `Windows`
   - **Architecture**: `x86 64-bit` (đa số máy) hoặc `ARM 64-bit` (nếu là Surface Pro X / ARM)
   - **Java Package**: `JDK`
3. Tải file **`.msi`** (KHÔNG phải `.zip`).
4. Mở file vừa tải → Next → Next (đánh dấu **"Add to PATH"** + **"Set JAVA_HOME"** nếu được hỏi) → Install.

### Verify

Mở **PowerShell mới** (đóng cái cũ trước, mở cái mới — vì PATH chỉ load khi mở cửa sổ mới):

```powershell
java -version
```

Phải hiện kiểu này:
```
openjdk version "17.0.9"
OpenJDK Runtime Environment Zulu17.46+19-CA
```

Nếu hiện `'java' is not recognized as an internal or external command` → cài lại MSI và đảm bảo tick "Add to PATH".

---

## 4. Cài Maven

**Maven** = công cụ download thư viện Java + build backend.

### Cách dễ nhất: dùng Chocolatey (1 lệnh)

Mở **PowerShell với quyền Admin** (chuột phải PowerShell → "Run as Administrator"):

```powershell
# 1. Cài Chocolatey (nếu chưa có)
Set-ExecutionPolicy Bypass -Scope Process -Force; `
[System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; `
iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

# 2. Cài Maven
choco install maven -y
```

### Cách thủ công (nếu Chocolatey không chạy)

1. Tải https://maven.apache.org/download.cgi → chọn `apache-maven-3.9.x-bin.zip`
2. Giải nén vào `C:\maven\` (sao cho có file `C:\maven\bin\mvn.cmd`)
3. Thêm vào PATH:
   - Bấm `Windows` → gõ "environment variables" → mở **"Edit the system environment variables"**
   - Click **Environment Variables...**
   - Mục **System variables** → tìm `Path` → Edit → New → thêm `C:\maven\bin`
   - OK → OK → OK

### Verify (mở PowerShell MỚI sau khi cài)

```powershell
mvn -version
```

Phải hiện `Apache Maven 3.9.x`.

---

## 5. Cài Node.js 20

**Node.js** = chạy frontend Next.js.

1. Vào https://nodejs.org/en/download
2. Tải bản **LTS** (Long Term Support) — version `20.x` hoặc `22.x` (đừng tải phiên bản Current).
3. File `.msi` cho Windows.
4. Mở MSI → Next → Next → Install. Để mặc định mọi tùy chọn.

### Verify (PowerShell mới)

```powershell
node -v
npm -v
```

Phải hiện `v20.x.x` (hoặc cao hơn) và `10.x.x`.

---

## 6. Cài Python 3.13

**Python** = chạy AI service (chatbot, recommend).

> ⚠️ **BẮT BUỘC Python 3.11, 3.12, hoặc 3.13**. KHÔNG cài 3.14 — thư viện `asyncpg`
> chưa hỗ trợ, sẽ đứng máy hàng tiếng đồng hồ khi cài.

1. Vào https://www.python.org/downloads/windows/
2. Tìm phần **"Python 3.13.x"** → click `Windows installer (64-bit)` để tải.
3. Mở file MSI:
   - **TÍCH VÀO Ô** "Add python.exe to PATH" (rất quan trọng, ở dưới cùng cửa sổ cài)
   - Click **Install Now**

### Verify (PowerShell mới)

```powershell
python --version
```

Phải hiện `Python 3.13.x`.

Nếu hiện `'python' is not recognized` → cài lại + nhớ tick "Add to PATH". Hoặc thử `py --version` (Windows có alias riêng).

---

## 7. Cài Git

**Git** = quản lý code (cần để clone pgvector ở §11 nếu phải build từ source).

1. Vào https://git-scm.com/download/win → tải bản 64-bit.
2. Mở file → Next liên tục → Install (mặc định OK).

### Verify

```powershell
git --version
```

Phải hiện `git version 2.x.x`.

---

## 8. Cài PostgreSQL 16

**PostgreSQL** = database lưu sản phẩm, người dùng, đơn hàng.

1. Vào https://www.enterprisedb.com/downloads/postgres-postgresql-downloads
2. Chọn **PostgreSQL 16.x** → **Windows x86-64** → tải file `.exe` (~300MB).
3. Chạy file:
   - Click Next, Next.
   - Đường dẫn cài: để mặc định `C:\Program Files\PostgreSQL\16`.
   - **Components**: tick đủ 4 (Server, pgAdmin, Stack Builder, Command Line Tools).
   - **Data Directory**: để mặc định.
   - **Password**: ĐẶT password cho user `postgres` — **ghi nhớ password này**, vd `123456` hoặc `postgres`.
   - **Port**: để mặc định `5432`.
   - **Locale**: `Default locale`.
   - Next → Install (5-10 phút).
   - Bỏ tick "Launch Stack Builder" ở cuối.

### Verify

Bấm `Windows` → gõ **"pgAdmin 4"** → mở. Sẽ hiện cửa sổ web. Lần đầu nó hỏi master password — đặt 1 password (có thể giống password user `postgres`).

Bên trái có cây thư mục → click **Servers** → **PostgreSQL 16** → nhập password user `postgres` đã đặt → nếu connect thành công = OK.

---

## 9. Tạo database & user

Project mặc định cần:
- Database tên **`mypham`**
- User tên **`mypham`**, password **`mypham123`**

### Cách 1 (dễ): Dùng pgAdmin

1. Mở **pgAdmin 4** (đã cài ở §8).
2. Connect vào PostgreSQL 16 (nhập password user `postgres`).
3. Chuột phải **Login/Group Roles** → **Create** → **Login/Group Role...**:
   - Tab **General**: Name = `mypham`
   - Tab **Definition**: Password = `mypham123`
   - Tab **Privileges**: tick **Can login**, **Create databases**
   - Click **Save**
4. Chuột phải **Databases** → **Create** → **Database...**:
   - Database = `mypham`
   - Owner = `mypham` (chọn từ dropdown)
   - Click **Save**

### Cách 2 (nhanh hơn): Dùng PowerShell

Mở PowerShell, chạy:

```powershell
$env:PGPASSWORD = "<password user postgres của bạn>"
& "C:\Program Files\PostgreSQL\16\bin\psql.exe" -h localhost -U postgres -c "CREATE USER mypham WITH PASSWORD 'mypham123' CREATEDB;"
& "C:\Program Files\PostgreSQL\16\bin\psql.exe" -h localhost -U postgres -c "CREATE DATABASE mypham OWNER mypham;"
```

### Verify

```powershell
$env:PGPASSWORD = "mypham123"
& "C:\Program Files\PostgreSQL\16\bin\psql.exe" -h localhost -U mypham -d mypham -c "SELECT current_user;"
```

Phải hiện `current_user` = `mypham`.

> **Mẹo**: Để khỏi gõ đường dẫn dài, thêm `C:\Program Files\PostgreSQL\16\bin` vào PATH
> (như §4) → từ giờ chỉ cần gõ `psql` thay vì cả đường dẫn.

---

## 10. Import dữ liệu mẫu

Project có sẵn file SQL chứa schema (cấu trúc bảng) + dữ liệu mẫu (sản phẩm, admin).

```powershell
cd C:\du-an\tmdt-my-pham
$env:PGPASSWORD = "mypham123"
& "C:\Program Files\PostgreSQL\16\bin\psql.exe" -h localhost -U mypham -d mypham -f database\my-pham.sql
```

Sẽ thấy hàng chục dòng `CREATE TABLE`, `INSERT 0 1`... — bình thường.

### Verify

```powershell
& "C:\Program Files\PostgreSQL\16\bin\psql.exe" -h localhost -U mypham -d mypham -c "\dt"
```

Phải thấy các bảng: `nguoi_dung`, `san_pham`, `danh_muc`, `don_hang`, `khuyen_mai`...

---

## 11. Cài pgvector (extension AI)

**pgvector** = extension cho phép Postgres lưu vector — bắt buộc cho chatbot AI.

EDB installer trên Windows KHÔNG bundle pgvector. Có 2 cách lấy file: tải build sẵn (dễ) hoặc build từ source (khi cần version mới nhất).

### 11.1 Cách dễ — tải file build sẵn

1. Vào https://github.com/pgvector/pgvector/releases
2. Tải file `pgvector-x.x.x-pg16-windows-x64.zip` (mới nhất, có chữ `pg16`).
3. Giải nén → bạn sẽ thấy 3 thư mục: `lib`, `share`, ...

> Nếu trang Releases không có bản Windows pre-built (đôi khi tác giả không build sẵn),
> dùng công cụ thay thế: cài Postgres bằng **Postgres.app** (qua emulator macOS) — không
> khả thi trên Windows. Hoặc dùng **Docker Desktop**: image `pgvector/pgvector:pg16`.
> Hỏi giáo viên hướng dẫn nếu kẹt ở đây.

### 11.2 Copy file vào Postgres

> ⚠️ Cần quyền Admin vì copy vào `Program Files`.

Mở PowerShell **với quyền Admin** (chuột phải → "Run as Administrator"), giả sử bạn giải nén pgvector vào `C:\Users\<username>\Downloads\pgvector-0.7.4`:

```powershell
# Đổi đường dẫn tuỳ thư mục bạn giải nén
$pgvectorDir = "C:\Users\$env:USERNAME\Downloads\pgvector-0.7.4"
$pgDir = "C:\Program Files\PostgreSQL\16"

Copy-Item "$pgvectorDir\lib\vector.dll" "$pgDir\lib\"
Copy-Item "$pgvectorDir\share\extension\vector*" "$pgDir\share\extension\"
```

### 11.3 Bật extension trong DB `mypham`

```powershell
$env:PGPASSWORD = "<password user postgres>"
& "C:\Program Files\PostgreSQL\16\bin\psql.exe" -h localhost -U postgres -d mypham -c "CREATE EXTENSION IF NOT EXISTS vector;"
```

> Phải dùng user `postgres` (không phải `mypham`) vì lệnh `CREATE EXTENSION` cần superuser.

### 11.4 Verify

```powershell
$env:PGPASSWORD = "mypham123"
& "C:\Program Files\PostgreSQL\16\bin\psql.exe" -h localhost -U mypham -d mypham -c "SELECT extname, extversion FROM pg_extension WHERE extname='vector';"
```

Phải hiện 1 dòng `vector | 0.7.x`.

### 11.5 Chạy migration AI (tạo 4 bảng)

```powershell
$env:PGPASSWORD = "mypham123"
& "C:\Program Files\PostgreSQL\16\bin\psql.exe" -h localhost -U mypham -d mypham -f database\V3__ai.sql
```

---

## 12. Lấy Gemini API key

**Gemini** = AI của Google, dùng để chat + tạo embedding. Free tier 60 req/phút, 1500 req/ngày.

1. Vào https://aistudio.google.com/apikey (đăng nhập Google).
2. Click **Create API key** → chọn project (hoặc tạo project mới).
3. Copy key (dạng `AIzaSy...`, ~39 ký tự) → dán vào Notepad tạm.
4. **TUYỆT ĐỐI KHÔNG**:
   - Commit key vào Git
   - Share trong chat / Slack / Telegram
   - Đăng lên StackOverflow / GitHub issue

   Nếu lỡ leak, ngay lập tức quay lại trang trên → click vào key → **Delete** → tạo key mới.

---

## 13. Chạy AI service (Python)

### 13.1 Tạo môi trường ảo Python

Mở **PowerShell mới**, chạy:

```powershell
cd C:\du-an\tmdt-my-pham\ai-service
python -m venv venv
.\venv\Scripts\Activate.ps1
```

> Nếu thấy lỗi `running scripts is disabled on this system` khi `Activate.ps1` chạy → mở PowerShell **as Admin** một lần và chạy:
> ```powershell
> Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
> ```
> Đóng cửa sổ admin → quay lại PowerShell thường, chạy lại `Activate.ps1`.

Sau khi activate thành công, prompt sẽ có chữ `(venv)` ở đầu:
```
(venv) PS C:\du-an\tmdt-my-pham\ai-service>
```

### 13.2 Tạo file `.env`

```powershell
Copy-Item .env.example .env
notepad .env
```

Notepad mở ra. **Sửa duy nhất 1 dòng**:

```ini
GEMINI_API_KEY=AIzaSy...     <-- paste key đã lấy ở §12
```

Các dòng khác giữ nguyên. Save (Ctrl+S) → đóng Notepad.

### 13.3 Cài thư viện Python

```powershell
pip install -r requirements.txt
```

Lần đầu mất ~3-5 phút (~150MB). Nếu mạng quốc tế chậm (PyPI < 5 KB/s), dùng mirror Aliyun:

```powershell
pip install -i https://mirrors.aliyun.com/pypi/simple/ --trusted-host mirrors.aliyun.com -r requirements.txt
```

### 13.4 Smoke test (kiểm tra trước khi chạy thật)

```powershell
python scripts\smoke.py
```

Phải hiện:
```
→ Check DB + pgvector...
  ✓ pgvector OK: [1,2,3]
→ Check Gemini embedding...
  ✓ Embed OK: dim=3072
→ Check Gemini chat...
  ✓ Chat OK: <vài câu tiếng Việt>

✅ Tất cả pass — sẵn sàng chạy uvicorn + ingest /full
```

Nếu có dấu ✗ ở đâu đó → xem [§18 Troubleshooting](#18-troubleshooting).

### 13.5 Start AI service

```powershell
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

Khi thấy dòng:
```
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
```

→ AI service đã chạy. **Để cửa sổ này MỞ NGUYÊN, đừng đóng**.

### 13.6 Bootstrap embedding cho sản phẩm

Mở **PowerShell mới** (giữ cửa sổ uvicorn ở trên):

```powershell
Invoke-RestMethod -Uri http://localhost:8000/ingest/full -Method POST
```

Phải hiện kiểu:
```
total embedded failed
----- -------- ------
   11       11      0
```

> Nếu chỉ thấy `total=0` → DB chưa có sản phẩm. Quay lại §10.

---

## 14. Chạy Backend (Java)

Mở **PowerShell mới** (terminal #3):

```powershell
cd C:\du-an\tmdt-my-pham\backend
mvn spring-boot:run
```

Lần đầu Maven download ~200MB, mất 3-5 phút. Khi thấy dòng cuối:
```
Started MyPhamApplication in X.XXX seconds
```

→ Backend chạy ở port 8080. **Giữ cửa sổ này mở**.

### Verify (mở PowerShell mới):

```powershell
Invoke-RestMethod http://localhost:8080/api/ping
```

Phải trả `pong`.

---

## 15. Chạy Frontend (Next.js)

Mở **PowerShell mới** (terminal #4):

```powershell
cd C:\du-an\tmdt-my-pham\frontend
```

### 15.1 Cấu hình env

Kiểm tra file `frontend\.env.local` đã có chưa:

```powershell
Test-Path .env.local
```

- Nếu `True` → skip bước copy.
- Nếu `False`:
  ```powershell
  Copy-Item .env.example .env.local
  ```

Mặc định nội dung `.env.local`:
```ini
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
```

Để nguyên, không sửa.

### 15.2 Cài thư viện npm

```powershell
npm install
```

Lần đầu ~3-5 phút (~300MB).

### 15.3 Chạy dev server

```powershell
npm run dev
```

Khi thấy:
```
  ▲ Next.js 15.5
  - Local:        http://localhost:3000
  ✓ Ready in ~2s
```

→ Frontend chạy. **Giữ cửa sổ mở**.

---

## 16. Test xem có chạy được không

### 16.1 Bạn nên có 4 cửa sổ PowerShell đang mở:

| Cửa sổ | Đang chạy gì | Port |
|---|---|---|
| #1 | (free, dùng để gõ lệnh test) | — |
| #2 | `uvicorn` (AI service) | 8000 |
| #3 | `mvn spring-boot:run` (backend) | 8080 |
| #4 | `npm run dev` (frontend) | 3000 |

### 16.2 Mở trình duyệt

Vào địa chỉ: **http://localhost:3000**

Phải thấy trang chủ "Ngọc Lan Beauty" với hero, danh mục, sản phẩm nổi bật, và **nút chat tròn ở góc dưới phải**.

### 16.3 Test 6 bước UI

| # | Hành động | Kỳ vọng |
|---|---|---|
| 1 | Click nút chat → gõ `da mình rất dầu, gợi ý sản phẩm` → Send | Có reply tiếng Việt + 1-5 card sản phẩm phía dưới |
| 2 | Click 1 card sản phẩm trong chat | Sang trang chi tiết sản phẩm |
| 3 | Kéo cuối trang chi tiết | Section "Sản phẩm tương tự" có 4 sản phẩm |
| 4 | Đăng nhập (xem account ở §16.4) | Vào được, không lỗi |
| 5 | Sau khi login customer → reload `/` | Có section "Dành riêng cho bạn" |
| 6 | Login admin → vào `/quan-tri` | Thấy chart "Hiệu quả gợi ý AI" |

### 16.4 Tài khoản mặc định

(Có sẵn trong DB sau khi import `my-pham.sql`)

| Loại | Email | Password |
|---|---|---|
| Admin | `admin@mypham.com` | `123456` (xem comment trong file SQL nếu khác) |
| Customer | `test@example.com` | `123456` |

Nếu password không đúng, reset bằng cách chạy trong pgAdmin → Query Tool:

```sql
UPDATE nguoi_dung SET mat_khau = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy'
WHERE email='admin@mypham.com';
-- Password sau lệnh này = 123456
```

---

## 17. Giải thích thuật ngữ

| Thuật ngữ | Nghĩa đơn giản |
|---|---|
| **PowerShell** | Cửa sổ đen để gõ lệnh trên Windows. Giống Command Prompt nhưng mạnh hơn |
| **Terminal** | Cùng nghĩa với PowerShell trong tài liệu này |
| **Path / PATH** | Danh sách thư mục Windows tìm khi bạn gõ tên lệnh. Cài tooling phải tick "Add to PATH" để gõ tên ngắn |
| **Port** | "Cửa" để service nhận kết nối. Mỗi service mỗi cửa: DB=5432, AI=8000, BE=8080, FE=3000 |
| **Backend (BE)** | Phần code Java chạy ở server, xử lý logic + lưu DB |
| **Frontend (FE)** | Phần web hiển thị cho người dùng, code bằng Next.js (React) |
| **Database (DB)** | PostgreSQL, lưu mọi dữ liệu |
| **Migration** | File SQL tạo / sửa cấu trúc bảng trong DB |
| **Embedding** | Vector số (dạng list 768 con số) đại diện cho ý nghĩa của 1 sản phẩm. Dùng để AI tìm sp tương tự |
| **API key** | "Mật khẩu" để gọi dịch vụ Gemini. Để lộ là mất tiền |
| **Venv (Virtual Env)** | Môi trường Python riêng cho dự án này, không trộn với Python toàn máy |
| **npm** | Trình quản lý thư viện cho Node.js (giống pip cho Python) |
| **`Ctrl+C`** | Bấm để dừng 1 service đang chạy trong PowerShell |
| **Uvicorn** | Server chạy code FastAPI (Python AI service) |
| **Maven (mvn)** | Build tool cho Java, lo download thư viện + compile |

---

## 18. Troubleshooting

### Lỗi cài đặt phần mềm

| Lỗi | Cách fix |
|---|---|
| `'java' is not recognized as an internal or external command` | Cài lại JDK MSI, đảm bảo tick "Add to PATH". Đóng & mở lại PowerShell |
| `'mvn' is not recognized` | Cài Maven (§4) hoặc thêm `C:\maven\bin` vào PATH. Đóng & mở lại PowerShell |
| `'python' is not recognized` | Cài lại Python + tick "Add python.exe to PATH". Hoặc thử `py --version` |
| `'node' is not recognized` | Cài lại Node.js MSI (§5) |
| `running scripts is disabled on this system` | Chạy `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser` |

### Lỗi PostgreSQL / pgvector

| Lỗi | Cách fix |
|---|---|
| `connection refused on port 5432` | PostgreSQL service chưa chạy. Bấm `Windows` → `services.msc` → tìm `postgresql-x64-16` → Start |
| `password authentication failed for user "mypham"` | Sai password. Tạo lại user mypham (§9), đảm bảo password = `mypham123` |
| `extension "vector" is not available` | Chưa copy file pgvector vào Postgres. Quay lại §11.2 |
| `permission denied to create extension "vector"` | Đang dùng user `mypham`. Phải dùng user `postgres` (§11.3) |
| `type "vector" does not exist` ở `V3__ai.sql` | Quên `CREATE EXTENSION vector` — chạy §11.3 |

### Lỗi Python AI service

| Lỗi | Cách fix |
|---|---|
| `Building wheel for asyncpg ... still running` (treo phút) | Đang dùng Python 3.14. Cài Python 3.13 (§6) + tạo lại venv |
| `ModuleNotFoundError: google.generativeai` | Quên activate venv. Chạy `.\venv\Scripts\Activate.ps1` trước khi `pip` hoặc `uvicorn` |
| `404 ... is not found for API version v1beta` | Model deprecated. Trong `.env`: `EMBED_MODEL=models/gemini-embedding-001`, `CHAT_MODEL=models/gemini-2.5-flash` |
| `INVALID_ARGUMENT: API key not valid` | Key sai/khoảng trắng. Tạo key mới (§12) |
| `429 Quota exceeded` | Vượt 60 req/phút free tier. Đợi 1 phút |
| `port 8000 already in use` | Có service khác đang chiếm. Tìm: `Get-Process -Id (Get-NetTCPConnection -LocalPort 8000).OwningProcess` → kill |

### Lỗi Java Backend

| Lỗi | Cách fix |
|---|---|
| `Unsupported class file major version` | Sai Java version. Phải JDK 17 (`java -version` để check). Cài lại §3 |
| `Web server failed to start. Port 8080 was already in use` | Có service khác chiếm port 8080. Tìm: `Get-Process -Id (Get-NetTCPConnection -LocalPort 8080).OwningProcess` → `Stop-Process -Id <pid>` |
| `Failed to determine a suitable driver class` | Application yml sai cấu hình DB. Check user/password trong `backend\src\main\resources\application.yml` |
| `Không kết nối được AI service tại http://localhost:8000` | uvicorn chưa chạy hoặc đã crash. Quay lại §13.5 |

### Lỗi Frontend Next.js

| Lỗi | Cách fix |
|---|---|
| `Missing required env var: NEXT_PUBLIC_API_BASE_URL` | Tạo `frontend\.env.local` với `NEXT_PUBLIC_API_BASE_URL=http://localhost:8080` (§15.1) |
| Trang trắng, console: `Failed to fetch` | BE Spring chưa chạy. Mở terminal #3 chạy `mvn spring-boot:run` |
| Không thấy nút chat AI | `Ctrl+C` ở terminal frontend → `npm run dev` lại |
| Section "Dành riêng cho bạn" không hiện dù đã login | Chưa chạy `/ingest/full` (§13.6) |
| Chat trả `Xin lỗi, hệ thống AI hiện đang bận` | BE Spring trả lỗi. Xem log ở terminal #3 — copy đoạn lỗi tìm trong §18 này |
| `EACCES` / `permission denied` ở `npm install` | Xoá folder `node_modules` và file `package-lock.json` → `npm install` lại |

### Lỗi mạng

| Lỗi | Cách fix |
|---|---|
| Tải Maven / npm / pip rất chậm | Dùng VPN, hoặc chuyển sang mạng cáp thay vì wifi nhà mạng VN |
| `pip` timeout liên tục | Dùng Aliyun mirror (§13.3) |
| `npm install` timeout | `npm config set registry https://registry.npmmirror.com` rồi `npm install` lại |

---

## 19. Mỗi lần ngồi code lại

Sau khi setup xong lần đầu, các lần sau chỉ cần khởi động lại 3 service (DB tự chạy nền).

### Mở 3 cửa sổ PowerShell, copy từng đoạn:

**Cửa sổ 1 — AI service:**
```powershell
cd C:\du-an\tmdt-my-pham\ai-service
.\venv\Scripts\Activate.ps1
uvicorn app.main:app --reload --port 8000
```

**Cửa sổ 2 — Backend:**
```powershell
cd C:\du-an\tmdt-my-pham\backend
mvn spring-boot:run
```

**Cửa sổ 3 — Frontend:**
```powershell
cd C:\du-an\tmdt-my-pham\frontend
npm run dev
```

### Mở trình duyệt → http://localhost:3000

### Để dừng tất cả

Bấm `Ctrl+C` trong từng cửa sổ → đóng cửa sổ.

PostgreSQL mặc định chạy nền liên tục — không cần dừng. Nếu muốn tiết kiệm RAM:
- `Windows` → `services.msc` → tìm `postgresql-x64-16` → Stop.
- Lần sau cần code → Start lại.

---

## 20. Cấu trúc dự án

```
C:\du-an\tmdt-my-pham\
├── ai-service\              # Python — chatbot AI, gợi ý sản phẩm
│   ├── app\
│   ├── scripts\smoke.py
│   ├── requirements.txt
│   ├── .env.example         # mẫu cấu hình
│   └── venv\                # tạo bằng python -m venv venv (§13.1)
│
├── backend\                 # Java Spring Boot — API server
│   ├── src\main\java\com\mypham\
│   ├── src\main\resources\
│   │   └── application.yml  # cấu hình DB
│   └── pom.xml              # khai báo thư viện Java
│
├── frontend\                # Next.js — giao diện web
│   ├── src\
│   ├── package.json         # khai báo thư viện Node
│   ├── .env.local           # cấu hình API URL
│   └── node_modules\        # tạo bởi npm install
│
├── database\
│   ├── my-pham.sql          # Schema chính + seed data
│   └── V3__ai.sql           # Migration thêm bảng AI
│
├── docs\
│   ├── SETUP-AI.md          # Setup chi tiết module AI (macOS)
│   ├── ai-test-prompts.md   # Setup macOS đầy đủ
│   └── huong-dan-full.md    # File này — Windows toàn tập
│
└── readme.md
```

---

## ✅ Hoàn tất

Khi đến đây và làm được §16.3 step 1 (chat trả lời), bạn đã chạy thành công 100% dự án.

**Nếu lỗi ở bước nào, mở §18 Troubleshooting tìm theo từ khóa lỗi.**

**Nếu vẫn không fix được**, gửi cho người support:
1. Số bước mà bạn đang dừng (vd "đang lỗi ở §13.4 smoke test")
2. Screenshot toàn bộ cửa sổ PowerShell (cả lệnh + lỗi)
3. Output của `java -version`, `python --version`, `node -v`
