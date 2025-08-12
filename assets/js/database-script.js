document.addEventListener('DOMContentLoaded', function() {
    // Global değişkenler
    let currentJournalPdfUrl = null; // PDF URL'sini tutacağız
    let currentJournal = null; // Şu an ekranda gösterilen journal verisi
    
    // Element seçicileri
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    const sidePanel = document.getElementById('sidePanel');
    const overlay = document.getElementById('overlay');
    const themeToggle = document.getElementById('themeToggle');
    const themeIcon = themeToggle ? themeToggle.querySelector('.theme-icon') : null;
    const profileSection = document.getElementById('profileSection');
    const profileDropdown = document.getElementById('profileDropdown');
    const welcomeBubble = document.getElementById('welcomeBubble');

    // Hoş geldiniz bubble'ı kontrol et
    function checkWelcomeBubble() {
        // URL parametresinden gelen durumu kontrol et
        const urlParams = new URLSearchParams(window.location.search);
        const fromLogin = urlParams.get('welcome');
        
        if (fromLogin === 'true') {
            showWelcomeBubble();
            // URL'den parametreyi temizle
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    }

    // Hoş geldiniz bubble'ını göster
    function showWelcomeBubble() {
        if (!welcomeBubble) return;
        
        welcomeBubble.classList.remove('hide', 'animate-out');
        welcomeBubble.classList.add('show', 'animate-in');
        
        // 1.5 saniye sonra kaybolsun
        setTimeout(() => {
            welcomeBubble.classList.remove('show', 'animate-in');
            welcomeBubble.classList.add('hide', 'animate-out');
            
            // Animasyon tamamlandıktan sonra sınıfları temizle
            setTimeout(() => {
                welcomeBubble.classList.remove('hide', 'animate-out');
            }, 500);
        }, 1500);
    }

    // Sayfa yüklendiğinde hoş geldiniz kontrolü yap
    checkWelcomeBubble();

    // Journal fonksiyonları
    function initializeJournal() {
        // Admin yetkisi kontrolü (örnek - gerçek sistemde backend'den gelecek)
        const isAdmin = true; // Bu değer gerçek sistemde dinamik olacak
        
        if (isAdmin) {
            document.body.classList.add('admin-user');
            // Admin-mode'u kaldır - sadece admin moduna geçilince eklenir
            document.body.classList.remove('admin-mode');
        }

        // Deadline güncellemesi backend'den gelen gün sayısına göre yapılır

        // Progress bar animasyonu
        animateProgressBar();

        // Backend'den mevcut journal'ı yükle
        loadJournalsFromBackend()
            .then(() => {})
            .catch((e) => console.warn('Journal yükleme (backend) hatası:', e));
    }

    function updateDeadline() {
        const deadlineDate = new Date('2026-05-23');
        const today = new Date();
        const timeDiff = deadlineDate.getTime() - today.getTime();
        const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
        
        const deadlineCounter = document.getElementById('deadlineCounter');
        if (deadlineCounter) {
            if (daysDiff > 0) {
                deadlineCounter.textContent = `${daysDiff}d`;
                deadlineCounter.style.color = 'var(--primary-color)';
            } else if (daysDiff === 0) {
                deadlineCounter.textContent = 'BUGÜN!';
                deadlineCounter.style.color = '#ff6b6b';
            } else {
                deadlineCounter.textContent = `${Math.abs(daysDiff)}d geçti`;
                deadlineCounter.style.color = '#ff4757';
            }
        }
    }

    function animateProgressBar() {
        // Firebase verisi yüklenmeden önce placeholder göster
        const progressFill = document.querySelector('.progress-fill');
        const progressText = document.querySelector('.progress-text');
        
        if (progressFill && progressText) {
            // Firebase yüklenene kadar loading animasyonu ekle
            progressFill.style.transition = 'width 0.3s ease-in-out';
        }
    }

    // Journal'ı başlat
    initializeJournal();

    // Journal buton event listener'ları
    const btnAbout = document.querySelector('.btn-about');
    const btnRead = document.querySelector('.btn-read');
    const btnEdit = document.querySelector('.btn-edit');

    if (btnAbout) {
        btnAbout.addEventListener('click', function() {
            // Hakkında modalı veya sayfası açılacak
            // showAboutModal(); // Bu fonksiyon sonra eklenecek
        });
    }

    // Oku butonu HTML'de onclick ile hallediliyor, JavaScript event listener gerekmiyor
    if (!btnRead) {
        console.warn('⚠️ Oku butonu bulunamadı! Selector: .btn-read');
    }

    if (btnEdit) {
        btnEdit.addEventListener('click', function() {
            // Düzenleme formunu göster
            showJournalEditForm();
        });
    }

    // Calendar fonksiyonları
    async function initializeCalendar() {
        // Admin yetkisi kontrolü (örnek - gerçek sistemde backend'den gelecek)
        const isAdmin = true; // Bu değer gerçek sistemde dinamik olacak
        
        if (isAdmin) {
            document.body.classList.add('admin-user');
            // Admin-mode'u kaldır - sadece admin moduna geçilince eklenir
            document.body.classList.remove('admin-mode');
        }

        // Etkinlikleri yükle ve ardından takvimi başlat
        await loadEventsFromBackend();
        generateCalendar();
        loadUpcomingEvents();
        
        // Takvim navigasyon event listener'ları
        const prevMonthBtn = document.getElementById('prevMonthBtn');
        const nextMonthBtn = document.getElementById('nextMonthBtn');
        
        if (prevMonthBtn) {
            prevMonthBtn.addEventListener('click', () => {
                currentDate.setMonth(currentDate.getMonth() - 1);
                generateCalendar();
            });
        }
        
        if (nextMonthBtn) {
            nextMonthBtn.addEventListener('click', () => {
                currentDate.setMonth(currentDate.getMonth() + 1);
                generateCalendar();
            });
        }
    }

    // Takvim değişkenleri
    let currentDate = new Date();
    const monthNames = [
        'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
        'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
    ];

    // Etkinlikler artık backend'den yüklenecek
    let events = [];

    async function loadEventsFromBackend() {
        try {
            if (window.backendAPI && typeof window.backendAPI.get === 'function') {
                const res = await window.backendAPI.get('events.php', { action: 'list' });
                if (res && res.success && Array.isArray(res.items)) {
                    events = res.items.map(normalizeEventFromBackend);
                    return;
                }
            }
        } catch (e) {
            console.warn('⚠️ Etkinlikler yüklenemedi (backend):', e?.message || e);
        }
        // Backend başarısızsa mevcut örnek veriler ile devam et
        events = [
            { id: 1, title: 'Makine Öğrenmesi Semineri', date: '2025-08-15', time: '14:00' },
            { id: 2, title: 'Proje Sunumları', date: '2025-08-22', time: '10:00' },
            { id: 3, title: 'Yapay Zeka Konferansı', date: '2025-09-05', time: '09:00' },
            { id: 4, title: 'Veri Bilimi Workshops', date: '2025-09-12', time: '13:30' },
            { id: 5, title: 'Teknoloji Fuarı', date: '2025-09-25', time: '11:00' }
        ];
    }

    function normalizeEventFromBackend(row) {
        const id = row.id ?? row.event_id ?? null;
        const name = row.name || row.title || 'Etkinlik';
        const type = row.type || '';
        const date = toYMD(row.event_date);
        const start = (row.start_time || '').toString();
        const end = (row.end_time || '').toString();
        const time = start || end || '10:00';
        return { id, title: name, type, date, time };
    }

    function toYMD(value) {
        if (!value) return '';
        const str = String(value);
        if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return str;
        const d = new Date(str);
        if (!isNaN(d.getTime())) {
            const y = d.getFullYear();
            const m = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            return `${y}-${m}-${day}`;
        }
        return '';
    }

    function generateCalendar() {
        const calendarDays = document.getElementById('calendarDays');
        const calendarMonthYear = document.getElementById('calendarMonthYear');
        
        if (!calendarDays || !calendarMonthYear) return;

        // Başlığı güncelle
        calendarMonthYear.textContent = `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;

        // Takvim gün sayısını hesapla
        const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = (firstDay.getDay() + 6) % 7; // Pazartesi başlangıç için

        // Önceki ayın son günleri
        const prevMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0);
        const daysInPrevMonth = prevMonth.getDate();

        calendarDays.innerHTML = '';

        // Önceki ayın gün sayıları
        for (let i = startingDayOfWeek - 1; i >= 0; i--) {
            const dayElement = createDayElement(daysInPrevMonth - i, true);
            calendarDays.appendChild(dayElement);
        }

        // Bu ayın günleri
        for (let day = 1; day <= daysInMonth; day++) {
            const dayElement = createDayElement(day, false);
            calendarDays.appendChild(dayElement);
        }

        // Sonraki ayın ilk günleri (42 hücre tamamlamak için)
        const totalCells = calendarDays.children.length;
        const remainingCells = 42 - totalCells;
        
        for (let day = 1; day <= remainingCells; day++) {
            const dayElement = createDayElement(day, true);
            calendarDays.appendChild(dayElement);
        }
    }

    function createDayElement(day, isOtherMonth) {
        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day';
        
        if (isOtherMonth) {
            dayElement.classList.add('other-month');
        }

        // Bugünü kontrol et
        const today = new Date();
        const dayDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
        
        if (!isOtherMonth && 
            dayDate.toDateString() === today.toDateString()) {
            dayElement.classList.add('today');
        }

        // Gün numarası
        const dayNumber = document.createElement('div');
        dayNumber.className = 'calendar-day-number';
        dayNumber.textContent = day;
        dayElement.appendChild(dayNumber);

        // Etkinlik kontrolü
        let dateString = '';
        if (!isOtherMonth) {
            dateString = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const dayEvents = events.filter(event => event.date === dateString);
            
            if (dayEvents.length > 0) {
                dayElement.classList.add('has-event');
                const eventIndicator = document.createElement('div');
                eventIndicator.className = 'calendar-event-indicator';
                eventIndicator.textContent = dayEvents[0].title;
                dayElement.appendChild(eventIndicator);
            }
        }

        // Gün tıklama: o güne ait etkinlikleri göster
        dayElement.addEventListener('click', () => {
            if (!dateString) {
                dateString = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            }
            openDayEventsModal(dateString);
        });

        return dayElement;
    }

    // Admin kontrolü
    function isAdminUser() {
        return (localStorage.getItem('userRole') || '').toLowerCase() === 'admin';
    }

    // Gün etkinlikleri modalı
    function ensureDayEventsModal() {
        if (document.getElementById('dayEventsModal')) return;
        const modal = document.createElement('div');
        modal.id = 'dayEventsModal';
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 560px;">
                <div class="modal-header">
                    <h3>Gün Etkinlikleri</h3>
                    <button class="modal-close" id="closeDayEventsModal"><i class="fas fa-times"></i></button>
                </div>
                <div class="modal-body" id="dayEventsBody" style="max-height: 60vh; overflow:auto;"></div>
                <div class="modal-footer" id="dayEventsFooter"></div>
            </div>
        `;
        document.body.appendChild(modal);
        document.getElementById('closeDayEventsModal').addEventListener('click', closeDayEventsModal);
        modal.addEventListener('click', (e) => { if (e.target === modal) closeDayEventsModal(); });
    }

    function openDayEventsModal(dateStr) {
        ensureDayEventsModal();
        const modal = document.getElementById('dayEventsModal');
        const body = document.getElementById('dayEventsBody');
        const footer = document.getElementById('dayEventsFooter');

        const list = events.filter(ev => ev.date === dateStr)
                           .sort((a,b) => (a.time||'').localeCompare(b.time||''));
        const prettyDate = new Date(dateStr).toLocaleDateString('tr-TR', { day: '2-digit', month: 'long', year: 'numeric' });

        let html = `<div style="margin-bottom:10px; font-weight:600;">${prettyDate}</div>`;
        if (list.length === 0) {
            html += `<div style="color:#888;">Bu günde etkinlik bulunmuyor.</div>`;
        } else {
            html += list.map(ev => {
                const time = ev.time ? ev.time : '-';
                const type = ev.type ? ` <span style="opacity:0.8">(${ev.type})</span>` : '';
                return `
                    <div class="event-item" style="padding:10px; border:1px solid var(--border-color,#e0e0e0); border-radius:8px; margin-bottom:8px;">
                        <div style="font-weight:600;">${ev.title}${type}</div>
                        <div style="font-size:12px; opacity:0.8;">Saat: ${time}</div>
                    </div>
                `;
            }).join('');
        }
        body.innerHTML = html;

        // Footer: Admin ise etkinlik ekle
        footer.innerHTML = '';
        if (isAdminUser()) {
            const addBtn = document.createElement('button');
            addBtn.className = 'btn-confirm';
            addBtn.innerHTML = '<i class="fas fa-plus"></i> Etkinlik Ekle';
            addBtn.addEventListener('click', () => openCreateEventModal(dateStr));
            footer.appendChild(addBtn);
        }

        modal.style.display = 'flex';
        setTimeout(() => modal.classList.add('show'), 10);
    }

    function closeDayEventsModal() {
        const modal = document.getElementById('dayEventsModal');
        if (!modal) return;
        modal.classList.remove('show');
        setTimeout(() => { modal.style.display = 'none'; }, 200);
    }

    // Etkinlik oluşturma modalı
    function ensureCreateEventModal() {
        if (document.getElementById('createEventModal')) return;
        const modal = document.createElement('div');
        modal.id = 'createEventModal';
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 720px;">
                <div class="modal-header">
                    <h3>Etkinlik Ekle</h3>
                    <button class="modal-close" id="closeCreateEventModal"><i class="fas fa-times"></i></button>
                </div>
                <div class="modal-body">
                    <form id="createEventForm" class="modal-form">
                        <div class="form-group">
                            <label>Etkinlik Adı</label>
                            <input type="text" name="name" required placeholder="Örn: Makine Öğrenmesi Semineri">
                        </div>
                        <div class="form-group">
                            <label>Tür</label>
                            <input type="text" name="type" placeholder="Örn: Seminar, Workshop, Conference">
                        </div>
                        <div class="form-group">
                            <label>Tarih</label>
                            <input type="date" name="event_date" required>
                        </div>
                        <div class="form-row">
                            <div class="form-group" style="flex:1;">
                                <label>Başlangıç Saati</label>
                                <input type="time" name="start_time" placeholder="HH:MM">
                            </div>
                            <div class="form-group" style="flex:1;">
                                <label>Bitiş Saati</label>
                                <input type="time" name="end_time" placeholder="HH:MM">
                            </div>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button class="btn-cancel" id="cancelCreateEvent">İptal</button>
                    <button class="btn-confirm" id="submitCreateEvent">Kaydet</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        document.getElementById('closeCreateEventModal').addEventListener('click', closeCreateEventModal);
        document.getElementById('cancelCreateEvent').addEventListener('click', closeCreateEventModal);
        modal.addEventListener('click', (e) => { if (e.target === modal) closeCreateEventModal(); });

        document.getElementById('submitCreateEvent').addEventListener('click', async () => {
            const form = document.getElementById('createEventForm');
            const formData = new FormData(form);
            const name = (formData.get('name') || '').toString().trim();
            const type = (formData.get('type') || '').toString().trim();
            const event_date = (formData.get('event_date') || '').toString().trim();
            const start_time = (formData.get('start_time') || '').toString().trim();
            const end_time = (formData.get('end_time') || '').toString().trim();

            if (!name || !isValidDateYMD(event_date)) {
                alert('Lütfen etkinlik adını ve geçerli bir tarihi (YYYY-MM-DD) girin.');
                return;
            }
            if (start_time && !isValidTimeHHMM(start_time)) {
                alert('Geçersiz başlangıç saati. (HH:MM)');
                return;
            }
            if (end_time && !isValidTimeHHMM(end_time)) {
                alert('Geçersiz bitiş saati. (HH:MM)');
                return;
            }

            try {
                const payload = { name, type, event_date, start_time, end_time };
                const res = await window.backendAPI.post('events.php?action=create', payload);
                if (res && res.success) {
                    // Başarı: etkinlikleri yeniden yükle ve takvimi güncelle
                    await loadEventsFromBackend();
                    generateCalendar();
                    loadUpcomingEvents();
                    closeCreateEventModal();
                    // Aynı gün modalı açıksa listeyi yenile
                    const dayModal = document.getElementById('dayEventsModal');
                    if (dayModal && dayModal.style.display === 'flex') {
                        openDayEventsModal(event_date);
                    }
                } else {
                    alert('Etkinlik oluşturulamadı: ' + (res && (res.error || res.message) ? (res.error || res.message) : 'Bilinmeyen hata'));
                }
            } catch (e) {
                alert('Etkinlik oluşturulurken hata: ' + (e?.message || e));
            }
        });
    }

    function openCreateEventModal(dateStr) {
        ensureCreateEventModal();
        const modal = document.getElementById('createEventModal');
        const form = document.getElementById('createEventForm');
        form.reset();
        const dateInput = form.querySelector('input[name="event_date"]');
        if (dateInput && dateStr) dateInput.value = dateStr;
        modal.style.display = 'flex';
        setTimeout(() => modal.classList.add('show'), 10);
    }

    function closeCreateEventModal() {
        const modal = document.getElementById('createEventModal');
        if (!modal) return;
        modal.classList.remove('show');
        setTimeout(() => { modal.style.display = 'none'; }, 200);
    }

    function isValidDateYMD(s) {
        // YYYY-MM-DD
        if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
        const [y,m,d] = s.split('-').map(n => parseInt(n, 10));
        return m >= 1 && m <= 12 && d >= 1 && d <= 31 && !isNaN(new Date(s).getTime());
    }

    function isValidTimeHHMM(s) {
        if (!/^\d{2}:\d{2}$/.test(s)) return false;
        const [h,mm] = s.split(':').map(n => parseInt(n, 10));
        return h >= 0 && h <= 23 && mm >= 0 && mm <= 59;
    }

    function loadUpcomingEvents() {
        const upcomingEventsContainer = document.getElementById('upcomingEvents');
        if (!upcomingEventsContainer) return;

        const today = new Date();
        const upcomingEvents = events
            .filter(event => new Date(event.date) >= today)
            .sort((a, b) => new Date(a.date) - new Date(b.date))
            .slice(0, 3);

        upcomingEventsContainer.innerHTML = '';

        if (upcomingEvents.length === 0) {
            upcomingEventsContainer.innerHTML = '<p style="text-align: center; color: #666; font-style: italic;">Yaklaşan etkinlik bulunmuyor.</p>';
            return;
        }

        upcomingEvents.forEach(event => {
            const eventElement = document.createElement('div');
            eventElement.className = 'event-item';
            
            const eventDate = new Date(event.date);
            const dateStr = eventDate.toLocaleDateString('tr-TR', {
                day: '2-digit',
                month: 'long'
            });

            eventElement.innerHTML = `
                <div class="event-date">${dateStr}</div>
                <div class="event-title">${event.title}</div>
                <div class="event-time">${event.time}</div>
            `;
            
            upcomingEventsContainer.appendChild(eventElement);
        });
    }

    // Takvimi başlat
    initializeCalendar().then(() => {
        // Modal altyapısını hazırla (ilk yüklemede)
        ensureDayEventsModal();
        ensureCreateEventModal();
    });

    // Takvim buton event listener'ları
    const btnCalendarEdit = document.querySelector('.btn-calendar-edit');
    const btnAllEvents = document.querySelector('.btn-all-events');

    if (btnCalendarEdit) {
        btnCalendarEdit.addEventListener('click', function() {
            // Takvim düzenleme modalı veya sayfası açılacak
            console.log('Takvim düzenle butonuna tıklandı');
            // showCalendarEditModal(); // Bu fonksiyon sonra eklenecek
        });
    }

    if (btnAllEvents) {
        btnAllEvents.addEventListener('click', function() {
            // Tüm etkinlikler sayfası açılacak
            console.log('Tüm etkinlikler butonuna tıklandı');
            // window.location.href = 'events.html';
        });
    }

    // Side Panel kontrolü
    function toggleSidePanel() {
        const isActive = sidePanel.classList.contains('active');
        
        if (isActive) {
            closeSidePanelFunc();
        } else {
            openSidePanel();
        }
    }

    function openSidePanel() {
        sidePanel.classList.add('active');
        if (overlay) {
            overlay.classList.add('active');
        }
        hamburgerBtn.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeSidePanelFunc() {
        sidePanel.classList.remove('active');
        if (overlay) {
            overlay.classList.remove('active');
        }
        hamburgerBtn.classList.remove('active');
        document.body.style.overflow = 'auto';
    }

    // Event listeners - Side Panel
    if (hamburgerBtn) {
        hamburgerBtn.addEventListener('click', toggleSidePanel);
    }
    
    // Overlay tıklaması - side panel'i kapat
    if (overlay) {
        overlay.addEventListener('click', function() {
            closeSidePanelFunc();
        });
    }

    // Side panel dışına tıklandığında kapat
    document.addEventListener('click', function(e) {
        if (sidePanel && hamburgerBtn && 
            !sidePanel.contains(e.target) && 
            !hamburgerBtn.contains(e.target) && 
            sidePanel.classList.contains('active')) {
            closeSidePanelFunc();
        }
    });

    // ESC tuşu ile panelleri kapatma
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeSidePanelFunc();
            closeProfileDropdown();
        }
    });

    // Theme Toggle kontrolü
    let isDarkTheme = localStorage.getItem('theme') === 'dark';
    
    function updateTheme() {
        if (isDarkTheme) {
            document.documentElement.setAttribute('data-theme', 'dark');
            if (themeIcon) {
                themeIcon.className = 'fas fa-moon theme-icon';
            }
        } else {
            document.documentElement.removeAttribute('data-theme');
            if (themeIcon) {
                themeIcon.className = 'fas fa-sun theme-icon';
            }
        }
        localStorage.setItem('theme', isDarkTheme ? 'dark' : 'light');
    }

    // Sayfa yüklendiğinde tema uygula
    updateTheme();

    if (themeToggle) {
        themeToggle.addEventListener('click', function() {
            isDarkTheme = !isDarkTheme;
            updateTheme();
        });
    }

    // Profile Dropdown kontrolü
    function toggleProfileDropdown() {
        if (profileDropdown) {
            profileDropdown.classList.toggle('active');
        }
    }

    function closeProfileDropdown() {
        if (profileDropdown) {
            profileDropdown.classList.remove('active');
        }
    }

    if (profileSection) {
        profileSection.addEventListener('click', function(e) {
            e.stopPropagation();
            toggleProfileDropdown();
        });
    }

    // Profil dropdown dışına tıklandığında kapat
    document.addEventListener('click', function(e) {
        if (profileSection && profileDropdown && 
            !profileSection.contains(e.target) && 
            !profileDropdown.contains(e.target)) {
            closeProfileDropdown();
        }
    });

    // Profil dropdown içindeki linklere tıklandığında
    if (profileDropdown) {
        profileDropdown.addEventListener('click', function(e) {
            if (e.target.closest('.dropdown-item')) {
                closeProfileDropdown();
            }
        });
    }

    // Admin Mode Dropdown İşlevselliği
    initializeAdminDropdown();
});

