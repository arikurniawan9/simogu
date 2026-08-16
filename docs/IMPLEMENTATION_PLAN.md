# Implementation Plan — SIMOGU

Rencana pelaksanaan pembangunan Sistem Monitoring Kehadiran Guru (SIMOGU) berstandar monorepo, aman, responsif, dan kaya estetika UI/UX.

---

## 1. Monorepo & Arsitektur Utama

- **Monorepo Manager**: `pnpm` dengan workspace file `pnpm-workspace.yaml`.
- **Apps**:
  - `apps/web`: Next.js 14+ App Router, Tailwind CSS, TanStack Query, Zod, React Hook Form, next-themes, Lucide Icons, Framer Motion.
  - `apps/api`: NestJS, Prisma ORM, Passport JWT, Zod / class-validator, Throttler, Swagger, Pino Logger.
  - `apps/mobile`: Flutter SDK, Riverpod, Dio, Flutter Secure Storage, FCM.
- **Packages**:
  - `packages/types`: Type definitions shared antara web & API.
  - `packages/config`: Config ESLint & TypeScript shared.

---

## 2. Strategi Komponen Utama

### A. Strategi UI/UX (Green Smooth Theme, Dark/Light Mode, Table, Modal)
- **Design Token Palette**: Smooth Emerald (`#10B981`, `#059669`) & Forest Dark Green (`#065F46`, `#061A14`).
- **Theme Switcher**: `next-themes` dipadukan dengan variabel CSS Tailwind.
- **Responsive Confirmation Modal**: Reusable component `ConfirmationModal` dengan animasi enter/exit, backdrop blur, icon konfirmasi kontekstual (Warning, Danger, Success), serta tombol Aksi (Batal / Konfirmasi).
- **Reusable DataTable Component**: Component `DataTable` universal yang mendukung:
  - Global Search Input dengan debouncing.
  - Controls Paginasi (Next, Prev, Page Number, Rows per Page).
  - Column Sorting & Filtering.
  - Dynamic Skeleton Loading Rows.

### B. Strategi Database & Migration
- Database PostgreSQL.
- ORM Prisma untuk schema, migration (`prisma migrate dev`), dan seeding (`prisma db seed`).
- Soft Delete via `deletedAt` untuk data sensitif yang ber-relasi historis.

### C. Strategi Autentikasi & Authorization
- Password Hashing dengan Bcrypt / Argon2.
- JWT Access Token (15m) + Hashed Refresh Token (7d) di PostgreSQL.
- Guard RBAC NestJS (`SuperAdmin`, `Admin`, `PetugasPiket`).

### D. Strategi WhatsApp Integration
- Interface `WhatsAppService` (Adapter pattern).
- Environment flag `WHATSAPP_PROVIDER=mock|cloud_api`.
- Log pengiriman disimpan ke tabel `WhatsAppMessage`. Jika gagal, tersimpan `FAILED` tanpa melempar exception yang me-rollback absensi.

### E. Strategi Testing & Quality Assurance
- **API Unit & E2E Testing**: Vitest / Jest + Supertest.
- **Web Testing**: Vitest + React Testing Library.
- **Mobile Testing**: Flutter Unit Test & Widget Test.
- Mandat QA: `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build` harus LULUS sebelum tahap dinyatakan selesai.

### F. Strategi Deployment & Docker
- Multi-stage Dockerfile untuk `apps/api` dan `apps/web`.
- `docker-compose.yml` untuk PostgreSQL, Redis (opsional), API, dan Web.
- Environment variables terisolasi dengan file `.env.example`.

---

## 3. Matriks Risiko Teknis & Mitigasi

| Risiko | Dampak | Mitigasi |
| :--- | :--- | :--- |
| **Race Condition pada Approval** | Dua admin menyetujui pengajuan yang sama secara bersamaan | Gunakan `prisma.$transaction` dengan locking/atomic status check pada `AttendanceChangeRequest`. |
| **WhatsApp Cloud API Rate Limit / Failure** | Pengiriman pesan WA gagal / diblokir | Gunakan retry queue & simpan status failure secara terpisah tanpa membatalkan absensi. |
| **Bentrokan Jadwal Guru / Kelas** | Data jadwal tumpang tindih | Validasi bentrok jadwal di layer API service sebelum Insert/Update. |
| **Evolusi Schema Flutter Mobile** | Aplikasi mobile error jika API berubah | Gunakan versioning API `/api/v1` dan shared contract types. |

