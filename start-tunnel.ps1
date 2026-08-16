# ============================================================
# SIMOGU - Start Public Tunnel
# Script ini menjalankan dev server + Cloudflare Tunnel
# Teman Anda bisa akses via URL yang ditampilkan
# ============================================================

$ErrorActionPreference = "Continue"
$ROOT = "C:\project\SIMOGU"

Write-Host ""
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "   SIMOGU - Cloudflare Public Tunnel     " -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

# --- Cek apakah cloudflared terinstall ---
if (-not (Get-Command cloudflared -ErrorAction SilentlyContinue)) {
    Write-Host "[ERROR] cloudflared tidak ditemukan!" -ForegroundColor Red
    Write-Host "Jalankan: winget install --id Cloudflare.cloudflared" -ForegroundColor Yellow
    exit 1
}

# --- Cek apakah port 3000 (web) sudah berjalan ---
$port3000 = netstat -ano | Select-String ":3000 " | Select-String "LISTENING"
$port3001 = netstat -ano | Select-String ":3001 " | Select-String "LISTENING"

if (-not $port3000) {
    Write-Host "[INFO] Web server (port 3000) tidak berjalan." -ForegroundColor Yellow
    Write-Host "[INFO] Memulai API dan Web dev server di background..." -ForegroundColor Yellow
    Write-Host ""

    # Jalankan API di window baru
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$ROOT\apps\api'; Write-Host 'Starting API...' -ForegroundColor Green; pnpm dev" -WindowStyle Normal

    # Tunggu sebentar
    Write-Host "[INFO] Menunggu API siap (10 detik)..." -ForegroundColor Gray
    Start-Sleep -Seconds 10

    # Jalankan Web di window baru
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$ROOT\apps\web'; Write-Host 'Starting Web...' -ForegroundColor Green; pnpm dev" -WindowStyle Normal

    Write-Host "[INFO] Menunggu Web server siap (15 detik)..." -ForegroundColor Gray
    Start-Sleep -Seconds 15
} else {
    Write-Host "[OK] Web server sudah berjalan di port 3000" -ForegroundColor Green
}

if (-not $port3001) {
    Write-Host "[WARN] API server (port 3001) belum berjalan, pastikan sudah distart!" -ForegroundColor Yellow
} else {
    Write-Host "[OK] API server sudah berjalan di port 3001" -ForegroundColor Green
}

Write-Host ""
Write-Host "[INFO] Memulai Cloudflare Quick Tunnel..." -ForegroundColor Cyan
Write-Host "[INFO] Tunggu beberapa detik, URL publik akan muncul..." -ForegroundColor Cyan
Write-Host ""
Write-Host "=========================================" -ForegroundColor Green
Write-Host "  URL publik akan muncul di bawah ini:   " -ForegroundColor Green
Write-Host "  Bagikan URL tersebut ke teman Anda!    " -ForegroundColor Green
Write-Host "  Tekan Ctrl+C untuk menghentikan tunnel " -ForegroundColor Yellow
Write-Host "=========================================" -ForegroundColor Green
Write-Host ""

# Jalankan cloudflared quick tunnel (tidak perlu login!)
cloudflared tunnel --url http://localhost:3000