// Admin Mode Functions
function enableAdminMode() {
    // Admin özelliklerini aktifleştir
    document.body.classList.add('admin-mode');
    console.log('Mode changed to: admin');
    console.log('Admin mode enabled');
    
    // Update dropdown icon
    const modeIcon = document.getElementById('modeIcon');
    if (modeIcon) {
        modeIcon.className = 'fas fa-cog mode-icon';
    }
    
    // Save admin state to localStorage ONLY after password validation
    saveAdminState('admin', 'Admin Paneli');
    
    // Burada admin özelliklerini açabilirsiniz
    // Örnek: Ek butonları göster, edit modlarını aktif et vs.
}

function enableSafeMode() {
    // Güvenli mod özelliklerini aktifleştir
    document.body.classList.remove('admin-mode');
    
    // Update dropdown icon
    const modeIcon = document.getElementById('modeIcon');
    if (modeIcon) {
        modeIcon.className = 'fas fa-shield-alt mode-icon';
    }
    
    // Burada admin özelliklerini kapatabilirsiniz
}

function resetToSafeMode() {
    const dropdownOptions = document.querySelectorAll('.dropdown-option');
    const modeText = document.querySelector('.mode-text');
    
    // Remove active class from all options
    dropdownOptions.forEach(opt => opt.classList.remove('active'));
    
    // Set safe mode as active
    const safeOption = document.querySelector('[data-mode="safe"]');
    if (safeOption) {
        safeOption.classList.add('active');
    }
    
    // Update text and icon
    if (modeText) {
        modeText.textContent = 'Güvenli Mod';
    }
    
    // Update icon to safe mode
    const modeIcon = document.getElementById('modeIcon');
    if (modeIcon) {
        modeIcon.className = 'fas fa-shield-alt mode-icon';
    }
    
    // Save safe mode to localStorage
    saveAdminState('safe', 'Güvenli Mod');
    
    // Enable safe mode
    enableSafeMode();
}

