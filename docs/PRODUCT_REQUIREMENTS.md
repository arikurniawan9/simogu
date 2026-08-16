# Product Requirements — Sistem Monitoring Kehadiran Guru

## 1. Ringkasan

Aplikasi digunakan untuk mencatat guru yang tidak hadir pada jam pelajarannya, mengirim pemberitahuan WhatsApp, memproses perubahan status melalui persetujuan admin, dan menyediakan portal riwayat kehadiran guru.

Aplikasi tersedia sebagai:

- Web responsif
- Aplikasi Android
- Aplikasi iOS
- Backend REST API terpusat

## 2. Peran Pengguna

### Super Admin

- Mengelola seluruh konfigurasi sistem.
- Mengelola akun admin dan petugas.
- Melihat audit log.
- Mengelola sekolah, tahun ajaran, semester, dan integrasi.

### Admin

- Mengelola data guru.
- Mengelola kelas, jam pelajaran, dan jadwal.
- Mengelola kehadiran.
- Menyetujui atau menolak pengajuan perubahan status.
- Melihat dashboard dan laporan.
- Mengatur template WhatsApp.

### Petugas Piket

- Mencari guru berdasarkan kode atau nama.
- Melihat jadwal guru hari ini.
- Menandai status pada jam tertentu.
- Mengajukan perubahan status.
- Melihat status pengajuan.
- Mengirim ulang pesan WhatsApp yang gagal jika diizinkan.

### Guru atau Pengguna Portal Publik

- Mencari guru menggunakan kode atau nama.
- Melihat ringkasan riwayat kehadiran.
- Tidak dapat melihat data sensitif.

## 3. Master Data Guru

Data minimal:

- Kode guru unik
- NIP opsional
- Nama lengkap
- Jenis kelamin
- Nomor WhatsApp
- Mata pelajaran utama
- Foto opsional
- Status aktif
- Timestamp
- Soft delete

Nomor Indonesia harus dinormalisasi menjadi format `62xxxxxxxxxxx`.

## 4. Kelas dan Jam Pelajaran

Admin dapat mengelola:

- Nama kelas
- Tingkat
- Jurusan
- Wali kelas
- Jam ke-
- Jam mulai
- Jam selesai
- Status aktif

## 5. Jadwal Mengajar

Jadwal memuat:

- Guru
- Hari
- Jam pelajaran
- Kelas
- Mata pelajaran
- Tahun ajaran
- Semester
- Periode berlaku
- Status aktif

Sistem mencegah bentrok guru dan bentrok kelas.

## 6. Absensi Piket

Alur:

1. Petugas login.
2. Mencari guru.
3. Sistem menampilkan jadwal guru hari itu.
4. Petugas memilih satu atau beberapa jam.
5. Petugas menetapkan status.
6. Sistem menyimpan pencatat, waktu, kelas, jam, dan catatan.
7. Sistem membuat pesan WhatsApp.
8. Sistem menyimpan log pengiriman.

Status:

- PRESENT
- ABSENT_PENDING_CONFIRMATION
- PERMISSION
- SICK
- OFFICIAL_DUTY
- LATE
- WITHOUT_EXPLANATION
- CANCELLED

## 7. Pengajuan Perubahan Status

Petugas tidak dapat mengubah catatan final secara langsung.

Alur:

1. Petugas membuat change request.
2. Memilih status baru.
3. Mengisi alasan.
4. Mengunggah bukti opsional.
5. Admin meninjau.
6. Admin menyetujui atau menolak.
7. Jika disetujui, status kehadiran berubah secara transaksional.
8. Riwayat lama tetap tersimpan.
9. Audit log dibuat.

## 8. WhatsApp

Gunakan WhatsApp Business Cloud API resmi.

Pesan contoh:

> Pemberitahuan Kehadiran Guru  
> Bapak/Ibu Ari Kurniawan tercatat belum hadir mengajar.  
> Hari/Tanggal: Senin, 3 Agustus 2026  
> Jam Pelajaran: Jam ke-5  
> Kelas: VIII A  
> Mata Pelajaran: Matematika  
> Silakan menghubungi petugas piket untuk konfirmasi.  
> Pesan ini dikirim otomatis oleh Sistem Monitoring Kehadiran Guru.

Kegagalan WhatsApp tidak boleh membatalkan penyimpanan absensi.

## 9. Portal Guru

Portal publik menyediakan:

- Pencarian kode atau nama.
- Disambiguasi guru dengan nama sama.
- Filter periode.
- Ringkasan izin, sakit, tugas dinas, tanpa keterangan, dan terlambat.
- Riwayat per jam pelajaran.

Jika tidak ada catatan ketidakhadiran:

> Terima kasih, Bapak/Ibu [Nama Guru], sudah selalu masuk kelas dan melaksanakan jadwal pembelajaran dengan baik.

Nomor WhatsApp dan informasi sensitif tidak boleh ditampilkan.

## 10. Dashboard

Dashboard admin menampilkan:

- Guru aktif
- Jadwal hari ini
- Ketidakhadiran hari ini
- Izin
- Sakit
- Tugas dinas
- Tanpa keterangan
- Pengajuan menunggu
- Pesan WhatsApp gagal

## 11. Laporan

Laporan:

- Harian
- Mingguan
- Bulanan
- Semester
- Per guru
- Per kelas
- Per mata pelajaran
- Per status
- Jam kosong
- Pengajuan perubahan
- Log WhatsApp

Format:

- Tampilan web
- Excel
- PDF

## 12. Mobile

Aplikasi Flutter untuk admin terbatas dan petugas piket:

- Login
- Jadwal hari ini
- Cari guru
- Catat absensi
- Ajukan perubahan
- Notifikasi
- Profil
- Logout

## 13. Audit Log

Catat:

- Login dan logout
- CRUD master data
- Perubahan jadwal
- Pencatatan absensi
- Pengajuan perubahan
- Approval dan rejection
- Pengiriman WhatsApp
- Ekspor laporan
- Perubahan pengaturan

## 14. Non-Functional Requirements

- Responsif
- Aman
- Mudah digunakan
- Bahasa Indonesia
- Mendukung timezone Asia/Jakarta
- Database dapat di-backup
- API terdokumentasi
- Siap Docker
- Siap staging dan produksi
