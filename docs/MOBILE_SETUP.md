# Panduan Kompilasi & Deployment Aplikasi Mobile Flutter SIMOGU

Dokumen ini menjelaskan langkah-langkah membangun (*build*) aplikasi mobile **SIMOGU** untuk platform **Android (.aab / .apk)** dan **iOS (.ipa)**.

---

## 🛠️ 1. Prasyarat Lingkungan Development

- **Flutter SDK**: v3.19.0 atau yang lebih baru
- **Dart SDK**: v3.3.0 atau yang lebih baru
- **Android Studio / Xcode**: Terinstall SDK Android 34 / Xcode 15+
- **CocoaPods** (untuk iOS): `pod --version` >= 1.14.0

---

## 📦 2. Menjalankan Perintah Pengujian & Analisis Kode

Jalankan perintah berikut pada direktori `apps/mobile`:

```bash
# Formatter & Linter check
flutter analyze

# Running Unit & Widget Tests
flutter test
```

---

## 🤖 3. Build APK Debug & Production Android App Bundle (.aab)

```bash
# Build APK Debug
flutter build apk --debug

# Build Release Android App Bundle (.aab) untuk Google Play Store
flutter build appbundle --release
```

Hasil kompilasi AAB berada di:
`apps/mobile/build/app/outputs/bundle/release/app-release.aab`

---

## 🍎 4. Build IPA Release iOS App Store

```bash
# Install pod dependencies
cd ios && pod install && cd ..

# Build release IPA
flutter build ipa --release
```

Hasil kompilasi IPA berada di:
`apps/mobile/build/ios/archive/Runner.xcarchive`