// Admin Dropdown Fonksiyonları
function initializeAdminDropdown() {
    const dropdownTrigger = document.getElementById('dropdownTrigger');
    const dropdownMenu = document.getElementById('dropdownMenu');
    const dropdownOptions = document.querySelectorAll('.dropdown-option');
    const modeText = document.querySelector('.mode-text');

    if (!dropdownTrigger || !dropdownMenu) return;

    // Dropdown toggle
    dropdownTrigger.addEventListener('click', function(e) {
        e.stopPropagation();
        toggleDropdown();
    });

    // Option selection
    dropdownOptions.forEach(option => {
        option.addEventListener('click', function() {
            const mode = this.getAttribute('data-mode');
            const text = this.querySelector('span').textContent;
            
            selectMode(mode, text);
            closeDropdown();
        });
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', function(e) {
        if (!dropdownTrigger.contains(e.target) && !dropdownMenu.contains(e.target)) {
            closeDropdown();
        }
    });

    function toggleDropdown() {
        const isOpen = dropdownMenu.classList.contains('show');
        if (isOpen) {
            closeDropdown();
        } else {
            openDropdown();
        }
    }

    function openDropdown() {
        dropdownMenu.classList.add('show');
        dropdownTrigger.classList.add('active');
    }

    function closeDropdown() {
        dropdownMenu.classList.remove('show');
        dropdownTrigger.classList.remove('active');
    }

    function selectMode(mode, text) {
        // Remove active class from all options
        dropdownOptions.forEach(opt => opt.classList.remove('active'));
        
        // Add active class to selected option
        const selectedOption = document.querySelector(`[data-mode="${mode}"]`);
        if (selectedOption) {
            selectedOption.classList.add('active');
        }
        
        // Update trigger text and icon
        modeText.textContent = text;
        updateModeIcon(mode);
        
        // Save admin state to localStorage ONLY for safe mode
        // Admin mode will be saved only after password validation
        if (mode === 'safe') {
            saveAdminState(mode, text);
        }
        
        // Handle mode change
        handleModeChange(mode);
    }
    
    function updateModeIcon(mode) {
        const modeIcon = document.getElementById('modeIcon');
        if (!modeIcon) return;
        
        if (mode === 'admin') {
            modeIcon.className = 'fas fa-cog mode-icon';
        } else {
            modeIcon.className = 'fas fa-shield-alt mode-icon';
        }
    }

    function handleModeChange(mode) {
        // Only log and handle after password validation
        if (mode === 'admin') {
            // Admin paneli için şifre kontrolü - MODE CHANGE SADECE ŞİFRE DOĞRULANDIKTAN SONRA
            showProtocolModal();
        } else {
            // Güvenli moda geç
            console.log('Mode changed to:', mode);
            enableSafeMode();
        }
    }

    // Load saved admin state on initialization
    loadAdminState();

    function saveAdminState(mode, text) {
        localStorage.setItem('adminMode', mode);
        localStorage.setItem('adminModeText', text);
    }

    function loadAdminState() {
        const savedMode = localStorage.getItem('adminMode') || 'safe';
        const savedText = localStorage.getItem('adminModeText') || 'Güvenli Mod';
        
        const dropdownOptions = document.querySelectorAll('.dropdown-option');
        
        // Update UI without triggering mode change
        dropdownOptions.forEach(opt => opt.classList.remove('active'));
        const selectedOption = document.querySelector(`[data-mode="${savedMode}"]`);
        if (selectedOption) {
            selectedOption.classList.add('active');
        }
        
        if (modeText) {
            modeText.textContent = savedText;
        }
        updateModeIcon(savedMode);
        
        // Apply the saved mode
        if (savedMode === 'admin') {
            enableAdminMode();
        } else {
            enableSafeMode();
        }
    }

}

