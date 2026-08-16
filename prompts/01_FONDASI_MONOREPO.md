# Tahap 01 — Fondasi Monorepo

Baca `AGENTS.md` dan seluruh dokumen di folder `docs`.

Kerjakan:

1. Inisialisasi Git bila belum ada.
2. Buat pnpm workspace.
3. Buat:
   - `apps/web` dengan Next.js, TypeScript, App Router, Tailwind.
   - `apps/api` dengan NestJS dan TypeScript.
   - `apps/mobile` sebagai proyek Flutter minimal.
4. Buat shared configuration untuk ESLint, Prettier, dan TypeScript.
5. Aktifkan TypeScript strict mode.
6. Buat root scripts:
   - lint
   - typecheck
   - test
   - build
   - dev
7. Buat Docker Compose awal untuk PostgreSQL.
8. Tambahkan health endpoint di API.
9. Buat halaman awal web yang menampilkan status proyek.
10. Buat `.env.example` tanpa credential asli.
11. Perbarui README dengan cara instalasi.
12. Jalankan lint, typecheck, test, build, dan Flutter analyze.

Jangan membuat fitur bisnis.
