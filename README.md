## NEX Database

Modern, çok sayfalı bir kulüp/organizasyon veri portalı. Anasayfa (journal + takvim), Üyeler, Takımlar, Yönetim, Profil, Raporlar ve daha fazlasını içerir. Tema (aydınlık/karanlık), oturum yönetimi, admin/safe mod, dinamik etkinlikler ve üyeler listesi gibi gelişmiş özelliklerle gelir.

### Öne Çıkan Özellikler
- Aydınlık/Karanlık tema düğmesi (persist edilir)
- Güvenli Mod / Admin Mod geçişi (sadece admin rolü görür/kullanır)
- Oturum sayacı ve uyarıları (40 dk varsayılan)
- Üst menü + yan menü navigasyonu, aktif sayfa vurgusu
- Üyeler sayfası: toplam üye sayısı + liste (backend üzerinden)
- Anasayfa takvim: günlere tıklayınca gün etkinlikleri modalı
- “Etkinlik Ekle” (sadece admin), backend’e kayıt + takvimi otomatik yenileme
- PDF ve diğer sayfa bileşenleri (journal ilerleme vb.)

### Dizin Yapısı (kısaltılmış)
- `pages/` HTML sayfaları (index, database, members, profile, vb.)
- `assets/js/` istemci JS dosyaları
  - `backend-api.js`: backend’e istek yardımcıları (baseURL burada)
  - `global-features.js`: tema, admin görünürlüğü, oturum özellikleri
  - `database-script.js`: anasayfa (journal + takvim + etkinlikler)
  - `members-script.js`: üyeler sayfası (sayaç + liste)
- `assets/css/` stiller
- `assets/images/` görseller

### Backend Gereksinimleri (PHP)
Frontend statiktir. Veri (login/üyeler/etkinlikler) için bir PHP backend’e ihtiyaç duyar.
- Örnek yerel kurulum: XAMPP
  - Frontend: `C:/xampp/htdocs/nex-database`
  - Backend: `C:/xampp/htdocs/nex-backend`
- PHP 7.4+ (önerilir), MySQL/MariaDB

#### Gerekli Endpointler (özet)
- `login.php`: giriş (POST, `{ email, password, rememberMe }`)
- `users.php`:
  - `GET ?action=count` → `{ success, total }`
  - `GET ?action=list` → `{ success, items: [...] }` (name, email, photo_url, institution, rank, role, position, created_at)
  - `POST ?action=delete` (opsiyonel)
- `events.php`:
  - `GET ?action=list` → `{ success, items: [...] }` (id, name, type, event_date, start_time, end_time)
  - `POST ?action=create` → yeni etkinlik ekler ({ name, type, event_date, start_time?, end_time? })
- `cors.php`: CORS başlıkları ve OPTIONS preflight için include edilir.

> Not: Repo backend kodlarını içermez. Yukarıdaki endpointler için örnek PHP şablonları proje açıklamaları/sohbet notlarında paylaşılmıştır; kendi ortamınıza göre DB erişim bilgilerini düzenleyin.

#### Veritabanı Şeması (öneri)
- `users` tablosu: `id, name, email, phone, photo_url, institution, rank, role, position, created_at, updated_at`
- `events` tablosu: `id, name, type, event_date (DATE), start_time (TIME, null), end_time (TIME, null), created_at, updated_at`

### Kurulum ve Çalıştırma
1) Frontend’i servis edin
- Yerel: `http://localhost/nex-database/pages/index.html`
- Prod (öneri): GitHub Pages veya başka bir CDN/host

2) Backend’i ayarlayın
- Yerel: `http://localhost/nex-backend`
- Prod: HTTPS bir alan adı/alt alan adı (`https://api.sizin-domain.com/nex-backend` gibi)
- CORS: `backend/cors.php` ile izin verilen origin’leri ekleyin. GitHub Pages kullanıyorsanız `https://kullaniciadiniz.github.io` origin’ini tanımlayın.

3) Frontend → Backend bağlantısı
- `assets/js/backend-api.js` içindeki `baseURL` varsayılanı yereli gösterir.
- Prod’da tarayıcıda aşağıdakilerden biri ile override edebilirsiniz:
  - Konsol: `localStorage.setItem('backendBaseURL','https://api.sizin-domain.com/nex-backend'); location.reload();`
  - Veya sayfaya global: `window.__BACKEND_BASE_URL__ = 'https://api.sizin-domain.com/nex-backend'`

4) Giriş
- `pages/index.html` üzerinden giriş yapın.
- `global-features.js` rol bilgisi geldikten sonra admin görünürlüklerini otomatik uygular (sadece admin rolü admin/safe mod düğmesini görür).

### Kullanım İpuçları
- Tema: Üst barda güneş/ay ikonuna tıklayın; tema tercihi `localStorage`’a kaydedilir.
- Üyeler: Sayaç ve liste backend verisiyle doldurulur (toplam sayı `users.php?action=count`).
- Takvim:
  - Günlere tıkladığınızda “Gün Etkinlikleri” modalı açılır.
  - Admin iseniz “Etkinlik Ekle” ile form açılır ve `events.php?action=create`’e kaydedilir.

### Dağıtım ve Güvenlik
- Frontend HTTPS altında ise backend de HTTPS olmalıdır (mixed content engeli).
- CORS tek bir kaynaktan set edilmelidir (PHP veya .htaccess). Aynı anda iki farklı `Access-Control-Allow-Origin` başlığı set edilmemelidir.

### Lisans
- Bu proje bir lisans dosyası (`LICENSE`) içerir. Detaylar için dosyayı inceleyin.

### İletişim / Katkı
- Sorun bildirmek veya katkıda bulunmak için pull request/issue açabilirsiniz.
- Kodda açıklanan endpoint ve DB alanlarını kendi ihtiyaçlarınıza göre genişletebilirsiniz.
