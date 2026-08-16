# Tahap 02 — Database dan Seed

Implementasikan Prisma di `apps/api`.

Buat schema sesuai `docs/DATABASE_REQUIREMENTS.md`, termasuk:

- User
- RefreshToken
- Teacher
- Class
- LessonPeriod
- AcademicYear
- Semester
- SchoolHoliday
- Schedule
- AttendanceRecord
- AttendanceStatusHistory
- AttendanceChangeRequest
- ChangeRequestAttachment
- WhatsAppMessage
- Notification
- AuditLog
- SystemSetting

Tugas:

1. Definisikan enum status.
2. Tambahkan foreign key, unique constraint, dan index.
3. Terapkan soft delete yang diperlukan.
4. Buat migration pertama.
5. Buat seed data fiktif:
   - 1 super admin
   - 1 admin
   - 2 petugas piket
   - 10 guru
   - 6 kelas
   - 10 jam pelajaran
   - 1 tahun ajaran
   - 2 semester
   - jadwal Senin–Sabtu
6. Jangan menyimpan password plaintext.
7. Tambahkan Prisma service.
8. Tambahkan test constraint penting.
9. Jalankan migration dan seed.
10. Dokumentasikan ERD dalam Mermaid di `docs/ERD.md`.

Jangan membuat UI fitur.
