# Perintah Codex CLI yang Disarankan

## Mulai Tahap

```text
Baca AGENTS.md, seluruh dokumen yang relevan di folder docs, dan prompts/XX_NAMA_TAHAP.md.
Kerjakan hanya tahap tersebut. Jalankan seluruh pemeriksaan yang diwajibkan.
```

## Meminta Audit Sebelum Commit

```text
Audit perubahan tahap ini terhadap AGENTS.md dan docs/DEFINITION_OF_DONE.md.
Perbaiki masalah yang ditemukan, jalankan ulang seluruh test, lalu berikan ringkasan.
```

## Meminta Codex Melanjutkan dari Error

```text
Lanjutkan dari kondisi repository saat ini.
Jangan mengulang proyek dari awal.
Analisis error terakhir, perbaiki akar masalah, tambahkan regression test, lalu jalankan ulang pemeriksaan.
```

## Commit Git yang Disarankan

```bash
git add .
git commit -m "feat: complete stage XX"
```

## Pemeriksaan Manual

```bash
git status
git diff --stat
git diff
```
