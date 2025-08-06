# NEX Database Project

Bu proje dosyaları düzenli bir şekilde organize edilmiştir.

## Proje Yapısı

```
NEX/
├── pages/                          # HTML sayfaları
│   ├── index.html                  # Ana sayfa / Giriş
│   ├── database.html               # Ana panel
│   ├── profile.html                # Profil sayfası
│   ├── members.html                # Üyeler sayfası
│   ├── teams.html                  # Takımlar sayfası
│   ├── management.html             # Yönetim sayfası
│   ├── archive.html                # Arşiv sayfası
│   ├── awards.html                 # Ödüller sayfası
│   └── workshops.html              # Atölyeler sayfası
├── assets/                         # Statik dosyalar
│   ├── css/                        # CSS stil dosyaları
│   │   ├── style.css               # Ana stil dosyası
│   │   ├── database-style.css      # Veritabanı stilleri
│   │   ├── profile-style.css       # Profil stilleri
│   │   └── members-style.css       # Üyeler stilleri
│   ├── js/                         # JavaScript dosyaları
│   │   ├── nodes.js                # Node ağı
│   │   ├── database-script.js      # Veritabanı scripts
│   │   ├── profile-script.js       # Profil scripts
│   │   ├── members-script.js       # Üyeler scripts
│   │   └── global-features.js      # Global özellikler
│   └── images/                     # Resim dosyaları
│       ├── logo.png                # NEX logosu
│       ├── background.png          # Arkaplan resmi
│       ├── journal.png             # Dergi kapağı
│       ├── fsaccard.png            # FSAC kartı
│       └── nexcard.png             # NEX kartı
├── archive/                        # Yedek ve eski dosyalar
│   ├── database-new.html           # Yeni veritabanı sayfası (yedek)
│   ├── database-old.html           # Eski veritabanı sayfası (yedek)
│   ├── database-script-new.js      # Yeni veritabanı script (yedek)
│   ├── database-script-old.js      # Eski veritabanı script (yedek)
│   ├── profile-script-backup.js    # Profil script yedeği
│   ├── profile-script-new.js       # Yeni profil script (yedek)
│   └── test-debug.html             # Test/debug sayfası
├── LICENSE                         # Lisans dosyası
├── NEX.code-workspace             # VS Code workspace dosyası
└── README.md                      # Bu dosya
```

## Değişiklikler

- Tüm HTML dosyaları `pages/` klasörüne taşındı
- Tüm CSS dosyaları `assets/css/` klasörüne taşındı
- Tüm JavaScript dosyaları `assets/js/` klasörüne taşındı
- Tüm resim dosyaları `assets/images/` klasörüne taşındı
- Yedek ve eski dosyalar `archive/` klasöründe korundu
- Tüm dosyalardaki yollar yeni yapıya uygun şekilde güncellendi

## Kullanım

### Yöntem 1: Web Sunucusu ile (Önerilen)
1. Terminal/PowerShell'i açın ve proje klasörüne gidin:
   ```bash
   cd c:\NEX
   ```
2. Python web sunucusunu başlatın:
   ```bash
   python -m http.server 8000
   ```
3. Tarayıcınızda şu adresi açın:
   ```
   http://localhost:8000
   ```
   
### Yöntem 2: Doğrudan Dosya Açma
Projeyi doğrudan `pages/index.html` dosyasını bir web tarayıcısında açarak da kullanabilirsiniz.

## Not

Bu organizasyon sayesinde:
- Proje daha düzenli ve anlaşılır hale geldi
- Dosya türleri mantıklı klasörlerde gruplandı
- Yedek dosyalar ayrı bir klasörde korundu
- Gelecekteki geliştirmeler için daha iyi bir temel oluşturuldu
