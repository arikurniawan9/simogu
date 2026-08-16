# Kebutuhan Database

Gunakan PostgreSQL dan Prisma.

## Entitas

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

## Constraint Penting

- `Teacher.teacherCode` unik.
- `User.username` unik.
- `User.email` unik jika tidak null.
- Attendance unik berdasarkan `scheduleId + attendanceDate`.
- Jadwal unik dan bebas bentrok berdasarkan guru, hari, periode, semester.
- Jadwal kelas juga bebas bentrok.
- Semester harus berada di dalam tahun ajaran.
- Refresh token disimpan dalam bentuk hash.
- Gunakan index pada foreign key, tanggal, status, kode guru, nama guru, dan field pencarian.

## Soft Delete

Gunakan `deletedAt` untuk:

- Teacher
- User bila diperlukan
- Class bila diperlukan

## Audit

Simpan snapshot data lama dan baru dalam JSON yang sudah disanitasi. Jangan menyimpan password atau token.
