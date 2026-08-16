# Tahap 07 — Persetujuan Perubahan Status

Implementasikan change request.

Petugas:

- Membuka attendance record.
- Mengajukan status baru.
- Mengisi alasan.
- Mengunggah bukti opsional.
- Melihat status pengajuan.

Admin:

- Melihat daftar menunggu.
- Membuka detail.
- Melihat status lama dan usulan baru.
- Menyetujui.
- Menolak dengan catatan.

Aturan:

- Status attendance hanya berubah saat approval.
- Approval menggunakan transaksi.
- Status lama disimpan di history.
- Petugas tidak dapat menyetujui sendiri.
- Request yang selesai tidak dapat diproses ulang.
- Cegah race condition dua admin.
- Semua aktivitas masuk audit log.
- Lampiran divalidasi.

Buat test concurrency, authorization, approval, dan rejection.
