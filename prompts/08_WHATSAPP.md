# Tahap 08 — Integrasi WhatsApp

Buat interface `WhatsAppProvider`.

Implementasikan terlebih dahulu:

- MockWhatsAppProvider.
- Penyimpanan log.
- Template pesan.
- Status QUEUED, SENT, DELIVERED, FAILED.
- Retry terbatas.
- Tombol kirim ulang.
- Kegagalan pesan tidak membatalkan absensi.

Setelah mock stabil, buat adapter WhatsApp Business Cloud API resmi.

Credential dari environment:

- WHATSAPP_ACCESS_TOKEN
- WHATSAPP_PHONE_NUMBER_ID
- WHATSAPP_BUSINESS_ACCOUNT_ID
- WHATSAPP_VERIFY_TOKEN
- WHATSAPP_API_VERSION

Tambahkan webhook untuk status pesan jika memungkinkan.

Keamanan:

- Verifikasi webhook.
- Jangan mencatat access token.
- Sanitasi nomor tujuan.
- Rate limit resend.

Buat test mock, failure, retry, dan idempotency.
Dokumentasikan setup production di `docs/WHATSAPP_SETUP.md`.