---

## 4. Checklist Tahapan Implementasi

- [x] **Tahap 00 — Audit dan Rencana Implementasi**
  - [x] Audit struktur & requirement repository
  - [x] Pembuatan `docs/DECISIONS.md`
  - [x] Pembuatan `docs/IMPLEMENTATION_PLAN.md`
- [x] **Tahap 01 — Fondasi Monorepo**
  - [x] Inisialisasi `pnpm-workspace.yaml` & `.git`
  - [x] Setup `apps/api` (NestJS) dengan `/api/v1/health`
  - [x] Setup `apps/web` (Next.js) dengan Tailwind CSS, Green Theme, Dark/Light Mode, DataTable, Modal Konfirmasi
  - [x] Setup `apps/mobile` (Flutter app structure)
  - [x] Setup `packages/types` & `packages/typescript-config`
  - [x] Verifikasi `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build` (LULUS)
- [x] **Tahap 02 — Database dan Seed**
  - [x] Definisi `prisma/schema.prisma` PostgreSQL lengkap
  - [x] Initial Migration `20260808000000_init`
  - [x] Script Seeder (`users`, `teachers`, `classes`, `periods`, `schedules`, `settings`)
  - [x] Integration Test DB Constraint & `PrismaService` (6/6 tests LULUS)
  - [x] Dokumentasi ERD Mermaid di `docs/ERD.md`
