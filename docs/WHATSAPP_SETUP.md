# Dokumentasi Setup WhatsApp Business Cloud API (Production)

Dokumen ini menjelaskan langkah-langkah konfigurasi integrasi **WhatsApp Business Cloud API resmi dari Meta** pada aplikasi SIMOGU.

---

## 🔑 1. Variable Lingkungan (Environment Variables)

Tambahkan variabel berikut pada file `.env` di server API (`apps/api/.env`):

```env
# Meta WhatsApp Cloud API Configuration
WHATSAPP_ACCESS_TOKEN="EAAG..."
WHATSAPP_PHONE_NUMBER_ID="1006..."
WHATSAPP_BUSINESS_ACCOUNT_ID="1098..."
WHATSAPP_VERIFY_TOKEN="simogu_wa_verify_token_123"
WHATSAPP_API_VERSION="v18.0"
```

Jika variabel `WHATSAPP_ACCESS_TOKEN` dan `WHATSAPP_PHONE_NUMBER_ID` diisi, SIMOGU secara otomatis beralih dari `MockWhatsAppProvider` ke `CloudApiWhatsAppProvider`.

---

## 📡 2. Konfigurasi Webhook Meta

1. Masuk ke **Meta for Developers Dashboard**: [https://developers.facebook.com/](https://developers.facebook.com/)
2. Pilih aplikasi SIMOGU Anda ➔ **WhatsApp** ➔ **Configuration**.
3. Di bagian **Webhook**, masukkan:
   - **Callback URL**: `https://api.simogu.sch.id/api/v1/whatsapp/webhook`
   - **Verify Token**: Nilai yang sesuai dengan `WHATSAPP_VERIFY_TOKEN` (contoh: `simogu_wa_verify_token_123`).
4. Klik **Verify and Save**.
5. Subskripsikan event: `messages`.

---

## 🛡️ 3. Fitur Keamanan & Reliabilitas

- **Non-blocking Outbox**: Kegagalan koneksi ke API WhatsApp tidak membatalkan transaksi pencatatan absensi guru.
- **Penyimpanan Outbox (`WhatsAppMessage`)**: Setiap pesan dicatat dengan status `PENDING`, `SENT`, atau `FAILED`.
- **Fitur Retry Massal**: Admin dapat memicu kirim ulang (*resend*) pesan yang gagal melalui Dashboard Web.
- **Sanitasi Nomor**: Nomor Indonesia otomatis disanitasi ke format internasional tanpa tanda plus (`628xxxxxxxxxx`).
