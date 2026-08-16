# Tahap 09 — Portal Guru

Buat portal publik responsif.

Fitur:

- Cari kode atau nama.
- Autocomplete yang aman.
- Disambiguasi nama sama.
- Gunakan public identifier, bukan database ID berurutan.
- Tampilkan ringkasan status.
- Tampilkan riwayat tanggal, jam, kelas, mata pelajaran, status, keterangan.
- Filter bulan, semester, tahun ajaran, status.
- Pesan penghargaan jika tidak ada catatan negatif.

Keamanan:

- Jangan tampilkan nomor WhatsApp.
- Jangan tampilkan data internal.
- Rate limiting.
- Batasi hasil.
- Sanitasi output.
- Pertimbangkan CAPTCHA setelah pola penggunaan mencurigakan.
- Hindari enumeration.

Buat accessibility check dan end-to-end test.
