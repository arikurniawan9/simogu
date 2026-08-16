# Aturan Bisnis

1. Absensi hanya boleh dibuat untuk jadwal aktif.
2. Satu jadwal hanya memiliki satu attendance record per tanggal.
3. Ketidakhadiran dihitung per jam pelajaran.
4. Petugas tidak boleh membuat absensi ganda.
5. Petugas tidak boleh mengubah status final secara langsung.
6. Perubahan status memerlukan persetujuan admin.
7. Petugas tidak boleh menyetujui pengajuannya sendiri.
8. Status lama wajib tetap tercatat.
9. Approval harus menggunakan transaksi database.
10. Semua perubahan status masuk audit log.
11. Guru yang mempunyai data historis tidak boleh dihapus permanen.
12. Hari libur tidak dihitung sebagai ketidakhadiran.
13. Jadwal harus terikat tahun ajaran dan semester.
14. Guru tidak boleh memiliki dua kelas pada jam yang sama.
15. Kelas tidak boleh memiliki dua guru pada jam yang sama.
16. Nomor WhatsApp tidak tampil di portal publik.
17. Pencarian publik dibatasi dengan rate limiting.
18. Nama guru sama harus dibedakan dengan kode guru.
19. Kegagalan WhatsApp tidak membatalkan absensi.
20. Semua waktu tampilan menggunakan Asia/Jakarta.
21. Admin harus melihat status lama dan status baru sebelum approval.
22. Lampiran bukti hanya menerima tipe dan ukuran yang diizinkan.
23. Audit log tidak dapat diedit petugas.
24. Data hasil laporan mengikuti status terkini tetapi menyediakan jejak perubahan.
25. Pencatatan massal beberapa jam harus atomik atau memberikan hasil jelas per item.
