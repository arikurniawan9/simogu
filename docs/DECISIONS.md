# Architectural & Design Decisions — SIMOGU

Dokumen ini mencatat keputusan arsitektur teknis dan standar UI/UX untuk proyek Sistem Monitoring Kehadiran Guru (SIMOGU).

---

## 1. Keputusan Struktur Monorepo

- **Tooling Monorepo**: `pnpm workspace`
- **Struktur Folder**:
  - `apps/web`: Next.js 14+ (App Router, TypeScript, Tailwind CSS)
  - `apps/api`: NestJS (TypeScript, Prisma ORM, REST API)
  - `apps/mobile`: Flutter (Riverpod, Dio, Secure Storage)
  - `packages/types`: Shared TypeScript interfaces & DTOs
  - `packages/config`: Shared ESLint, Prettier, TypeScript config

---

## 2. Keputusan Tema Warna & Desain UI/UX Premium

Sesuai instruksi khusus pengguna, tampilan UI/UX SIMOGU dirancang dengan prinsip: **Simpel, Optimal, Powerful, Mewah, dan Premium**.

### Palette Warna (Smooth Emerald & Forest Theme)
- **Primary Light Green**: Emerald Smooth (`#10B981`, `#34D399`, `#A7F3D0`, `#ECFDF5`)
- **Primary Darker Green Accent**: Deep Emerald/Forest (`#059669`, `#047857`, `#065F46`, `#022C22`)
- **Light Mode Background**: Crisp Soft Clean Mint Gray (`#F4FBF7`, `#E6F4ED`)
- **Dark Mode Background**: Deep Emerald Night (`#040D0A`, `#0B1E17`, `#122C22`)

### Komponen Kunci UI/UX
1. **Dark & Light Mode Support**:
   - Menggunakan `next-themes` pada `apps/web`.
   - Perpaduan warna yang harmonis, tajam, dan tidak melelahkan mata di kedua mode.
2. **Confirmation Modal Standard**:
   - Semua tindakan penting (Hapus, Simpan Absensi, Persetujuan/Penolakan Change Request, Logout) wajib menggunakan **Modal Konfirmasi Interaktif & Responsif** yang indah dengan efek *backdrop blur* (glassmorphism) dan animasi mikro.
3. **Data Table Standard (Search & Pagination)**:
   - Setiap komponen tabel wajib dilengkapi dengan:
     - Fitur pencarian instan (*real-time search input*).
     - Kontrol paginasi responsif (Navigasi halaman, ukuran baris per halaman).
     - Filter popover & indikator sorting header.
     - Skeleton loading state yang mulus.
4. **Tipografi & Estetika**:
   - Menggunakan Google Font modern (`Outfit` / `Inter`).
   - Efek *glassmorphism*, *subtle micro-animations* (hover, active transition), dan *rounded corners* modern (`rounded-2xl`).

---

## 3. Keputusan Autentikasi & Keamanan

- **Metode Auth**: JWT Access Token (berumur pendek, misal 15 menit) + Refresh Token (berumur panjang, misal 7 hari).
- **Penyimpanan Token**:
  - Web: HTTP-only Cookie / Secure State.
  - Mobile: Flutter `flutter_secure_storage`.
  - Database: Refresh Token disimpan dalam bentuk Hash (Bcrypt / Argon2).
- **RBAC Guard**: NestJS Custom Decorator + Guards (`@Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.PIKET)`).
- **Public Protection**: Endpoint portal publik terisolasi, menggunakan UUID/Hash Public ID (bukan DB integer auto-increment), dan dilindungi rate-limiter (`@nestjs/throttler`).

---

## 4. Keputusan Database & Transaksi

- **ORM & DB**: PostgreSQL + Prisma ORM.
- **Auditing**: Audit log otomatis mencatat `userId`, `action`, `entity`, `entityId`, `oldValues`, `newValues`, `ipAddress`, `userAgent`.
- **Soft Delete**: Data guru (`Teacher`) menggunakan `deletedAt` jika sudah memiliki relasi data absensi historis.
- **Transactional Approval**: Pengajuan persetujuan perubahan status (`AttendanceChangeRequest`) menggunakan `prisma.$transaction` untuk menjamin atomisitas perubahan status dan pencatatan audit log.

---

## 5. Keputusan Integrasi WhatsApp & Notifikasi

- **Adapter Pattern**:
  - Interface `WhatsAppProvider` dengan 2 implementasi:
    1. `MockWhatsAppProvider`: Untuk environment development & testing (mencatat log pesan tanpa benar-benar mengirim WA).
    2. `CloudApiWhatsAppProvider`: Menggunakan Official WhatsApp Business Cloud API resmi.
- **Fail-safe**: Kegagalan pengiriman pesan WA ditangkap dan dicatat ke `WhatsAppMessage` log dengan status `FAILED`. **Tidak pernah** membatalkan transaksi pencatatan absensi guru.
