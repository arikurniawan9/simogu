# Tahap 06 — Absensi Piket

Implementasikan alur petugas piket.

UI piket:

- Tanggal dan hari.
- Daftar jadwal hari ini.
- Pencarian kode atau nama guru.
- Hasil profil singkat.
- Daftar jam, kelas, dan mata pelajaran.
- Tombol status per jadwal.
- Pemilihan beberapa jam.
- Dialog konfirmasi.
- Catatan.

Backend:

- Buat absensi satu jam.
- Buat absensi beberapa jam.
- Cegah duplikasi.
- Hanya jadwal aktif.
- Simpan petugas pencatat.
- Simpan originalStatus dan currentStatus.
- Buat history.
- Buat audit log.
- Gunakan transaksi bila pencatatan massal.
- Gunakan timezone Asia/Jakarta.

Status awal ketidakhadiran dapat berupa `ABSENT_PENDING_CONFIRMATION`.

Buat unit, integration, dan end-to-end test.
Belum perlu WhatsApp production; gunakan event atau stub.