// Protocol Modal Functions
function showProtocolModal() {
    const modal = document.getElementById('protocolModal');
    const passwordInput = document.getElementById('protocolPassword');
    const errorMessage = document.getElementById('errorMessage');
    
    if (!modal) return;
    
    // Reset modal state
    passwordInput.value = '';
    errorMessage.style.display = 'none';
    
    // Show modal
    modal.classList.add('show');
    
    // Focus on password input
    setTimeout(() => {
        passwordInput.focus();
    }, 300);
    
    // Initialize modal event listeners
    initializeProtocolModal();
}

function initializeProtocolModal() {
    const modal = document.getElementById('protocolModal');
    const closeBtn = document.getElementById('closeProtocolModal');
    const cancelBtn = document.getElementById('cancelProtocol');
    const confirmBtn = document.getElementById('confirmProtocol');
    const passwordInput = document.getElementById('protocolPassword');
    const passwordToggle = document.getElementById('passwordToggle');
    const errorMessage = document.getElementById('errorMessage');
    
    // Close modal events
    const closeModal = () => {
        modal.classList.remove('show');
        // Reset dropdown to safe mode
        resetToSafeMode();
    };
    
    closeBtn.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);
    
    // Password toggle visibility
    passwordToggle.addEventListener('click', () => {
        const type = passwordInput.type === 'password' ? 'text' : 'password';
        passwordInput.type = type;
        passwordToggle.classList.toggle('fa-eye');
        passwordToggle.classList.toggle('fa-eye-slash');
    });
    
    // Enter key submit
    passwordInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            confirmBtn.click();
        }
    });
    
    // Confirm password
    confirmBtn.addEventListener('click', () => {
        const password = passwordInput.value.trim();
        const correctPassword = 'admin';
        
        if (password === correctPassword) {
            // Correct password - enable admin mode
            modal.classList.remove('show');
            enableAdminMode();
            showAdminSuccessNotification();
        } else {
            // Wrong password - show error
            showPasswordError();
            passwordInput.value = '';
            passwordInput.focus();
        }
    });
    
    // Close modal when clicking outside
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });
}

function showPasswordError() {
    const errorMessage = document.getElementById('errorMessage');
    errorMessage.style.display = 'flex';
    
    // Add shake animation
    const passwordField = document.querySelector('.password-field');
    passwordField.style.animation = 'shake 0.5s ease-in-out';
    
    setTimeout(() => {
        passwordField.style.animation = '';
    }, 500);
}

