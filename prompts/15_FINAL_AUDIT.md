# Tahap 15 — Audit Akhir

Lakukan audit menyeluruh terhadap requirement.

1. Bandingkan implementasi dengan seluruh dokumen.
2. Buat matriks fitur:
   - Requirement
   - Status
   - Lokasi implementasi
   - Test terkait
   - Catatan
3. Jalankan semua:
   - lint
   - typecheck
   - unit test
   - integration test
   - e2e
   - build web
   - build API
   - Flutter analyze
   - Flutter test
   - Docker build
4. Perbaiki semua kegagalan.
5. Cari TODO, FIXME, placeholder, dan secret.
6. Audit keamanan.
7. Audit performa query utama.
8. Audit akses role.
9. Audit dokumentasi.
10. Buat `docs/FINAL_AUDIT_REPORT.md`.
11. Buat `docs/RELEASE_CHECKLIST.md`.
12. Jangan menyatakan production-ready jika masih ada masalah kritis.