- [x] **Tahap 03 — Autentikasi dan RBAC**
  - [x] Endpoint Auth (`/login`, `/refresh`, `/logout`, `/logout-all`, `/me`, `/forgot-password`, `/reset-password`)
  - [x] Password Hashing dengan Bcrypt & Refresh Token Rotation di Database
  - [x] Role Guards & Custom Decorators (`@Public()`, `@Roles()`, `@CurrentUser()`)
  - [x] Rate limiting login (ThrottlerGuard) & Audit log login (berhasil & gagal)
  - [x] Halaman login web responsif ([`login/page.tsx`](file:///C:/project/SIMOGU/apps/web/src/app/login/page.tsx)) dengan Theme Hijau Smooth & Dark/Light Mode
  - [x] Integration Test Auth & Seed Login (12/12 tests LULUS)
- [x] **Tahap 04 — Master Data Guru dan Kelas**
  - [x] CRUD REST API Teachers, Classes, LessonPeriods, AcademicYears, Semesters
  - [x] Normalisasi Otomatis Nomor WhatsApp ke Format Standard `62xxxxxxxxxxx`
  - [x] Proteksi RBAC (`SUPER_ADMIN`, `ADMIN`) & Audit Logging Aktivitas Master Data
  - [x] Proteksi Soft Delete Guru (`deletedAt`) untuk Keamanan Data Historis Absensi
  - [x] UI Admin Responsif Guru ([`admin/teachers/page.tsx`](file:///C:/project/SIMOGU/apps/web/src/app/admin/teachers/page.tsx)) & Kelas ([`admin/classes/page.tsx`](file:///C:/project/SIMOGU/apps/web/src/app/admin/classes/page.tsx)) dengan Theme Hijau Smooth, Dark Mode, DataTable, Modal Form & Confirmation Modal
  - [x] Integration Test TeachersService & WhatsApp Normalization (20/20 tests LULUS)
- [x] **Tahap 05 — Jadwal Mengajar**
  - [x] CRUD REST API Schedules dengan Filter Hari, Kelas, Guru, & Semester
  - [x] Validasi Bentrokan Jadwal Guru (Rule 14) & Bentrokan Jadwal Kelas (Rule 15)
  - [x] Endpoint Jadwal Hari Ini (`/api/v1/schedules/today`) & Duplikasi Semester (`/api/v1/schedules/copy-semester`)
  - [x] Fitur Import Excel 2-Tahap & Template Excel
  - [x] UI Admin Responsif Jadwal ([`admin/schedules/page.tsx`](file:///C:/project/SIMOGU/apps/web/src/app/admin/schedules/page.tsx)) dengan Filter Hari, Theme Hijau Smooth, Dark Mode, & Modal Konfirmasi
  - [x] Integration Test SchedulesService & Conflict Rejection (22/22 tests LULUS)
- [x] **Tahap 06 — Absensi Piket**
  - [x] Endpoint Catat Absensi Tunggal & Bulk Massal (`/api/v1/attendance`)
  - [x] Transaksi Database PostgreSQL, Pencegahan Duplikasi Absensi (`@@unique([scheduleId, attendanceDate])`), & Audit Log
  - [x] Pencatatan `status` (Default: `ABSENT_PENDING_CONFIRMATION` / Status Pilihan) & Riwayat Status (`AttendanceStatusHistory`)
  - [x] Portal Absensi Piket Web ([`piket/attendance/page.tsx`](file:///C:/project/SIMOGU/apps/web/src/app/piket/attendance/page.tsx)) dengan Kartu Ringkasan Realtime, Checkbox Massal, Theme Hijau Smooth, & Modal Konfirmasi
  - [x] Integration Test AttendanceService (25/25 tests LULUS)
- [x] **Tahap 07 — Persetujuan Perubahan Status**
  - [x] REST API Change Requests (`/api/v1/change-requests`, `/approve`, `/reject`)
  - [x] Transaksi DB PostgreSQL untuk Approval/Rejection, Pencatatan `AttendanceStatusHistory`, & Prevent Race Condition (Lock `status === PENDING`)
  - [x] Proteksi Larangan Self-Approval (Pengaju tidak dapat menyetujui pengajuannya sendiri)
  - [x] Halaman Persetujuan Admin Web ([`admin/approvals/page.tsx`](file:///C:/project/SIMOGU/apps/web/src/app/admin/approvals/page.tsx)) dengan Tab Pending & History, Theme Hijau Smooth, & Modal Konfirmasi Approval/Rejection
  - [x] Integration Test ChangeRequestsService & Concurrency (28/28 tests LULUS)
  - [x] UI Approval Admin dengan Diff Visual & Modal Konfirmasi
- [x] **Tahap 08 — WhatsApp Business Integration**
  - [x] Provider Interface (`IWhatsAppProvider`), `MockWhatsAppProvider`, & `CloudApiWhatsAppProvider` (Official Meta Graph API Adapter)
  - [x] Outbox Non-blocking Messaging & Log DB Table `WhatsAppMessage` (`PENDING`, `SENT`, `FAILED`)
  - [x] Endpoint Webhook Verification & Receiving (`/api/v1/whatsapp/webhook`)
  - [x] Endpoint Resend Retry (`/api/v1/whatsapp/resend/:id`)
  - [x] Halaman Outbox WhatsApp Admin Web ([`admin/whatsapp/page.tsx`](file:///C:/project/SIMOGU/apps/web/src/app/admin/whatsapp/page.tsx)) dengan Retry Confirm Modal & Theme Hijau Smooth
  - [x] Dokumentasi Setup Production di [`docs/WHATSAPP_SETUP.md`](file:///C:/project/SIMOGU/docs/WHATSAPP_SETUP.md)
  - [x] Integration Test WhatsAppService (31/31 tests LULUS)
- [x] **Tahap 09 — Portal Guru (Publik)**
  - [x] Endpoint Publik Guru (`/api/v1/teachers/search`, `/public/summary/:code`, `/public/history/:code`)
  - [x] Sanitasi Keamanan Data Publik (No. WhatsApp & Data Sensitif Di-masking / Tidak Ditampilkan)
  - [x] Halaman Pencarian Publik Guru ([`guru/page.tsx`](file:///C:/project/SIMOGU/apps/web/src/app/guru/page.tsx)) dengan Autocomplete & Card Disambiguasi
  - [x] Halaman Profil & Riwayat Absensi Guru ([`guru/[code]/page.tsx`](file:///C:/project/SIMOGU/apps/web/src/app/guru/%5Bcode%5D/page.tsx)) dengan Badge Penghargaan 100%, Card Summary, Filter Status, & History Table
  - [x] Verifikasi 31/31 Unit & Integration Tests LULUS
  - [x] Rate Limiting & Protection Data Sensitif
- [x] **Tahap 10 — Dashboard dan Laporan**
  - [x] REST API Dashboard Metrics & Charts (`/api/v1/dashboard/metrics`, `/api/v1/dashboard/charts`)
  - [x] REST API Reports & Ekspor Spreadsheet Real Excel `.xlsx` (`/api/v1/reports/export/excel`)
  - [x] Dashboard Eksekutif Admin Web ([`admin/dashboard/page.tsx`](file:///C:/project/SIMOGU/apps/web/src/app/admin/dashboard/page.tsx)) dengan 8 Kartu Metrik, Bar Tren Distribusi Status, & Quick Links
  - [x] Pusat Laporan & Ekspor Web ([`admin/reports/page.tsx`](file:///C:/project/SIMOGU/apps/web/src/app/admin/reports/page.tsx)) dengan Filter Rentang Tanggal, Ekspor Excel (.xlsx), & Cetak PDF
  - [x] Verifikasi 34/34 Unit & Integration Tests LULUS
- [x] **Tahap 11 — Notifikasi Real-time & FCM**
  - [x] REST API System Notifications (`/api/v1/notifications`, `/read`, `/read-all`, `/unread-count`)
  - [x] Pemicu Notifikasi Otomatis (Pengajuan Baru, Result Approval/Rejection, & Outbox Failure)
  - [x] Komponen Lonceng Notifikasi Web ([`components/notification-bell.tsx`](file:///C:/project/SIMOGU/apps/web/src/components/notification-bell.tsx)) dengan Unread Badge Count, Dropdown Recent List, & Mark All Read
  - [x] Integration Test NotificationsService (35/35 tests LULUS)
- [x] **Tahap 12 — Aplikasi Mobile Flutter**
  - [x] Inisialisasi Flutter App dengan Material 3 Theme & Smooth Emerald Palette
  - [x] Adaptor Dio Interceptor ([`apps/mobile/lib/core/api/dio_client.dart`](file:///C:/project/SIMOGU/apps/mobile/lib/core/api/dio_client.dart))
  - [x] Layar Login Mobile ([`apps/mobile/lib/features/auth/login_screen.dart`](file:///C:/project/SIMOGU/apps/mobile/lib/features/auth/login_screen.dart))
  - [x] Layar Beranda SIMOGU Mobile ([`apps/mobile/lib/main.dart`](file:///C:/project/SIMOGU/apps/mobile/lib/main.dart))
  - [x] Dokumentasi Kompilasi & Build AAB/IPA di [`docs/MOBILE_SETUP.md`](file:///C:/project/SIMOGU/docs/MOBILE_SETUP.md)
- [x] **Tahap 13 — Testing dan Security Audit**
  - [x] Security Hardening via Helmet Security Headers di NestJS API ([`apps/api/src/main.ts`](file:///C:/project/SIMOGU/apps/api/src/main.ts))
  - [x] Proteksi Masking Data Sensitif Guru di Portal Publik
  - [x] Laporan Audit Keamanan di [`docs/SECURITY_AUDIT_RESULT.md`](file:///C:/project/SIMOGU/docs/SECURITY_AUDIT_RESULT.md)
  - [x] 35/35 Integration & Unit Tests LULUS 100% Cleanly
- [x] **Tahap 14 — Docker dan Deployment**
  - [x] Multi-stage `Dockerfile.api` & `Dockerfile.web`
  - [x] Setup Production Container `docker-compose.yml` (`postgres`, `api`, `web`) & Health Check Validasi (Valid via `docker compose config`)
  - [x] Database Backup Script (`scripts/backup-db.sh`)
  - [x] Dokumentasi Deployment Production & SSL di [`docs/DEPLOYMENT_GUIDE.md`](file:///C:/project/SIMOGU/docs/DEPLOYMENT_GUIDE.md)
- [x] **Tahap 15 — Final Audit**
  - [x] Laporan Audit Akhir di [`docs/FINAL_AUDIT_REPORT.md`](file:///C:/project/SIMOGU/docs/FINAL_AUDIT_REPORT.md) (100% Production Ready)
  - [x] Release Checklist di [`docs/RELEASE_CHECKLIST.md`](file:///C:/project/SIMOGU/docs/RELEASE_CHECKLIST.md)
  - [x] Verifikasi Monorepo Full Build, Typecheck, & Tests (35/35 Tests LULUS)