function showAdminSuccessNotification() {
    // Remove any existing notification
    const existingNotification = document.querySelector('.admin-success-notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    const notification = document.createElement('div');
    notification.className = 'admin-success-notification';
    
    const currentTime = new Date().toLocaleTimeString('tr-TR', {
        hour: '2-digit',
        minute: '2-digit'
    });
    
    notification.innerHTML = `
        <div class="admin-notification-header">
            <i class="fas fa-user-shield"></i>
            <span>Admin Girişi Başarılı</span>
        </div>
        <div class="admin-notification-body">
            Sistem yönetici yetkilerinizi tanıdı. Tüm admin özellikleri aktifleştirildi.
        </div>
        <div class="admin-notification-footer">
            <i class="fas fa-clock"></i>
            <span>Giriş: ${currentTime}</span>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 5000);
}

// Firebase Configuration and Console Functions
let firebaseInitialized = false;

// Firebase'i başlat
function initializeFirebase() {
    try {
        if (window.firestoreDb && window.firestoreFunctions && !firebaseInitialized) {
            firebaseInitialized = true;
            return true;
        }
        return firebaseInitialized;
    } catch (error) {
        console.error('Firebase başlatma hatası:', error);
        return false;
    }
}

// Sayfa yüklendiğinde Firebase'i başlat
document.addEventListener('DOMContentLoaded', function() {
    // Firebase'i başlat
    setTimeout(() => {
        if (initializeFirebase()) {
            // Firebase ready
        } else {
            setTimeout(initializeFirebase, 1000); // 1 saniye daha bekle
        }
    }, 500); // Firebase scriptlerinin yüklenmesi için bekle
    
    // Konsol panel event listeners
    const consoleToggle = document.getElementById('consoleToggle');
    const consolePanel = document.getElementById('consolePanel');
    const consoleClose = document.getElementById('consoleClose');
    
    if (consoleToggle) {
        consoleToggle.addEventListener('click', function(e) {
            e.preventDefault();
            toggleConsole();
        });
    }
    
    if (consoleClose) {
        consoleClose.addEventListener('click', function() {
            hideConsole();
        });
    }
});

function toggleConsole() {
    const consolePanel = document.getElementById('consolePanel');
    if (consolePanel.style.display === 'none' || !consolePanel.style.display) {
        showConsole();
    } else {
        hideConsole();
    }
}

function showConsole() {
    const consolePanel = document.getElementById('consolePanel');
    consolePanel.style.display = 'flex';

    // Backend durumunu göster
    addToConsoleOutput('✓ Sistem konsolu açıldı. Hazır!', 'success');

    // Backend bağlantı testini tetikle (varsa)
    if (typeof testBackendConnection === 'function') {
        try { testBackendConnection(); } catch (_) {}
    }
}

function hideConsole() {
    const consolePanel = document.getElementById('consolePanel');
    consolePanel.style.display = 'none';
}

function addToConsoleOutput(message, type = 'normal') {
    const output = document.getElementById('consoleOutput');
    const line = document.createElement('div');
    line.className = `output-line${type !== 'normal' ? ' output-' + type : ''}`;
    line.textContent = message;
    output.appendChild(line);
    output.scrollTop = output.scrollHeight;
}

async function submitUser() {
    console.log('🚀 submitUser function called!'); // Debug
    
    // Form görünürlüğünü kontrol et
    const userForm = document.getElementById('userForm');
    console.log('📋 Form durumu:', {
        formExists: !!userForm,
        formVisible: userForm ? userForm.style.display : 'N/A',
        formInDOM: userForm ? true : false
    });
    
    // Element kontrolü
    const nameEl = document.getElementById('userName');
    const fullNameEl = document.getElementById('userFullName');
    const emailEl = document.getElementById('userEmail');
    const passwordEl = document.getElementById('userPassword');
    
    console.log('📋 Element kontrolü:', {
        nameEl: nameEl,
        fullNameEl: fullNameEl,
        emailEl: emailEl,
        passwordEl: passwordEl
    });
    
    if (!nameEl) {
        console.error('❌ userName elementi bulunamadı!');
        return;
    }
    if (!fullNameEl) {
        console.error('❌ userFullName elementi bulunamadı!');
        return;
    }
    if (!emailEl) {
        console.error('❌ userEmail elementi bulunamadı!');
        return;
    }
    if (!passwordEl) {
        console.error('❌ userPassword elementi bulunamadı!');
        return;
    }
    
    // Temel alanlar (zorunlu)
    const name = nameEl.value.trim();
    const fullName = fullNameEl.value.trim();
    const email = emailEl.value.trim();
    const password = passwordEl.value.trim();
    
    // Opsiyonel alanlar - güvenli erişim
    const phoneEl = document.getElementById('userPhone');
    const departmentEl = document.getElementById('userDepartment');
    const facultyEl = document.getElementById('userFaculty');
    const institutionEl = document.getElementById('userInstitution');
    const linkedinEl = document.getElementById('userLinkedinLink');
    const orcidEl = document.getElementById('userOrcidLink');
    const photoHTMLEl = document.getElementById('userPhotoHTML');
    
    const phone = phoneEl ? phoneEl.value.trim() : '';
    const department = departmentEl ? departmentEl.value.trim() : '';
    const faculty = facultyEl ? facultyEl.value.trim() : '';
    const institution = institutionEl ? institutionEl.value.trim() : '';
    const linkedinLink = linkedinEl ? linkedinEl.value.trim() : '';
    const orcidLink = orcidEl ? orcidEl.value.trim() : '';
    const photoHTML = photoHTMLEl ? photoHTMLEl.value.trim() : '';
    
    // Zorunlu alanları kontrol et
    if (!name || !email || !password) {
        addToConsoleOutput('✗ Hata: İsim, e-mail ve şifre alanları gerekli!', 'error');
        return;
    }

    const currentUser = localStorage.getItem('currentUserEmail') || 'system';
    addToConsoleOutput(`→ Kullanıcı ekleniyor: ${name} (${email})`, 'info');

    // Backend'e uygun payload hazırla
    const payload = {
        name: name,
        fullName: fullName || name,
        email: email.toLowerCase(),
        password: password,
        phone: phone || null,
        department: department || null,
        faculty: faculty || null,
        institution: institution || null,
        linkedinLink: linkedinLink || null,
        orcidLink: orcidLink || null,
        photoHTML: photoHTML || null,
        role: 'user',
        createdBy: currentUser
    };

    try {
        // Mevcut BackendAPI helper'ını kullan
        const res = await (window.backendAPI && typeof window.backendAPI.addMember === 'function'
            ? window.backendAPI.addMember(payload)
            : window.backendAPI.post('add_member.php', payload));

        const ok = res && (res.success === true || res.status === 'ok' || typeof res.id !== 'undefined');
        if (!ok) {
            const msg = (res && (res.error || res.message)) ? (res.error || res.message) : 'Bilinmeyen backend hatası';
            throw new Error(msg);
        }

        addToConsoleOutput(`✓ Kullanıcı başarıyla eklendi: ${name}`, 'success');
        addToConsoleOutput(`  - Tam İsim: ${fullName || 'Belirtilmemiş'}`, 'info');
        addToConsoleOutput(`  - E-mail: ${email}`, 'info');
        addToConsoleOutput(`  - Telefon: ${phone || 'Belirtilmemiş'}`, 'info');
        addToConsoleOutput(`  - Bölüm: ${department || 'Belirtilmemiş'}`, 'info');
        addToConsoleOutput(`  - Fakülte: ${faculty || 'Belirtilmemiş'}`, 'info');
        addToConsoleOutput(`  - Kurum: ${institution || 'Belirtilmemiş'}`, 'info');

        // Form temizle
        document.getElementById('userName').value = '';
        document.getElementById('userFullName').value = '';
        document.getElementById('userEmail').value = '';
        document.getElementById('userPassword').value = '';
        document.getElementById('userPhone').value = '';
        document.getElementById('userDepartment').value = '';
        document.getElementById('userFaculty').value = '';
        document.getElementById('userInstitution').value = '';
        document.getElementById('userLinkedinLink').value = '';
        document.getElementById('userOrcidLink').value = '';
        document.getElementById('userPhotoHTML').value = '';

        // Formu gizle
        document.getElementById('userForm').style.display = 'none';
    } catch (error) {
        addToConsoleOutput(`✗ Hata: ${error.message}`, 'error');
    }
}

async function getAllUsers() {
    addToConsoleOutput('→ Kullanıcılar getiriliyor...', 'info');

    try {
        // Mevcut BackendAPI helper'ını kullan
        const res = await (window.backendAPI && typeof window.backendAPI.getAllMembers === 'function'
            ? window.backendAPI.getAllMembers()
            : window.backendAPI.get('users.php'));

        // Çeşitli backend cevap biçimlerine toleranslı ol
        const list = Array.isArray(res) ? res
                   : Array.isArray(res?.items) ? res.items
                   : Array.isArray(res?.data) ? res.data
                   : [];

        if (list.length === 0) {
            addToConsoleOutput('ℹ️ Henüz kullanıcı kaydı bulunmuyor.', 'info');
            return;
        }

        addToConsoleOutput(`✓ ${list.length} kullanıcı bulundu:`, 'success');
        list.forEach(row => {
            const name = row.name || row.fullName || row.full_name || 'İsimsiz';
            const email = row.email || 'E-mail yok';
            const role = (row.role || 'user');
            const createdAt = row.created_at || row.createdAt || 'Bilinmiyor';
            addToConsoleOutput(`  • ${name} - ${email} - Rol: ${role} - Oluşturulma: ${createdAt}`);
        });
    } catch (error) {
        addToConsoleOutput(`✗ Hata: ${error.message}`, 'error');
    }
}

// Journal düzenleme fonksiyonları
function showJournalEditForm() {
    const editSection = document.getElementById('journalEditSection');
    const deadlineSection = document.getElementById('journalDeadline');
    const journalInfo = document.querySelector('.journal-info');
    
    if (editSection && deadlineSection && journalInfo) {
        // Journal info (isim, yazar, butonlar) ve deadline bölümünü gizle
        journalInfo.style.display = 'none';
        deadlineSection.style.display = 'none';
        
        // Düzenleme formunu göster ve genişlet
        editSection.style.display = 'block';
        editSection.classList.add('expanded');
        
        // Mevcut journal verilerini form alanlarına doldur
        populateJournalEditForm(currentJournal);
    }
}

function populateJournalEditForm(journal) {
    // Eğer henüz set edilmediyse backend'den tekrar yüklemeyi deneyebiliriz
    if (!journal) {
        // En son yüklenenleri çağır ve düşük id'liyi seç
        loadJournalsFromBackend().catch(() => {});
        return;
    }
    const nameEl = document.getElementById('journalName');
    const authorsEl = document.getElementById('journalAuthors');
    const yearEl = document.getElementById('journalYear');
    if (nameEl) nameEl.value = journal.name || '';
    if (authorsEl) authorsEl.value = journal.authors || '';
    if (yearEl) yearEl.value = String(journal.year || new Date().getFullYear());

    // PDF bilgisi gösterim: Dosya input set edilemez; mevcut PDF varsa info alanını güncelle
    const fileInfo = document.getElementById('fileInfo');
    const fileNameSpan = document.getElementById('fileName');
    const uploadButton = document.querySelector('.file-upload-button');
    const pdfUrl = journal.pdfUrl || journal.pdf_url || '';
    if (pdfUrl && fileInfo && fileNameSpan && uploadButton) {
        const filename = String(pdfUrl).split('/').pop();
        fileNameSpan.textContent = filename || 'Mevcut PDF';
        fileInfo.style.display = 'flex';
        uploadButton.style.display = 'none';
    }
}

function cancelJournalEdit() {
    const editSection = document.getElementById('journalEditSection');
    const deadlineSection = document.getElementById('journalDeadline');
    const journalInfo = document.querySelector('.journal-info');
    
    if (editSection && deadlineSection && journalInfo) {
        // Düzenleme formunu gizle ve expanded sınıfını kaldır
        editSection.style.display = 'none';
        editSection.classList.remove('expanded');
        
        // Journal info (isim, yazar, butonlar) ve deadline bölümünü göster
        journalInfo.style.display = 'flex';
        deadlineSection.style.display = 'block';
        
        // Formu temizle
        document.getElementById('journalEditForm').reset();
        hideFileInfo();
    }
}

function removeFile() {
    const fileInput = document.getElementById('journalPdf');
    const fileInfo = document.getElementById('fileInfo');
    const uploadButton = document.querySelector('.file-upload-button');
    
    fileInput.value = '';
    fileInfo.style.display = 'none';
    uploadButton.style.display = 'flex';
}

function hideFileInfo() {
    const fileInfo = document.getElementById('fileInfo');
    const uploadButton = document.querySelector('.file-upload-button');
    
    if (fileInfo && uploadButton) {
        fileInfo.style.display = 'none';
        uploadButton.style.display = 'flex';
    }
}

// File input change handler
document.addEventListener('DOMContentLoaded', function() {
    const fileInput = document.getElementById('journalPdf');
    const fileInfo = document.getElementById('fileInfo');
    const fileName = document.getElementById('fileName');
    const uploadButton = document.querySelector('.file-upload-button');
    
    if (fileInput) {
        fileInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                fileName.textContent = file.name;
                fileInfo.style.display = 'flex';
                uploadButton.style.display = 'none';
            }
        });
    }
    
    // Journal edit form submit handler
    const journalEditForm = document.getElementById('journalEditForm');
    if (journalEditForm) {
        journalEditForm.addEventListener('submit', function(e) {
            e.preventDefault();
            saveJournalChanges();
        });
    }
});

async function saveJournalChanges() {
    const formData = {
        name: document.getElementById('journalName').value,
        authors: document.getElementById('journalAuthors').value,
        year: parseInt(document.getElementById('journalYear').value),
        pdf: document.getElementById('journalPdf').files[0]
    };
    
    // Validasyon
    if (!formData.name.trim() || !formData.authors.trim() || !formData.year) {
        alert('Lütfen tüm alanları doldurun!');
        return;
    }
    
    // Loading durumu göster
    const saveButton = document.querySelector('.btn-save');
    const originalText = saveButton.textContent;
    saveButton.textContent = 'Kaydediliyor...';
    saveButton.disabled = true;
    
    // PDF varsa sayfa sayısını al ve backend'e kaydet
    const doSave = async () => {
        try {
            let totalPages;
            if (formData.pdf) {
                totalPages = await getPdfPageCount(formData.pdf);
                console.log(`📄 PDF sayfa sayısı (total_page_count): ${totalPages}`);
                const pdfUploadRes = await uploadJournalPdfToBackend(formData.pdf);
                if (pdfUploadRes && pdfUploadRes.pdf_url) {
                    formData.pdfUrl = pdfUploadRes.pdf_url;
                }
            } else {
                // Yeni PDF yoksa mevcut sayfa sayısı veya default kullan
                totalPages = (currentJournal && Number(currentJournal.totalPageCount)) || 40;
                // Eski PDF URL'ini koru
                if (currentJournal && (currentJournal.pdfUrl || currentJournal.pdf_url)) {
                    formData.pdfUrl = currentJournal.pdfUrl || currentJournal.pdf_url;
                }
            }
            // prepared_page_count: kullanıcıdan al
            let preparedInputEl = document.getElementById('preparedPages');
            let preparedPagesVal = null;
            if (preparedInputEl && preparedInputEl.value !== '') {
                preparedPagesVal = parseInt(preparedInputEl.value, 10);
            }
            if (preparedPagesVal === null || isNaN(preparedPagesVal)) {
                const defaultPrepared = currentJournal ? Number(currentJournal.preparedPageCount || 0) : 0;
                const userInput = window.prompt('Hazırlanan sayfa sayısı (prepared_page_count):', String(defaultPrepared));
                if (userInput === null) {
                    // İptal edildi
                    throw new Error('İşlem iptal edildi');
                }
                preparedPagesVal = parseInt(userInput, 10);
            }
            if (isNaN(preparedPagesVal) || preparedPagesVal < 0) preparedPagesVal = 0;
            if (typeof totalPages === 'number' && totalPages >= 0 && preparedPagesVal > totalPages) {
                preparedPagesVal = totalPages;
            }

            // Payload alan adlarını belirle
            formData.preparedPageCount = preparedPagesVal;
            formData.totalPageCount = totalPages || 40;
 
            if (currentJournal && currentJournal.id) {
                await updateJournalInBackend(currentJournal.id, formData);
                alert('Journal güncellendi!');
            } else {
                await saveJournalToBackend(formData);
                alert('Journal başarıyla kaydedildi!');
            }
            cancelJournalEdit();
            // Yeniden yükle ve ekranda güncelle
            const items = await loadJournalsFromBackend();
            if (items && items.length) {
                const lowest = items.reduce((min, j) => (j.id < min.id ? j : min), items[0]);
                updateJournalDisplay(lowest);
            }
        } catch (error) {
            console.error('Journal kaydetme hatası (backend):', error);
            alert('Journal kaydedilirken bir hata oluştu: ' + error.message);
        } finally {
            saveButton.textContent = originalText;
            saveButton.disabled = false;
        }
    };
    doSave();
}

// PDF sayfa sayısını alma fonksiyonu (client-side)
async function getPdfPageCount(file) {
    return new Promise((resolve, reject) => {
        const fileReader = new FileReader();
        
        fileReader.onload = function() {
            const typedarray = new Uint8Array(this.result);
            
            // PDF.js ile PDF'i yükle
            pdfjsLib.getDocument(typedarray).promise.then(function(pdf) {
                console.log(`📊 PDF yüklendi, toplam sayfa: ${pdf.numPages}`);
                resolve(pdf.numPages);
            }).catch(function(error) {
                console.error('PDF sayfa sayısı alma hatası:', error);
                // Hata durumunda varsayılan değer dön
                resolve(40);
            });
        };
        
        fileReader.onerror = function() {
            console.error('PDF dosyası okunamadı');
            resolve(40); // Varsayılan değer
        };
        
        fileReader.readAsArrayBuffer(file);
    });
}

// Backend: PDF upload
async function uploadJournalPdfToBackend(file) {
    const form = new FormData();
    form.append('pdf', file);
    // İsterseniz ek alanlar: form.append('year', ...)
    const response = await fetch(`${window.backendAPI.baseURL}/journals.php?action=uploadPdf`, {
        method: 'POST',
        body: form,
        credentials: 'include'
    });
    const text = await response.text();
    try {
        return JSON.parse(text);
    } catch (e) {
        throw new Error('Invalid upload response: ' + text.substring(0, 200));
    }
}

// Backend: create journal
async function saveJournalToBackend(formData) {
    const payload = {
        name: formData.name.trim(),
        authors: formData.authors.trim(),
        year: formData.year,
        preparedPageCount: Number(formData.preparedPageCount || 0),
        totalPageCount: Number(formData.totalPageCount || 40),
        pdfUrl: formData.pdfUrl || null,
        status: 'draft'
    };
    const res = await window.backendAPI.post('journals.php?action=create', payload);
    // Esnek başarı kontrolü
    const ok = !!(res && (res.success === true || res.status === 'ok' || res.status === 'success' || typeof res.id !== 'undefined' || res.insertId || res.created === true || (typeof res.affectedRows === 'number' && res.affectedRows >= 0)));
    if (!ok) {
        const err = (res && (res.error || res.message || res.fatal)) || 'Unknown backend error';
        console.error('Journal create response:', res);
        throw new Error(err);
    }
    return res.id || res.insertId;
}

// Backend: update journal
async function updateJournalInBackend(id, formData) {
    const payload = {
        id: Number(id),
        name: (formData.name || '').trim(),
        authors: (formData.authors || '').trim(),
        year: Number(formData.year),
        preparedPageCount: Number(formData.preparedPageCount || 0),
        totalPageCount: Number(formData.totalPageCount || 40),
        pdfUrl: formData.pdfUrl || null,
        status: formData.status || 'draft'
    };
    const res = await window.backendAPI.post('journals.php?action=update', payload);
    // Esnek başarı kontrolü
    const ok = !!(res && (res.success === true || res.status === 'ok' || res.status === 'success' || res.updated === true || (typeof res.affectedRows === 'number' && res.affectedRows >= 0)));
    if (!ok) {
        const err = (res && (res.error || res.message || res.fatal)) || 'Unknown backend error';
        console.error('Journal update response:', res);
        throw new Error(err);
    }
    return true;
}

// Firebase bekleme fonksiyonu artıktan kullanılmıyor; geriye dönük uyumluluk için no-op
function waitForFirebase() {
    return new Promise((resolve, reject) => {
        resolve();
    });
}

// Global fonksiyonları window objesine ekle
window.showJournalEditForm = showJournalEditForm;
window.cancelJournalEdit = cancelJournalEdit;
window.removeFile = removeFile;
window.saveJournalChanges = saveJournalChanges;
window.loadJournalsFromBackend = loadJournalsFromBackend;
window.updateJournalDisplay = updateJournalDisplay;
window.updateDefaultProgressDisplay = updateDefaultProgressDisplay;
window.getAllJournals = getAllJournals;
window.showJournalStats = showJournalStats;
window.testBackendConnection = testBackendConnection;
window.checkBackendStatus = checkBackendStatus;
window.openJournalPdf = openJournalPdf;

// Backend bağlantı testi
async function testBackendConnection() {
    addToConsoleOutput('Backend test bağlantısı deneniyor...', 'info');
    try {
        const res = await window.backendAPI.get('journals.php', { action: 'status' });
        addToConsoleOutput(`✅ Backend status: ${res && res.message ? res.message : 'OK'}`, 'success');
    } catch (e) {
        addToConsoleOutput(`❌ Backend testi başarısız: ${e.message}`, 'error');
    }
}

// Sayfa yüklendiğinde journalları backend'den yükle
document.addEventListener('DOMContentLoaded', function() {
    loadJournalsFromBackend()
        .then(() => {})
        .catch((error) => {
            console.warn('⚠️ Journallar yüklenemedi (backend):', error.message);
            updateDefaultProgressDisplay();
        });
});

function normalizeJournal(row) {
    return {
        id: Number(row.id),
        name: row.name || row.title || row.journal_name || 'NEX ANNUAL SCIENCE',
        authors: row.authors || row.journal_authors || 'C. Ertuğrul ERDOĞAN, NEX',
        year: Number(row.year || row.publish_year || new Date().getFullYear()),
        pageCount: Number(row.pageCount || row.page_count || 0),
        pdfUrl: row.pdfUrl || row.pdf_url || '',
        deadlineDays: row.deadline || row.deadline_days,
        status: row.status || 'draft',
        created_at: row.created_at || '',
        preparedPageCount: Number(row.prepared_page_count || row.preparedPageCount || row.pageCount || row.page_count || 0),
        totalPageCount: Number(row.total_page_count || row.totalPageCount || 40)
    };
}

async function loadJournalsFromBackend() {
    const res = await window.backendAPI.get('journals.php', { action: 'list' });
    if (!res || !res.success) {
        const msg = res && (res.error || res.fatal || res.message) ? (res.error || res.fatal || res.message) : 'List error';
        throw new Error(msg);
    }
    const items = (res.items || []).map(normalizeJournal);
    if (items.length > 0) {
        // En düşük id’li journal’ı al
        const lowest = items.reduce((min, j) => (j.id < min.id ? j : min), items[0]);
        currentJournal = lowest;
        updateJournalDisplay(lowest);
    } else {
        updateDefaultProgressDisplay();
    }
    return items;
}

function toWebPdfUrl(maybePath) {
    if (!maybePath) return '';
    const raw = String(maybePath).trim();
    if (raw.startsWith('http://') || raw.startsWith('https://')) return raw;

    // Normalize Windows paths
    const normalized = raw.replace(/\\/g, '/');

    // Extract filename robustly
    const fileMatch = normalized.match(/[^\/]+$/);
    const fileName = fileMatch ? fileMatch[0] : '';

    // Try to keep subpath starting at /uploads/...
    let tail = '';
    const uploadsMatch = normalized.match(/\/uploads\/.+$/i);
    if (uploadsMatch && uploadsMatch[0]) {
        tail = uploadsMatch[0]; // e.g. /uploads/journals/file.pdf
        // Ensure it ends with filename; if not, append
        if (!tail.toLowerCase().endsWith(fileName.toLowerCase())) {
            const safeTail = tail.replace(/\/+$/, '');
            tail = safeTail + (fileName ? '/' + fileName : '');
        }
    } else {
        // Fallback strictly to /uploads/journals/<file>
        tail = `/uploads/journals/${fileName}`;
    }

    // Build final URL
    const base = (window.backendAPI.baseURL || '').replace(/\/+$/, '');
    const cleanedTail = ('/' + tail.replace(/^\/+/, '')).replace(/\/+/g, '/');
    // Encode only filename
    const parts = cleanedTail.split('/');
    const last = parts.pop();
    const encodedLast = last ? encodeURIComponent(last) : '';
    const rebuiltPath = parts.join('/') + (encodedLast ? '/' + encodedLast : '');

    return base + rebuiltPath;
}

function openInNewTab(url) {
    const link = document.createElement('a');
    link.href = url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    // Some browsers require element to be in DOM for synthetic click
    document.body.appendChild(link);
    link.click();
    link.remove();
}

function updateJournalDisplay(journal) {
    // Sayfadaki journal bilgilerini güncelle
    const titleElement = document.querySelector('.journal-title');
    const authorsElement = document.querySelector('.journal-authors');
    const progressElement = document.querySelector('.progress-text');
    const progressFill = document.querySelector('.progress-fill');
    const deadlineCounter = document.getElementById('deadlineCounter');
    currentJournal = journal || currentJournal;
    
    const totalPages = Number(journal.totalPageCount || 40);
    const preparedPages = Math.max(0, Number(journal.preparedPageCount || 0));
    const safeTotal = totalPages > 0 ? totalPages : 40;
    const clampedPrepared = Math.min(preparedPages, safeTotal);
    const progressPercentage = Math.round((clampedPrepared / safeTotal) * 100);
    
    if (titleElement) titleElement.textContent = journal.name || 'NEX ANNUAL SCIENCE';
    if (authorsElement) authorsElement.textContent = journal.authors || 'C. Ertuğrul ERDOĞAN, NEX';
    if (deadlineCounter) {
        const days = Math.max(0, Number(journal.deadlineDays ?? journal.deadline ?? journal.deadline_days ?? 0));
        deadlineCounter.textContent = `${days}d`;
    }
    
    if (progressElement) {
        progressElement.textContent = `${clampedPrepared}/${safeTotal} sayfa hazırlandı`;
    }
    
    if (progressFill) {
        // Başlangıçta 0% yap
        progressFill.style.width = '0%';
        
        // 500ms sonra animasyonlu olarak gerçek değere geç
        setTimeout(() => {
            progressFill.style.width = `${progressPercentage}%`;
            progressFill.setAttribute('data-progress', String(progressPercentage));
        }, 500);
    }
    
    updateCurrentJournalPdfUrl(journal);
}

// Varsayılan progress display (journal bulunamadığında)
function updateDefaultProgressDisplay() {
    const titleElement = document.querySelector('.journal-title');
    const authorsElement = document.querySelector('.journal-authors');
    const progressElement = document.querySelector('.progress-text');
    const progressFill = document.querySelector('.progress-fill');
    
    // Varsayılan değerler
    const totalPages = 40;
    const currentProgress = 0;
    const progressPercentage = 0;
    
    // Varsayılan başlık ve yazar
    if (titleElement) titleElement.textContent = 'NEX ANNUAL SCIENCE';
    if (authorsElement) authorsElement.textContent = 'C. Ertuğrul ERDOĞAN, NEX';
    
    // Progress text'i güncelle
    if (progressElement) {
        progressElement.textContent = `${currentProgress}/${totalPages} sayfa hazırlandı`;
    }
    
    // Progress bar'ı güncelle
    if (progressFill) {
        progressFill.style.width = '0%';
        progressFill.setAttribute('data-progress', '0');
    }
    
    console.log(`✅ Varsayılan display ayarlandı: ${totalPages} sayfa hedefi`);
}

// Konsol için Journal fonksiyonları
async function getAllJournals() {
    try {
        const journals = await loadJournalsFromBackend();
        
        let output = '📚 JOURNAL LİSTESİ\n';
        output += '─'.repeat(50) + '\n';
        
        if (journals.length === 0) {
            output += 'Henüz journal kaydı bulunmuyor.\n';
        } else {
            journals.forEach((journal, index) => {
                output += `${index + 1}. ${journal.name}\n`;
                output += `   📝 Yazarlar: ${journal.authors}\n`;
                output += `   📅 Yıl: ${journal.year}\n`;
                output += `   📄 Sayfa: ${journal.pageCount || journal.page_count || 'Belirlenmemiş'}\n`;
                output += `   📊 Durum: ${journal.status || 'draft'}\n`;
                if (journal.pdfUrl || journal.pdf_url) {
                    output += `   📎 PDF: Mevcut\n`;
                }
                output += `   🕒 Oluşturulma: ${journal.created_at || 'Bilinmiyor'}\n`;
                output += '\n';
            });
        }
        
        addToConsoleOutput(output, 'info');
        
    } catch (error) {
        addToConsoleOutput(`❌ Journallar yüklenirken hata: ${error.message}`, 'error');
    }
}

async function showJournalStats() {
    try {
        const journals = await loadJournalsFromBackend();
        
        let output = '📊 JOURNAL İSTATİSTİKLERİ\n';
        output += '─'.repeat(50) + '\n';
        
        output += `📚 Toplam Journal Sayısı: ${journals.length}\n`;
        
        // Yıllara göre dağılım
        const yearStats = {};
        journals.forEach(journal => {
            const year = journal.year || 'Bilinmiyor';
            yearStats[year] = (yearStats[year] || 0) + 1;
        });
        
        output += '\n📅 Yıllara Göre Dağılım:\n';
        Object.entries(yearStats).sort().forEach(([year, count]) => {
            output += `   ${year}: ${count} journal\n`;
        });
        
        // Durum istatistikleri
        const statusStats = {};
        journals.forEach(journal => {
            const status = journal.status || 'draft';
            statusStats[status] = (statusStats[status] || 0) + 1;
        });
        
        output += '\n📊 Duruma Göre Dağılım:\n';
        Object.entries(statusStats).forEach(([status, count]) => {
            const statusText = {
                'draft': 'Taslak',
                'published': 'Yayınlanmış',
                'archived': 'Arşivlenmiş'
            }[status] || status;
            output += `   ${statusText}: ${count} journal\n`;
        });
        
        // PDF istatistikleri
        const pdfCount = journals.filter(j => j.pdfUrl || j.pdf_url).length;
        output += `\n📎 PDF Yüklü Journal Sayısı: ${pdfCount}/${journals.length}\n`;
        
        addToConsoleOutput(output, 'info');
        
    } catch (error) {
        addToConsoleOutput(`❌ İstatistikler yüklenirken hata: ${error.message}`, 'error');
    }
}

async function checkBackendStatus() {
    await testBackendConnection();
}

// PDF okuyucu fonksiyonu (backend URL'leri destekler)
async function openJournalPdf() {
    try {
        if (!currentJournalPdfUrl) {
            const journals = await loadJournalsFromBackend();
            if (journals.length > 0) {
                const currentJournal = journals.reduce((min, j) => (Number(j.id) < Number(min.id) ? j : min), journals[0]);
                if (currentJournal.pdfUrl || currentJournal.pdf_url) {
                    currentJournalPdfUrl = toWebPdfUrl(currentJournal.pdfUrl || currentJournal.pdf_url);
                } else {
                    alert('PDF dosyası bulunamadı!\n\nBu journal için henüz PDF yüklenmemiş.');
                    return;
                }
            } else {
                alert('Journal bulunamadı!');
                return;
            }
        }

        if (!(currentJournalPdfUrl.startsWith('https://') || currentJournalPdfUrl.startsWith('http://'))) {
            console.error('❌ Geçersiz PDF URL formatı:', currentJournalPdfUrl);
            alert('PDF URL formatı geçersiz!\n\nURL: ' + currentJournalPdfUrl);
            return;
        }

        openInNewTab(currentJournalPdfUrl);
    } catch (error) {
        console.error('❌ PDF açma hatası:', error);
        alert('PDF açılırken bir hata oluştu!\n\nHata: ' + error.message);
    }
}

// Journal verileri güncellendiğinde PDF URL'sini güncelle
function updateCurrentJournalPdfUrl(journal) {
    if (journal && (journal.pdfUrl || journal.pdf_url)) {
        const raw = journal.pdfUrl || journal.pdf_url;
        currentJournalPdfUrl = toWebPdfUrl(raw);
    }
}
