# Entity Relationship Diagram (ERD) — SIMOGU

Diagram relasi entitas PostgreSQL untuk Sistem Monitoring Kehadiran Guru (SIMOGU).

```mermaid
erDiagram
    User ||--o| Teacher : "memiliki profile guru (opsional)"
    User ||--o{ RefreshToken : "memiliki"
    User ||--o{ AttendanceRecord : "mencatat"
    User ||--o{ AttendanceStatusHistory : "mengubah status"
    User ||--o{ AttendanceChangeRequest : "mengajukan"
    User ||--o{ AttendanceChangeRequest : "meninjau"
    User ||--o{ Notification : "menerima"
    User ||--o{ AuditLog : "melakukan aktivitas"

    Teacher ||--o{ Class : "wali kelas dari"
    Teacher ||--o{ Schedule : "memiliki jadwal mengajar"
    Teacher ||--o{ WhatsAppMessage : "menerima pesan WA"

    Class ||--o{ Schedule : "memiliki jadwal kelas"

    LessonPeriod ||--o{ Schedule : "digunakan pada jam pelajaran"

    AcademicYear ||--o{ Semester : "memiliki semester"
    Semester ||--o{ Schedule : "berlaku pada semester"

    Schedule ||--o{ AttendanceRecord : "menghasilkan catatan absensi"

    AttendanceRecord ||--o{ AttendanceStatusHistory : "memiliki riwayat perubahan"
    AttendanceRecord ||--o{ AttendanceChangeRequest : "memiliki pengajuan perubahan"
    AttendanceRecord ||--o{ WhatsAppMessage : "memicu pesan WA"

    AttendanceChangeRequest ||--o{ ChangeRequestAttachment : "memiliki bukti lampiran"
```

---

## Ringkasan Entitas Utama

1. **User**: Pengguna sistem (`SUPER_ADMIN`, `ADMIN`, `PIKET`, `GURU`).
2. **Teacher**: Master data guru dengan kode unik (`teacherCode`) dan soft delete (`deletedAt`).
3. **Class**: Data kelas dan wali kelas (`homeroomTeacherId`).
4. **LessonPeriod**: Jam pelajaran ke-1 s/d ke-10 beserta jam mulai/selesai.
5. **AcademicYear & Semester**: Tahun ajaran dan semester aktif (`ODD` / `EVEN`).
6. **Schedule**: Jadwal mengajar (Bebas bentrok per guru dan per kelas).
7. **AttendanceRecord**: Catatan absensi per jadwal per tanggal (`scheduleId + attendanceDate` UNIQUE).
8. **AttendanceChangeRequest**: Pengajuan perubahan status absensi yang memerlukan approval Admin secara transaksional.
9. **WhatsAppMessage**: Log status pengiriman notifikasi WA.
10. **AuditLog**: Catatan audit jejak aktivitas sistem.
