# AGENTS.md

## Tujuan Proyek

Membangun Sistem Monitoring Kehadiran Guru yang terdiri dari:

- Web frontend untuk admin, petugas piket, dan portal guru.
- Backend REST API.
- Database PostgreSQL.
- Aplikasi mobile Android dan iOS menggunakan Flutter.
- Integrasi WhatsApp Business Cloud API.
- Notifikasi, laporan, audit log, dan alur persetujuan perubahan status.

## Bahasa

- Antarmuka pengguna menggunakan Bahasa Indonesia.
- Nama variabel, fungsi, class, tabel, dan API menggunakan Bahasa Inggris.
- Dokumentasi teknis dapat menggunakan Bahasa Indonesia.
- Pesan error kepada pengguna harus mudah dipahami.

## Teknologi Utama

- Monorepo: pnpm workspace.
- Web: Next.js, TypeScript, App Router.
- Styling: Tailwind CSS.
- API: NestJS, TypeScript.
- Database: PostgreSQL.
- ORM: Prisma.
- Validation: Zod pada web dan class-validator pada API.
- API docs: Swagger/OpenAPI.
- Mobile: Flutter.
- Mobile state management: Riverpod.
- Token mobile: secure storage.
- Testing web/API: Vitest atau Jest dan Playwright.
- File storage: S3-compatible storage.
- Push notification: Firebase Cloud Messaging.
- WhatsApp: WhatsApp Business Cloud API resmi.
- Deployment: Docker dan Docker Compose.

## Sumber Kebenaran

Sebelum mengubah fitur, baca:

1. `docs/PRODUCT_REQUIREMENTS.md`
2. `docs/BUSINESS_RULES.md`
3. `docs/ARCHITECTURE.md`
4. Prompt tahap yang sedang dikerjakan

Jika terdapat konflik, prioritaskan:

1. Aturan bisnis
2. Keamanan data
3. Product requirements
4. Prompt tahap
5. Implementasi yang sudah ada

## Aturan Pengerjaan

- Kerjakan hanya ruang lingkup tahap yang diminta.
- Jangan mengubah stack utama tanpa instruksi eksplisit.
- Jangan menghapus fitur yang sudah bekerja.
- Gunakan migration untuk perubahan database.
- Jangan mengubah database secara manual.
- Tambahkan test untuk setiap aturan bisnis penting.
- Gunakan transaksi database untuk operasi approval dan perubahan status.
- Gunakan timezone `Asia/Jakarta`.
- Gunakan UTC untuk penyimpanan timestamp jika memungkinkan, lalu konversi untuk tampilan.
- Jangan menyimpan secret, token, atau credential di source code.
- Jangan menampilkan nomor WhatsApp pada portal publik.
- Gunakan soft delete untuk data guru yang memiliki relasi historis.
- Setiap perubahan sensitif harus dicatat dalam audit log.
- Jangan menyatakan selesai jika build atau test gagal.
- Jangan menggunakan library WhatsApp tidak resmi.

## Standar Kode

- TypeScript strict mode.
- Hindari penggunaan `any`.
- Gunakan DTO dan validation.
- Gunakan service layer untuk business logic.
- Controller tidak boleh memuat business logic kompleks.
- Gunakan repository/Prisma service untuk akses database.
- Gunakan nama yang jelas.
- Hindari duplikasi.
- Tambahkan komentar hanya jika logika tidak jelas dari kode.
- Format dengan Prettier.
- Lint dengan ESLint.

## Standar API

- Prefix API: `/api/v1`.
- Gunakan response error konsisten.
- Gunakan pagination pada endpoint daftar.
- Gunakan filter dan sorting yang tervalidasi.
- Lindungi endpoint menggunakan role guard.
- Dokumentasikan endpoint dengan Swagger.
- Jangan mengembalikan password hash atau credential.
- Portal publik wajib menggunakan rate limiting.

## Pemeriksaan Wajib Setiap Tahap

Jalankan perintah yang relevan:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

Untuk Flutter:

```bash
flutter analyze
flutter test
```

Untuk Docker:

```bash
docker compose config
docker compose build
```

Jika ada kegagalan:

1. Analisis akar masalah.
2. Perbaiki.
3. Jalankan ulang.
4. Dokumentasikan hasilnya.

## Laporan Setelah Selesai

Setelah setiap tahap, berikan:

- Ringkasan perubahan.
- Daftar file utama yang dibuat atau diubah.
- Migration yang ditambahkan.
- Test yang dibuat.
- Perintah yang dijalankan.
- Hasil lint, typecheck, test, dan build.
- Risiko atau pekerjaan lanjutan.
