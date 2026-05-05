$ErrorActionPreference = "Stop"

$DB_HOST = if ($env:DB_HOST) { $env:DB_HOST } else { "localhost" }
$DB_PORT = if ($env:DB_PORT) { $env:DB_PORT } else { "5432" }
$DB_NAME = if ($env:DB_NAME) { $env:DB_NAME } else { "mypham" }
$DB_USER = if ($env:DB_USER) { $env:DB_USER } else { "mypham" }
$DB_PASSWORD = if ($env:DB_PASSWORD) { $env:DB_PASSWORD } else { "mypham123" }

$psqlCandidates = @(
    "C:\Program Files\PostgreSQL\16\bin\psql.exe",
    "C:\Program Files\PostgreSQL\17\bin\psql.exe",
    "C:\Program Files\PostgreSQL\15\bin\psql.exe"
)
$PSQL = $null
foreach ($c in $psqlCandidates) {
    if (Test-Path $c) { $PSQL = $c; break }
}
if (-not $PSQL) {
    $cmd = Get-Command psql -ErrorAction SilentlyContinue
    if ($cmd) { $PSQL = $cmd.Source }
}
if (-not $PSQL) {
    Write-Error "Không tìm thấy psql.exe. Cài PostgreSQL hoặc add vào PATH."
    exit 1
}

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$UploadsDir = Join-Path (Split-Path -Parent $ScriptDir) "backend\uploads"
if (-not (Test-Path $UploadsDir)) {
    Write-Error "Không thấy folder $UploadsDir"
    exit 1
}

$Images = Get-ChildItem -Path $UploadsDir -File -Include *.jpg, *.jpeg, *.png, *.webp |
    Sort-Object Name
if ($Images.Count -eq 0) {
    Write-Error "Folder uploads rỗng — copy ảnh vào $UploadsDir rồi chạy lại."
    exit 1
}
Write-Host "→ Tìm thấy $($Images.Count) file ảnh trong uploads\"

$env:PGPASSWORD = $DB_PASSWORD
$psqlArgs = @("-h", $DB_HOST, "-p", $DB_PORT, "-U", $DB_USER, "-d", $DB_NAME, "-t", "-A")

$idsRaw = & $PSQL $psqlArgs -c "SELECT id FROM san_pham WHERE trang_thai='ACTIVE' ORDER BY id;"
$ProductIds = $idsRaw | Where-Object { $_ -and $_.Trim() -ne "" } | ForEach-Object { $_.Trim() }
if ($ProductIds.Count -eq 0) {
    Write-Error "Không có sp ACTIVE — chạy migration database\my-pham.sql trước."
    exit 1
}
Write-Host "→ Có $($ProductIds.Count) sp ACTIVE: $($ProductIds -join ', ')"

Write-Host "→ Xoá san_pham_anh cũ..."
$idsCsv = $ProductIds -join ","
& $PSQL $psqlArgs -c "DELETE FROM san_pham_anh WHERE san_pham_id IN ($idsCsv);" | Out-Null

Write-Host "→ Insert ảnh mới..."
for ($i = 0; $i -lt $ProductIds.Count; $i++) {
    $pid = $ProductIds[$i]
    $img = $Images[$i % $Images.Count]
    $url = "/uploads/$($img.Name)"
    & $PSQL $psqlArgs -c "INSERT INTO san_pham_anh (san_pham_id, url, thu_tu) VALUES ($pid, '$url', 0);" | Out-Null
    Write-Host "  sp #$pid <- $($img.Name)"
}

Write-Host "✅ Đã seed $($ProductIds.Count) sp với ảnh từ uploads\"
