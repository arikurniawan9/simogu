# Checklist Rilis Produksi SIMOGU (Release Checklist)

Gunakan checklist ini sebelum melakukan deploymentSIMOGU ke lingkungan **Production**.

---

## 📋 1. Konfigurasi Database & Infrastruktur

- [x] Database PostgreSQL 16 terinstall dan aktif.
- [x] File `.env` produksi diatur dengan `JWT_SECRET` yang kuat.
- [x] Migrasi database dijalankan via `pnpm prisma:migrate`.
- [x] Seed data awal (Super Admin & Data Master) dijalankan via `pnpm prisma:seed`.

---

## 📱 2. Integrasi WhatsApp & Cloud API

- [x] Token Meta WhatsApp Cloud API (`WHATSAPP_ACCESS_TOKEN`) terpasang.
- [x] Webhook callback URL diisi: `https://api.simogu.sch.id/api/v1/whatsapp/webhook`.
- [x] Verify Token dipasang dan terverifikasi.

---

## 🛡️ 3. Keamanan & Performa

- [x] Security headers (Helmet) aktif.
- [x] Limit request payload (10MB) dikonfigurasi.
- [x] CORS Allowlist diatur ke domain web sekolah.
- [x] Sertifikat SSL HTTPS aktif via Let's Encrypt / Certbot.

---

## 📲 4. Aplikasi Mobile Flutter

- [x] Versi build disesuaikan (`pubspec.yaml`).
- [x] App Bundle Android (.aab) terkompilasi untuk Google Play Console.
- [x] Export IPA iOS terkompilasi untuk App Store Connect.
