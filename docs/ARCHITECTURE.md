# Arsitektur Sistem

## Monorepo

```text
apps/
  web/       Next.js
  api/       NestJS
  mobile/    Flutter
packages/
  config/
  types/
  eslint-config/
  typescript-config/
docs/
```

Karena Flutter tidak menggunakan pnpm, folder mobile tetap berada di monorepo tetapi dikelola dengan tooling Flutter.

## Komponen

### Web

- Next.js App Router
- TypeScript
- Tailwind CSS
- TanStack Query
- React Hook Form
- Zod
- Authentication menggunakan secure HTTP-only cookie bila web berkomunikasi langsung dengan backend

### API

- NestJS
- Prisma
- PostgreSQL
- JWT access token dan refresh token
- RBAC guard
- Swagger
- Queue opsional untuk pengiriman WhatsApp
- Storage adapter untuk lampiran

### Mobile

- Flutter
- Riverpod
- Dio
- Secure storage
- Firebase Cloud Messaging

## Prinsip Arsitektur

- Satu backend untuk web dan mobile.
- Business logic berada di API.
- Web dan mobile tidak boleh menduplikasi aturan bisnis kritis.
- Integrasi eksternal menggunakan adapter.
- WhatsApp dimulai dengan mock provider.
- File storage menggunakan interface agar provider dapat diganti.
- Operasi approval menggunakan transaksi database.
- Semua event penting menghasilkan audit log.

## Modul Backend

- AuthModule
- UsersModule
- TeachersModule
- ClassesModule
- LessonPeriodsModule
- AcademicYearsModule
- SemestersModule
- SchedulesModule
- AttendanceModule
- AttendanceChangeRequestsModule
- WhatsAppModule
- NotificationsModule
- ReportsModule
- AuditLogsModule
- SettingsModule
- PublicPortalModule

## Deployment Awal

- Nginx atau reverse proxy
- Web container
- API container
- PostgreSQL container atau managed PostgreSQL
- Redis opsional untuk queue/rate limiting
- S3-compatible object storage
