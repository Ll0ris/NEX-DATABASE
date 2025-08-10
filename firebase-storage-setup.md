# Firebase Storage Kurulum Talimatları

## ⚠️ ÖNEMLİ: Firebase Storage henüz etkinleştirilmemiş!

CORS hatası aldığınız için Storage'ı etkinleştirmeniz gerekiyor.

## 1. Firebase Console'a giriş yapın
- https://console.firebase.google.com/ adresine gidin
- "nex-database" projenizi seçin

## 2. Storage'ı etkinleştirin
- Sol menüden **"Storage"** seçeneğine tıklayın
- **"Get started"** butonuna tıklayın
- Security rules ekranında **"Start in test mode"** seçin
- **"Next"** butonuna tıklayın
- Location olarak **"europe-west1"** veya size en yakın bölgeyi seçin
- **"Done"** butonuna tıklayın

## 3. Güvenlik Kuralları (Test için)
Storage > Rules sekmesinde aşağıdaki kuralları kullanın:

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if true; // Test modu - üretimde güvenlik ekleyin
    }
  }
}
```

## 4. CORS Ayarları (İsteğe bağlı)
Eğer hala CORS hatası alıyorsanız, Google Cloud Shell'de:

```bash
gsutil cors set cors.json gs://nex-database.appspot.com
```

cors.json dosyası:
```json
[
  {
    "origin": ["*"],
    "method": ["GET", "POST", "PUT", "DELETE"],
    "maxAgeSeconds": 3600
  }
]
```

## 5. Kurulum Kontrolü
- Database sayfasını yenileyin
- Admin Panel > Console > "Firebase Bağlantı Testi" butonuna tıklayın
- Storage durumunu kontrol edin

## 📝 Not
Storage etkinleştirilene kadar:
- Journal verileri Firestore'a kaydedilir
- PDF dosyaları yüklenemez
- Sistem normal çalışmaya devam eder
