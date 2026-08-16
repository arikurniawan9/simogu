# SIMOGU — Sistem Monitoring Kehadiran Guru

SIMOGU adalah aplikasi monorepo terpadu untuk pencatatan, pemantauan, notifikasi WhatsApp, dan persetujuan perubahan status kehadiran guru per jam pelajaran secara real-time.

---

## 🚀 Perangkat & Teknologi Utama

- **Monorepo**: `pnpm workspace`
- **Web (`apps/web`)**: Next.js 14 (App Router), TypeScript, Tailwind CSS (Smooth Emerald Theme & Dark/Light Mode), Framer Motion.
- **Backend API (`apps/api`)**: NestJS, TypeScript, PostgreSQL, Prisma ORM, Swagger OpenAPI (`/api/v1`).
- **Mobile App (`apps/mobile`)**: Flutter SDK (Riverpod, Dio, Secure Storage).
- **Shared Packages (`packages/*`)**: `@simogu/types`, `@simogu/typescript-config`.

---

## 🛠️ Cara Instalasi & Penggunaan

### 1. Prasyarat
- Node.js `^20.0.0` atau `^22.0.0`
- pnpm `^9.0.0` atau `^11.0.0`
- PostgreSQL (atau via Docker Compose)

### 2. Install Dependencies
```bash
pnpm install
```

### 3. Setup Environment Variables
Salin file `.env.example` ke `.env`:
```bash
cp .env.example .env
```

### 4. Menjalankan Server Pengembangan (Dev Mode)
Jalankan aplikasi Web dan API secara bersamaan:
```bash
pnpm dev
```
- **Web App**: `http://localhost:3000`
- **REST API**: `http://localhost:3001/api/v1`
- **Swagger Docs**: `http://localhost:3001/api/docs`

---

## 🧪 Perintah Pemeriksaan Wajib

```bash
# Linting kode di seluruh monorepo
pnpm lint

# TypeScript Typecheck
pnpm typecheck

# Unit Testing
pnpm test

# Build Production Bundles
pnpm build
```

---

## 🎨 Fitur UI/UX Kustom SIMOGU
- **Theme**: Smooth Emerald Green (`#10B981`) & Dark Forest (`#065F46`).
- **Dark/Light Mode**: Dukungan perpindahan mode terang & gelap yang cepat dan nyaman di mata.
- **Responsive Confirmation Modal**: Reusable component `ConfirmationModal` dengan efek backdrop blur dan animasi mikro.
- **Universal DataTable**: Dilengkapi fitur *instant search input*, paginasi fleksibel, dan *skeleton loader*.
