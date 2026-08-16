# Laporan Hasil Audit Keamanan & Hardening SIMOGU

Dokumen ini berisi rangkuman audit keamanan sistem, pengerasan (*security hardening*), dan verifikasi matriks otorisasi SIMOGU.

---

## 🛡️ 1. Matriks Otorisasi & Peran Pengguna (RBAC)

| Modul / Endpoint | Role Diizinkan | Proteksi Guard | Result Audit |
| :--- | :--- | :--- | :--- |
| `POST /api/v1/auth/login` | Public | None | LULUS |
| `GET /api/v1/teachers` | `SUPER_ADMIN`, `ADMIN`, `PIKET` | `JwtAuthGuard`, `RolesGuard` | LULUS |
| `POST /api/v1/teachers` | `SUPER_ADMIN`, `ADMIN` | `JwtAuthGuard`, `RolesGuard` | LULUS |
| `POST /api/v1/change-requests/:id/approve` | `SUPER_ADMIN`, `ADMIN` (Tanpa Self-Approval) | Transaction & Role Guard | LULUS |
| `GET /api/v1/teachers/public/summary/:code` | Public | Public Data Sanitization | LULUS (Masking No. WA) |

---

## 🔒 2. Fitur Pengerasan Keamanan (Security Hardening)

1. **HTTP Security Headers (Helmet)**:
   - Penggunaan `helmet()` pada `apps/api/src/main.ts` untuk mengamankan HSTS, Content-Security-Policy, X-Frame-Options (Clickjacking protection), X-Content-Type-Options (MIME sniffing protection).
2. **Proteksi Akses Data Sensitif Guru**:
   - Nomor telepon WhatsApp dan email internal guru secara eksplisit di-masking atau disembunyikan dari portal publik.
3. **Pencatatan Audit Log & Transaksi Database**:
   - Seluruh perubahan status absensi sensitif dan approval di-wrap dalam PostgreSQL `$transaction` dan dicatat ke dalam tabel `AuditLog`.
4. **Pencegahan Concurrency & Race Conditions**:
   - `AttendanceChangeRequest` memiliki proteksi status lock (`status === PENDING`) dalam transaksi untuk mencegah double approval dari dua admin bersamaan.
5. **Normalisasi Nomor Telepon WhatsApp**:
   - Format nomor disanitasi menggunakan regex validator (`08xxx` / `+628xxx` -> `628xxx`).
