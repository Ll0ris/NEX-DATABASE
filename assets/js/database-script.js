document.addEventListener('DOMContentLoaded', function() {
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

        // Deadline hesaplama
        updateDeadline();
        
        // Her gün deadline'ı güncelle
        setInterval(updateDeadline, 24 * 60 * 60 * 1000);

        // Progress bar animasyonu
        animateProgressBar();
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
        
        console.log('📊 Progress bar placeholder başlatıldı - Firebase verisi bekleniyor...');
        
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

    console.log('🔍 Buton kontrolü:', {
        btnAbout: !!btnAbout,
        btnRead: !!btnRead,
        btnEdit: !!btnEdit,
        currentJournalPdfUrl: currentJournalPdfUrl
    });

    if (btnAbout) {
        btnAbout.addEventListener('click', function() {
            // Hakkında modalı veya sayfası açılacak
            console.log('Hakkında butonuna tıklandı');
            // showAboutModal(); // Bu fonksiyon sonra eklenecek
        });
    }

    // Oku butonu HTML'de onclick ile hallediliyor, JavaScript event listener gerekmiyor
    if (btnRead) {
        console.log('✅ Oku butonu bulundu. HTML onclick kullanılıyor.');
    } else {
        console.warn('⚠️ Oku butonu bulunamadı! Selector: .btn-read');
    }

    if (btnEdit) {
        btnEdit.addEventListener('click', function() {
            // Düzenleme formunu göster
            showJournalEditForm();
        });
    }

    // Calendar fonksiyonları
    function initializeCalendar() {
        // Admin yetkisi kontrolü (örnek - gerçek sistemde backend'den gelecek)
        const isAdmin = true; // Bu değer gerçek sistemde dinamik olacak
        
        if (isAdmin) {
            document.body.classList.add('admin-user');
            // Admin-mode'u kaldır - sadece admin moduna geçilince eklenir
            document.body.classList.remove('admin-mode');
        }

        // Takvimi başlat
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

    // Örnek etkinlik verileri (gerçek sistemde backend'den gelecek)
    const events = [
        {
            id: 1,
            title: 'Makine Öğrenmesi Semineri',
            date: '2025-08-15',
            time: '14:00'
        },
        {
            id: 2,
            title: 'Proje Sunumları',
            date: '2025-08-22',
            time: '10:00'
        },
        {
            id: 3,
            title: 'Yapay Zeka Konferansı',
            date: '2025-09-05',
            time: '09:00'
        },
        {
            id: 4,
            title: 'Veri Bilimi Workshops',
            date: '2025-09-12',
            time: '13:30'
        },
        {
            id: 5,
            title: 'Teknoloji Fuarı',
            date: '2025-09-25',
            time: '11:00'
        }
    ];

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
        if (!isOtherMonth) {
            const dateString = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const dayEvents = events.filter(event => event.date === dateString);
            
            if (dayEvents.length > 0) {
                dayElement.classList.add('has-event');
                const eventIndicator = document.createElement('div');
                eventIndicator.className = 'calendar-event-indicator';
                eventIndicator.textContent = dayEvents[0].title;
                dayElement.appendChild(eventIndicator);
            }
        }

        return dayElement;
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
    initializeCalendar();

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
    console.log('Safe mode enabled');
    
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
            console.log('Firebase başarıyla başlatıldı');
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
            console.log('✓ Firebase ready!');
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
    
    // Firebase bağlantısını kontrol et
    if (!initializeFirebase()) {
        addToConsoleOutput('⚠️ Firebase scriptleri yükleniyor, lütfen bekleyin...', 'info');
        // 2 saniye sonra tekrar dene
        setTimeout(() => {
            if (initializeFirebase()) {
                addToConsoleOutput('✓ Firebase bağlantısı başarılı!', 'success');
            } else {
                addToConsoleOutput('✗ Firebase bağlantısı kurulamadı!', 'error');
            }
        }, 2000);
    } else {
        addToConsoleOutput('✓ Firebase konsol açıldı. Hazır!', 'success');
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

function addUserForm() {
    const form = document.getElementById('userForm');
    form.style.display = form.style.display === 'none' ? 'block' : 'none';
    if (form.style.display === 'block') {
        addToConsoleOutput('Kullanıcı ekleme formu açıldı', 'info');
    }
}

function submitUser() {
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
    
    // Firebase bağlantısını kontrol et ve gerekirse başlat
    if (!initializeFirebase() || !window.firestoreDb) {
        addToConsoleOutput('✗ Hata: Firebase bağlantısı kurulamadı!', 'error');
        return;
    }
    
    const currentUser = localStorage.getItem('currentUserEmail') || 'system';
    const currentTime = new Date();
    
    addToConsoleOutput(`→ Kullanıcı ekleniyor: ${name} (${email})`, 'info');
    
    const { collection, addDoc } = window.firestoreFunctions;
    
    // Tüm parametreleri içeren kullanıcı objesi
    const userData = {
        // Temel bilgiler
        name: name,
        fullName: fullName || name, // fullName yoksa name kullan
        email: email.toLowerCase(),
        password: password,
        
        // İletişim bilgileri
        phone: phone || null,
        
        // Akademik bilgiler
        department: department || null,
        faculty: faculty || null,
        institution: institution || null,
        
        // Sosyal medya bağlantıları
        linkedinLink: linkedinLink || null,
        orcidLink: orcidLink || null,
        
        // Fotoğraf
        photoHTML: photoHTML || null,
        
        // Güvenlik bilgileri
        role: 'user', // Varsayılan role: normal kullanıcı
        
        // Sistem bilgileri
        createdAt: currentTime,
        lastUpdated: currentTime,
        createdBy: currentUser
    };
    
    addDoc(collection(window.firestoreDb, "users"), userData)
    .then(() => {
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
    }).catch(error => {
        addToConsoleOutput(`✗ Hata: ${error.message}`, 'error');
    });
}

function getAllUsers() {
    // Firebase bağlantısını kontrol et ve gerekirse başlat
    if (!initializeFirebase() || !window.firestoreDb) {
        addToConsoleOutput('✗ Hata: Firebase bağlantısı kurulamadı!', 'error');
        return;
    }
    
    addToConsoleOutput('→ Kullanıcılar getiriliyor...', 'info');
    
    const { collection, getDocs } = window.firestoreFunctions;
    
    getDocs(collection(window.firestoreDb, "users")).then(snapshot => {
        if (snapshot.empty) {
            addToConsoleOutput('ℹ️ Henüz kullanıcı kaydı bulunmuyor.', 'info');
            return;
        }
        
        addToConsoleOutput(`✓ ${snapshot.size} kullanıcı bulundu:`, 'success');
        snapshot.forEach(doc => {
            const data = doc.data();
            const createdAt = data.createdAt ? data.createdAt.toDate().toLocaleString('tr-TR') : 'Bilinmiyor';
            addToConsoleOutput(`  • ${data.name || 'İsimsiz'} - ${data.email || 'E-mail yok'} - Rol: ${data.role || 'user'} - Oluşturulma: ${createdAt}`);
        });
    }).catch(error => {
        addToConsoleOutput(`✗ Hata: ${error.message}`, 'error');
    });
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
        
        // Mevcut journal verilerini yükle (örnek veriler)
        loadCurrentJournalData();
    }
}

function loadCurrentJournalData() {
    // Sayfadaki mevcut verilerden yükle
    document.getElementById('journalName').value = 'NEX ANNUAL SCIENCE';
    document.getElementById('journalAuthors').value = 'C. Ertuğrul ERDOĞAN, NEX';
    document.getElementById('journalYear').value = '2024';
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

function saveJournalChanges() {
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
    
    // PDF varsa sayfa sayısını al
    if (formData.pdf) {
        getPdfPageCount(formData.pdf)
            .then(pageCount => {
                formData.pageCount = pageCount;
                console.log(`📄 PDF sayfa sayısı: ${pageCount}`);
                return saveJournalToFirebase(formData);
            })
            .then(() => {
                alert('Journal başarıyla kaydedildi!');
                cancelJournalEdit();
                location.reload();
            })
            .catch((error) => {
                console.error('Journal kaydetme hatası:', error);
                alert('Journal kaydedilirken bir hata oluştu: ' + error.message);
            })
            .finally(() => {
                saveButton.textContent = originalText;
                saveButton.disabled = false;
            });
    } else {
        // PDF yoksa varsayılan sayfa sayısı ile kaydet
        formData.pageCount = 40;
        saveJournalToFirebase(formData)
            .then(() => {
                alert('Journal başarıyla kaydedildi!');
                cancelJournalEdit();
                location.reload();
            })
            .catch((error) => {
                console.error('Journal kaydetme hatası:', error);
                alert('Journal kaydedilirken bir hata oluştu: ' + error.message);
            })
            .finally(() => {
                saveButton.textContent = originalText;
                saveButton.disabled = false;
            });
    }
}

// PDF sayfa sayısını alma fonksiyonu
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

async function saveJournalToFirebase(formData) {
    // Firebase'in hazır olmasını bekle
    await waitForFirebase();
    
    // Destructure ile fonksiyonları al ve kontrol et
    const { collection, addDoc, serverTimestamp } = window.firestoreFunctions;
    const { ref, uploadBytes, getDownloadURL } = window.storageFunctions;
    
    // Fonksiyonların mevcut olduğundan emin ol
    if (!serverTimestamp) {
        throw new Error('serverTimestamp fonksiyonu yüklenmemiş. Firebase henüz tam olarak hazır değil.');
    }
    
    if (!collection || !addDoc) {
        throw new Error('Firestore fonksiyonları yüklenmemiş. Firebase henüz tam olarak hazır değil.');
    }
    
    console.log('✅ Tüm Firebase fonksiyonları hazır');
    
    let pdfUrl = null;
    let pdfFileName = null;
    let storageError = null;
    
    try {
        // PDF dosyası varsa Storage'a yüklemeyi dene
        if (formData.pdf) {
            console.log('📎 PDF yükleniyor...');
            
            try {
                // Dosya adını benzersiz yap
                const timestamp = Date.now();
                const fileName = `${formData.year}_${formData.name.replace(/[^a-zA-Z0-9]/g, '_')}_${timestamp}.pdf`;
                pdfFileName = fileName;
                
                // Storage referansı oluştur
                const storageRef = ref(window.firebaseStorage, `journals/${fileName}`);
                
                // Dosyayı yükle
                const snapshot = await uploadBytes(storageRef, formData.pdf);
                console.log('✅ PDF yüklendi:', snapshot);
                
                // Download URL'i al
                pdfUrl = await getDownloadURL(storageRef);
                console.log('✅ PDF URL alındı:', pdfUrl);
                
            } catch (uploadError) {
                console.error('⚠️ PDF yükleme hatası:', uploadError);
                storageError = uploadError;
                
                // CORS veya Storage hatalarını kontrol et
                if (uploadError.code === 'storage/bucket-not-found' || 
                    uploadError.message.includes('CORS') ||
                    uploadError.message.includes('preflight')) {
                    
                    console.warn('⚠️ Firebase Storage henüz etkinleştirilmemiş veya CORS sorunu var');
                    alert('⚠️ Firebase Storage etkinleştirilmemiş!\n\nJournal verisi Firestore\'a kaydedilecek ancak PDF yüklenemedi.\n\nÇözüm: Firebase Console > Storage > Get Started');
                } else {
                    throw uploadError; // Diğer hatalar için exception fırlat
                }
            }
        }
        
        // Firestore'a journal verisini kaydet
        console.log('📝 Journal verisi Firestore\'a kaydediliyor...');
        
        const journalData = {
            name: formData.name.trim(),
            authors: formData.authors.trim(),
            year: formData.year,
            pageCount: formData.pageCount || 40, // PDF'den alınan sayfa sayısı veya varsayılan
            pdfUrl: pdfUrl,
            pdfFileName: pdfFileName,
            pdfUploadError: storageError ? storageError.message : null,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            status: 'draft' // draft, published, archived gibi durumlar
        };
        
        const docRef = await addDoc(collection(window.firestoreDb, 'journals'), journalData);
        console.log('✅ Journal Firestore\'a kaydedildi, ID:', docRef.id);
        
        // Kullanıcıya durum bilgisi ver
        if (storageError) {
            console.warn('⚠️ Journal kaydedildi ancak PDF yüklenemedi');
        } else if (pdfUrl) {
            console.log('✅ Journal ve PDF başarıyla kaydedildi');
        } else {
            console.log('✅ Journal kaydedildi (PDF yüklenmedi)');
        }
        
        return docRef.id;
        
    } catch (error) {
        console.error('❌ Firebase kaydetme hatası:', error);
        throw error;
    }
}

function waitForFirebase() {
    return new Promise((resolve, reject) => {
        let attempts = 0;
        const maxAttempts = 100; // 10 saniye timeout
        
        function checkFirebase() {
            // Daha detaylı kontrol
            const hasFirestore = window.firestoreDb && window.firestoreFunctions;
            const hasStorage = window.firebaseStorage && window.storageFunctions;
            const hasAllFunctions = window.firestoreFunctions && 
                window.firestoreFunctions.collection && 
                window.firestoreFunctions.addDoc && 
                window.firestoreFunctions.getDocs &&
                window.firestoreFunctions.serverTimestamp; // serverTimestamp kontrolü ekle
            
            console.log(`Firebase kontrol ${attempts + 1}:`, {
                hasFirestore,
                hasStorage,
                hasAllFunctions,
                firestoreDb: !!window.firestoreDb,
                firebaseStorage: !!window.firebaseStorage,
                serverTimestamp: !!window.firestoreFunctions?.serverTimestamp
            });
            
            if (hasFirestore && hasStorage && hasAllFunctions) {
                console.log('✅ Firebase hazır!');
                resolve();
            } else if (attempts < maxAttempts) {
                attempts++;
                setTimeout(checkFirebase, 100);
            } else {
                console.error('❌ Firebase timeout - Mevcut durumu:', {
                    firestoreDb: !!window.firestoreDb,
                    firebaseStorage: !!window.firebaseStorage,
                    firestoreFunctions: !!window.firestoreFunctions,
                    storageFunctions: !!window.storageFunctions
                });
                reject(new Error('Firebase connection timeout - Firebase scripts may not be loaded properly'));
            }
        }
        
        checkFirebase();
    });
}

// Global fonksiyonları window objesine ekle
window.showJournalEditForm = showJournalEditForm;
window.cancelJournalEdit = cancelJournalEdit;
window.removeFile = removeFile;
window.saveJournalChanges = saveJournalChanges;
window.loadJournalsFromFirebase = loadJournalsFromFirebase;
window.updateJournalDisplay = updateJournalDisplay;
window.updateDefaultProgressDisplay = updateDefaultProgressDisplay;
window.getAllJournals = getAllJournals;
window.showJournalStats = showJournalStats;
window.testFirebaseConnection = testFirebaseConnection;
window.checkStorageStatus = checkStorageStatus;
window.openJournalPdf = openJournalPdf;
window.debugPdfUrls = debugPdfUrls;
window.testDirectPdfAccess = testDirectPdfAccess;
window.manualPdfTest = manualPdfTest;
window.fixStorageRules = fixStorageRules;

// Firebase bağlantı testi
async function testFirebaseConnection() {
    console.log('🔧 Firebase bağlantı testi başlıyor...');
    
    try {
        await waitForFirebase();
        console.log('✅ Firebase bağlantısı başarılı!');
        
        // Basit bir Firestore testi
        const { collection, getDocs } = window.firestoreFunctions;
        const testRef = collection(window.firestoreDb, 'journals');
        const snapshot = await getDocs(testRef);
        
        console.log('✅ Firestore testi başarılı, doküman sayısı:', snapshot.size);
        addToConsoleOutput(`✅ Firestore: ${snapshot.size} doküman bulundu`, 'success');
        
        // Storage durumu kontrolü
        try {
            const { ref, getDownloadURL } = window.storageFunctions;
            
            // Test için sadece referans oluştur (dosya yükleme testi yapma)
            const storageRef = ref(window.firebaseStorage, 'test/connection-test.txt');
            console.log('✅ Storage referansı oluşturuldu:', storageRef.name);
            addToConsoleOutput(`✅ Storage referansı başarılı: ${storageRef.name}`, 'success');
            
            // Storage Rules kontrol et
            addToConsoleOutput('⚠️ Storage etkinleştirilmiş görünüyor, ancak CORS hatası alıyorsanız:', 'warning');
            addToConsoleOutput('1. Firebase Console > Storage > Rules sekmesine gidin', 'info');
            addToConsoleOutput('2. Test mode rules ekleyin veya CORS ayarlarını kontrol edin', 'info');
            
        } catch (storageError) {
            console.error('❌ Storage hatası:', storageError);
            addToConsoleOutput(`❌ Storage hatası: ${storageError.message}`, 'error');
            
            if (storageError.code === 'storage/bucket-not-found') {
                addToConsoleOutput('🔧 Firebase Storage henüz etkinleştirilmemiş!', 'warning');
                addToConsoleOutput('Çözüm: Firebase Console > Storage > Get Started', 'info');
            }
        }
        
    } catch (error) {
        console.error('❌ Firebase bağlantı testi başarısız:', error);
        addToConsoleOutput(`❌ Firebase testi başarısız: ${error.message}`, 'error');
    }
}

// Sayfa yüklendiğinde journalları yükle
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Database script yüklendi');
    
    // Firebase ready event'ini dinle
    window.addEventListener('firebaseReady', function() {
        console.log('🔥 Firebase ready event alındı, journallar yükleniyor...');
        loadJournalsFromFirebase()
            .then(() => {
                console.log('✅ Journallar başarıyla yüklendi');
            })
            .catch((error) => {
                console.warn('⚠️ Journallar yüklenemedi:', error.message);
            });
    });
    
    // Fallback: Firebase event gelmezse 3 saniye sonra dene
    setTimeout(() => {
        if (!window.firebaseInitialized) {
            console.warn('⚠️ Firebase event gelmedi, fallback deneniyor...');
            loadJournalsFromFirebase()
                .then(() => {
                    console.log('✅ Journallar fallback ile yüklendi');
                })
                .catch((error) => {
                    console.warn('⚠️ Fallback ile de yüklenemedi:', error.message);
                });
        }
    }, 3000);
});

async function loadJournalsFromFirebase() {
    try {
        console.log('📚 Journal yükleme başlıyor...');
        await waitForFirebase();
        
        const { collection, getDocs, query, orderBy } = window.firestoreFunctions;
        
        console.log('📚 Journallar Firebase\'den yükleniyor...');
        const journalsRef = collection(window.firestoreDb, 'journals');
        const q = query(journalsRef, orderBy('year', 'desc'));
        const querySnapshot = await getDocs(q);
        
        const journals = [];
        querySnapshot.forEach((doc) => {
            journals.push({
                id: doc.id,
                ...doc.data()
            });
        });
        
        console.log('📚 Yüklenen journallar:', journals);
        
        // İlk journal'ı sayfada göster (varsa)
        if (journals.length > 0) {
            updateJournalDisplay(journals[0]);
            console.log('📚 İlk journal sayfada gösterildi');
        } else {
            console.log('📚 Henüz journal bulunamadı');
            // Varsayılan değerlerle progress bar'ı güncelle
            updateDefaultProgressDisplay();
        }
        
        return journals;
        
    } catch (error) {
        console.error('❌ Journallar yüklenirken hata:', error);
        throw error;
    }
}

function updateJournalDisplay(journal) {
    // Sayfadaki journal bilgilerini güncelle
    const titleElement = document.querySelector('.journal-title');
    const authorsElement = document.querySelector('.journal-authors');
    const progressElement = document.querySelector('.progress-text');
    const progressFill = document.querySelector('.progress-fill');
    
    // Sabit hedef: 40 sayfa, Firebase'den hazırlanmış sayfa sayısını al
    const targetPages = 40; // Her zaman sabit 40 sayfa hedef
    const completedPages = journal.pageCount || 0; // Firebase'den gelen pageCount = hazırlanmış sayfa sayısı
    const progressPercentage = Math.round((completedPages / targetPages) * 100);
    
    console.log(`📊 Journal progress güncelleniyor: ${completedPages}/${targetPages} (${progressPercentage}%)`);
    console.log(`📋 Hedef sayfa sayısı (sabit): ${targetPages}`);
    console.log(`📋 Hazırlanmış sayfa sayısı (pageCount): ${completedPages}`);
    
    // Başlık ve yazar bilgilerini güncelle
    if (titleElement) titleElement.textContent = journal.name || 'NEX ANNUAL SCIENCE';
    if (authorsElement) authorsElement.textContent = journal.authors || 'C. Ertuğrul ERDOĞAN, NEX';
    
    // Progress text'i güncelle (hazırlanmış/hedef format)
    if (progressElement) {
        progressElement.textContent = `${completedPages}/${targetPages} sayfa hazırlandı`;
    }
    
    // Progress bar'ı animasyonlu olarak güncelle
    if (progressFill) {
        // Başlangıçta 0% yap
        progressFill.style.width = '0%';
        
        // 500ms sonra animasyonlu olarak gerçek değere geç
        setTimeout(() => {
            progressFill.style.width = `${progressPercentage}%`;
            progressFill.setAttribute('data-progress', progressPercentage);
        }, 500);
    }
    
    // PDF URL'sini güncelle
    updateCurrentJournalPdfUrl(journal);
    
    console.log(`✅ Journal display güncellendi: ${journal.name} - ${completedPages}/${targetPages} sayfa`);
}

// Varsayılan progress display (journal bulunamadığında)
function updateDefaultProgressDisplay() {
    const titleElement = document.querySelector('.journal-title');
    const authorsElement = document.querySelector('.journal-authors');
    const progressElement = document.querySelector('.progress-text');
    const progressFill = document.querySelector('.progress-fill');
    
    console.log('📋 Varsayılan progress display ayarlanıyor...');
    
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
        const journals = await loadJournalsFromFirebase();
        
        let output = '📚 JOURNAL LİSTESİ\n';
        output += '─'.repeat(50) + '\n';
        
        if (journals.length === 0) {
            output += 'Henüz journal kaydı bulunmuyor.\n';
        } else {
            journals.forEach((journal, index) => {
                output += `${index + 1}. ${journal.name}\n`;
                output += `   📝 Yazarlar: ${journal.authors}\n`;
                output += `   📅 Yıl: ${journal.year}\n`;
                output += `   📄 Sayfa: ${journal.pageCount || 'Belirlenmemiş'}\n`;
                output += `   📊 Durum: ${journal.status || 'draft'}\n`;
                if (journal.pdfUrl) {
                    output += `   📎 PDF: Mevcut\n`;
                }
                output += `   🕒 Oluşturulma: ${journal.createdAt ? journal.createdAt.toDate().toLocaleDateString('tr-TR') : 'Bilinmiyor'}\n`;
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
        const journals = await loadJournalsFromFirebase();
        
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
        const pdfCount = journals.filter(j => j.pdfUrl).length;
        output += `\n📎 PDF Yüklü Journal Sayısı: ${pdfCount}/${journals.length}\n`;
        
        addToConsoleOutput(output, 'info');
        
    } catch (error) {
        addToConsoleOutput(`❌ İstatistikler yüklenirken hata: ${error.message}`, 'error');
    }
}

async function checkStorageStatus() {
    try {
        await waitForFirebase();
        
        let output = '☁️ FIREBASE STORAGE DURUMU\n';
        output += '─'.repeat(50) + '\n';
        
        const { ref, getDownloadURL, uploadBytes } = window.storageFunctions;
        
        try {
            // Storage referansı oluşturmayı dene
            const testRef = ref(window.firebaseStorage, 'test/status-check.txt');
            output += `✅ Storage Bucket: ${window.firebaseStorage.app.options.storageBucket}\n`;
            output += `✅ Test referansı oluşturuldu: ${testRef.name}\n`;
            
            // Küçük bir test dosyası yüklemeyi dene
            const testBlob = new Blob(['test'], { type: 'text/plain' });
            const uploadResult = await uploadBytes(testRef, testBlob);
            output += `✅ Test yükleme başarılı: ${uploadResult.metadata.name}\n`;
            
            // Download URL almayı dene
            const downloadUrl = await getDownloadURL(testRef);
            output += `✅ Download URL alındı: ${downloadUrl.substring(0, 50)}...\n`;
            
            output += '\n✅ Firebase Storage tamamen etkin ve çalışıyor!\n';
            output += '📝 PDF yükleme işlemleri normal çalışmalı.\n';
            
        } catch (storageError) {
            output += `❌ Storage Hatası: ${storageError.code || 'Bilinmeyen'}\n`;
            output += `❌ Hata Mesajı: ${storageError.message}\n\n`;
            
            if (storageError.code === 'storage/bucket-not-found') {
                output += '🔧 ÇÖZÜM: Firebase Storage henüz etkinleştirilmemiş!\n';
                output += '1. Firebase Console > Storage > Get Started\n';
                output += '2. Test mode seç ve location belirle\n';
                output += '3. Kurulum tamamlandıktan sonra tekrar dene\n\n';
            } else if (storageError.message.includes('CORS')) {
                output += '🔧 ÇÖZÜM: CORS sorunu tespit edildi!\n';
                output += '1. Firebase Console > Storage > Rules\n';
                output += '2. Test mode rules ekle\n';
                output += '3. CORS ayarlarını kontrol et\n\n';
            }
            
            output += '📋 Mevcut Durum:\n';
            output += `   - Firestore: ✅ Aktif\n`;
            output += `   - Storage: ❌ Etkin değil veya erişim sorunu\n`;
            output += `   - PDF Yükleme: ❌ Çalışmıyor\n`;
            output += `   - Journal Kaydetme: ✅ Çalışıyor (PDF olmadan)\n`;
        }
        
        addToConsoleOutput(output, storageError ? 'warning' : 'success');
        
    } catch (error) {
        addToConsoleOutput(`❌ Storage durumu kontrol edilemedi: ${error.message}`, 'error');
    }
}

// PDF okuyucu fonksiyonu
let currentJournalPdfUrl = null; // Global değişken olarak PDF URL'sini tutacağız

async function openJournalPdf() {
    console.log('🚀 openJournalPdf fonksiyonu çağrıldı!');
    
    try {
        console.log('🔍 PDF açma isteği başlatıldı...');
        console.log('📋 Mevcut PDF URL:', currentJournalPdfUrl);
        
        // Mevcut journal'ın PDF URL'sini kontrol et
        if (!currentJournalPdfUrl) {
            console.log('📚 PDF URL bulunamadı, Firebase\'den journal verileri alınıyor...');
            
            // Firebase'den journal verilerini al
            const journals = await loadJournalsFromFirebase();
            console.log('📋 Alınan journallar:', journals);
            
            if (journals.length > 0) {
                const currentJournal = journals[0];
                console.log('📄 Mevcut journal:', currentJournal);
                
                if (currentJournal.pdfUrl) {
                    currentJournalPdfUrl = currentJournal.pdfUrl;
                    console.log('✅ PDF URL bulundu:', currentJournalPdfUrl);
                } else {
                    console.log('⚠️ Journal var ama PDF URL yok');
                    alert('PDF dosyası bulunamadı!\n\nBu journal için henüz PDF yüklenmemiş.\nPDF yüklemek için düzenleme panelini kullanın.');
                    return;
                }
            } else {
                console.log('⚠️ Hiç journal bulunamadı');
                alert('Journal bulunamadı!\n\nÖnce bir journal oluşturun ve PDF yükleyin.');
                return;
            }
        }
        
        console.log('📖 PDF açılıyor:', currentJournalPdfUrl);
        
        // URL formatını kontrol et
        if (!currentJournalPdfUrl.startsWith('https://')) {
            console.error('❌ Geçersiz PDF URL formatı:', currentJournalPdfUrl);
            alert('PDF URL formatı geçersiz!\n\nURL: ' + currentJournalPdfUrl);
            return;
        }
        
        // CORS kontrolünü atla - direkt window.open kullan (Test 3 yöntemi)
        console.log('� Direct window.open ile PDF açılıyor...');
        
        try {
            // Test 3'te başarılı olan yöntemi kullan
            const newWindow = window.open(currentJournalPdfUrl, '_blank', 'width=1200,height=800,scrollbars=yes,resizable=yes');
            
            if (newWindow) {
                console.log('✅ PDF başarıyla yeni sekmede açıldı');
                
                // Pencere odağını kontrol et
                try {
                    newWindow.focus();
                } catch (focusError) {
                    console.log('ℹ️ Pencere odağı ayarlanamadı (normal durum)');
                }
                
            } else {
                throw new Error('Pop-up engellendi veya pencere açılamadı');
            }
            
        } catch (openError) {
            console.log('⚠️ Direct window.open başarısız, alternatif yöntem deneniyor...');
            console.error('Window.open hatası:', openError);
            
            // Alternatif yöntem: Download link oluştur
            try {
                const downloadLink = document.createElement('a');
                downloadLink.href = currentJournalPdfUrl;
                downloadLink.target = '_blank';
                downloadLink.rel = 'noopener noreferrer';
                downloadLink.style.display = 'none';
                
                // Linki geçici olarak DOM'a ekle ve tıkla
                document.body.appendChild(downloadLink);
                downloadLink.click();
                document.body.removeChild(downloadLink);
                
                console.log('✅ Alternatif download linki oluşturuldu');
                
            } catch (downloadError) {
                console.error('❌ Alternatif yöntem de başarısız:', downloadError);
                
                // CORS hatası durumunda özel mesaj
                alert(`🔒 PDF açılamadı!\n\n` +
                      `Bu sorun genellikle Firebase Storage Rules ile ilgilidir.\n\n` +
                      `Çözüm için:\n` +
                      `1. Admin Panel > Console açın\n` +
                      `2. "Storage Rules Düzelt" butonuna tıklayın\n` +
                      `3. Talimatları takip edin\n\n` +
                      `Veya pop-up engelleyicinizi kontrol edin.`);
            }
        }
        
    } catch (error) {
        console.error('❌ PDF açma hatası:', error);
        alert('PDF açılırken bir hata oluştu!\n\nHata: ' + error.message + '\n\nDetaylar console\'da görülebilir.');
    }
}

// Journal verileri güncellendiğinde PDF URL'sini güncelle
function updateCurrentJournalPdfUrl(journal) {
    if (journal && journal.pdfUrl) {
        currentJournalPdfUrl = journal.pdfUrl;
        console.log('📎 PDF URL güncellendi:', currentJournalPdfUrl);
    }
}

// PDF URL debug fonksiyonu
async function debugPdfUrls() {
    try {
        const journals = await loadJournalsFromFirebase();
        
        let output = '📄 PDF URL DEBUG BİLGİLERİ\n';
        output += '─'.repeat(50) + '\n';
        
        if (journals.length === 0) {
            output += 'Henüz journal kaydı bulunmuyor.\n';
        } else {
            for (let i = 0; i < journals.length; i++) {
                const journal = journals[i];
                output += `${i + 1}. ${journal.name}\n`;
                output += `   📅 Yıl: ${journal.year}\n`;
                
                if (journal.pdfUrl) {
                    output += `   ✅ PDF URL: ${journal.pdfUrl}\n`;
                    output += `   🔗 URL Tipi: ${journal.pdfUrl.startsWith('https://') ? 'HTTPS (Doğru)' : 'Geçersiz Format'}\n`;
                    
                    // URL erişilebilirlik testi
                    try {
                        const response = await fetch(journal.pdfUrl, { method: 'HEAD' });
                        output += `   📡 Erişim: ${response.ok ? '✅ Başarılı' : '❌ Başarısız'} (${response.status})\n`;
                    } catch (fetchError) {
                        output += `   📡 Erişim: ❌ Hata - ${fetchError.message}\n`;
                    }
                } else {
                    output += `   ❌ PDF yüklenmemiş\n`;
                }
                
                if (journal.pdfFileName) {
                    output += `   📎 Dosya Adı: ${journal.pdfFileName}\n`;
                }
                
                output += '\n';
            }
            
            output += '🔧 SORUN GİDERME:\n';
            output += '- URL https:// ile başlıyorsa: ✅ Format doğru\n';
            output += '- Erişim başarılıysa: ✅ PDF mevcut\n';
            output += '- 404 hatası: ❌ PDF Storage\'da yok\n';
            output += '- CORS hatası: ❌ Storage rules sorunu\n';
        }
        
        addToConsoleOutput(output, 'info');
        
    } catch (error) {
        addToConsoleOutput(`❌ PDF debug hatası: ${error.message}`, 'error');
    }
}

// Manuel PDF erişim testi
async function testDirectPdfAccess() {
    try {
        // Firebase Storage'da var olan PDF'leri listelemeyi dene
        await waitForFirebase();
        
        const { ref, listAll } = window.storageFunctions;
        
        console.log('📂 Firebase Storage\'da journals klasörü kontrol ediliyor...');
        const journalsRef = ref(window.firebaseStorage, 'journals/');
        
        try {
            const result = await listAll(journalsRef);
            
            let output = '📂 FIREBASE STORAGE JOURNAL KLASÖRÜ\n';
            output += '─'.repeat(50) + '\n';
            output += `📊 Toplam dosya sayısı: ${result.items.length}\n\n`;
            
            if (result.items.length > 0) {
                for (let i = 0; i < result.items.length; i++) {
                    const item = result.items[i];
                    output += `${i + 1}. ${item.name}\n`;
                    output += `   📂 Tam yol: ${item.fullPath}\n`;
                    
                    try {
                        const { getDownloadURL } = window.storageFunctions;
                        const downloadUrl = await getDownloadURL(item);
                        output += `   🔗 Download URL: ${downloadUrl.substring(0, 80)}...\n`;
                    } catch (urlError) {
                        output += `   ❌ URL alma hatası: ${urlError.message}\n`;
                    }
                    output += '\n';
                }
            } else {
                output += '📂 journals/ klasörü boş.\n';
                output += '💡 İlk önce bir PDF yükleyin.\n';
            }
            
            addToConsoleOutput(output, 'info');
            
        } catch (listError) {
            addToConsoleOutput(`❌ Storage listeleme hatası: ${listError.message}`, 'error');
        }
        
    } catch (error) {
        addToConsoleOutput(`❌ PDF erişim testi hatası: ${error.message}`, 'error');
    }
}

// Manuel PDF test (URL ile)
async function manualPdfTest() {
    const testUrl = prompt('Test edilecek PDF URL\'sini girin:', 'https://firebasestorage.googleapis.com/v0/b/nex-database.firebasestorage.app/o/journals%2F...');
    
    if (!testUrl) return;
    
    let output = '🧪 MANUEL PDF URL TESİ\n';
    output += '─'.repeat(50) + '\n';
    output += `📎 Test URL: ${testUrl}\n\n`;
    
    try {
        // URL format kontrolü
        if (!testUrl.startsWith('https://firebasestorage.googleapis.com/')) {
            output += '❌ Geçersiz Firebase Storage URL formatı\n';
            output += '✅ Doğru format: https://firebasestorage.googleapis.com/v0/b/bucket/o/path\n';
        } else {
            output += '✅ URL formatı doğru\n';
        }
        
        // HTTP HEAD isteği ile dosya kontrolü
        const response = await fetch(testUrl, { 
            method: 'HEAD',
            mode: 'cors',
            cache: 'no-cache'
        });
        output += `📡 HTTP Status: ${response.status} ${response.statusText}\n`;
        
        if (response.ok) {
            output += '✅ PDF dosyasına erişim başarılı!\n';
            output += `📊 Content-Type: ${response.headers.get('content-type')}\n`;
            output += `📊 Content-Length: ${response.headers.get('content-length')} bytes\n`;
            
            // PDF'i açmayı dene
            const openPdf = confirm('PDF dosyasını açmak istiyor musunuz?');
            if (openPdf) {
                window.open(testUrl, '_blank');
            }
        } else {
            output += '❌ PDF dosyasına erişim başarısız!\n';
            
            if (response.status === 404) {
                output += '💡 404: Dosya bulunamadı - Storage\'da mevcut değil\n';
            } else if (response.status === 403) {
                output += '💡 403: Erişim reddedildi - Storage rules kontrol edin\n';
            }
        }
        
    } catch (error) {
        output += `❌ Test hatası: ${error.message}\n`;
        
        if (error.message.includes('CORS')) {
            output += '💡 CORS hatası: Storage rules veya browser ayarları\n';
        }
    }
    
    addToConsoleOutput(output, 'info');
}

// Firebase Storage Rules düzeltme önerileri
async function fixStorageRules() {
    let output = '🔧 FIREBASE STORAGE CORS HATASI ÇÖZÜMLERİ\n';
    output += '═'.repeat(60) + '\n\n';
    
    output += '❌ Aldığınız Hata: "Cross-Origin Request Blocked"\n';
    output += 'Bu hata Firebase Storage\'ın güvenlik kuralları nedeniyle oluşuyor.\n\n';
    
    output += '� HIZLI ÇÖZÜM (Önerilen):\n';
    output += '─'.repeat(30) + '\n';
    output += '1. https://console.firebase.google.com/ adresine gidin\n';
    output += '2. "nex-database" projenizi seçin\n';
    output += '3. Sol menüden "Storage" seçin\n';
    output += '4. Üst menüden "Rules" sekmesine tıklayın\n';
    output += '5. Aşağıdaki kuralları kopyalayıp yapıştırın:\n\n';
    
    output += '📋 KOPYALAYIN VE YAPIŞTIRIN:\n';
    output += '─'.repeat(30) + '\n';
    const quickRules = `rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if true;
    }
  }
}`;
    output += quickRules + '\n\n';
    
    output += '6. "Publish" butonuna tıklayın\n';
    output += '7. 2-3 dakika bekleyin\n';
    output += '8. Bu sayfayı yenileyin ve PDF\'i tekrar test edin\n\n';
    
    output += '⏰ ZAMAN SINIRLI ÇÖZÜM (Geliştirme için):\n';
    output += '─'.repeat(40) + '\n';
    const tempRules = `rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if request.time < timestamp.date(2025, 12, 31);
    }
  }
}`;
    output += tempRules + '\n\n';
    
    output += '🔧 MANUEL TEST:\n';
    output += '─'.repeat(15) + '\n';
    output += 'Bu konsolda "Test PDF Erişimi" butonuna tıklayarak\n';
    output += 'kuralların çalışıp çalışmadığını kontrol edebilirsiniz.\n\n';
    
    output += '⚠️ ÖNEMLİ NOTLAR:\n';
    output += '─'.repeat(18) + '\n';
    output += '• Yukarıdaki kurallar GELİŞTİRME amaçlıdır\n';
    output += '• Prodüksiyonda güvenlik kurallarını düzenleyin\n';
    output += '• Rules değişikliği 5-10 dakika sürebilir\n';
    output += '• Hala hata alıyorsanız sayfa önbelleğini temizleyin (Ctrl+F5)\n\n';
    
    output += '🆘 YARDIM:\n';
    output += '─'.repeat(10) + '\n';
    output += 'Hala sorun yaşıyorsanız:\n';
    output += '1. Firebase Console > Storage > Usage sekmesini kontrol edin\n';
    output += '2. Browser Developer Tools > Network sekmesini kontrol edin\n';
    output += '3. Storage bucket\'ın doğru olduğunu kontrol edin\n\n';
    
    addToConsoleOutput(output, 'warning');
    
    // Rules metnini panoya kopyalamaya çalış
    try {
        await navigator.clipboard.writeText(quickRules);
        addToConsoleOutput('✅ Storage Rules metni panoya kopyalandı!', 'success');
        addToConsoleOutput('Firebase Console > Storage > Rules sekmesine yapıştırabilirsiniz.', 'info');
    } catch (error) {
        addToConsoleOutput('ℹ️ Rules metnini yukarıdan manuel olarak kopyalayın', 'info');
    }
}

// Gelişmiş PDF erişim testi
async function testPdfAccess() {
    addToConsoleOutput('🔍 PDF Erişim Testi Başlatılıyor...', 'info');
    addToConsoleOutput('─'.repeat(40), 'info');
    
    try {
        // Mevcut PDF URL'yi al
        let pdfUrl = currentJournalPdfUrl;
        
        if (!pdfUrl) {
            addToConsoleOutput('📚 PDF URL bulunamadı, Firebase\'den yükleniyor...', 'warning');
            const journals = await loadJournalsFromFirebase();
            
            if (journals.length > 0 && journals[0].pdfUrl) {
                pdfUrl = journals[0].pdfUrl;
                currentJournalPdfUrl = pdfUrl;
                addToConsoleOutput(`✅ PDF URL bulundu: ${pdfUrl.substring(0, 100)}...`, 'success');
            } else {
                addToConsoleOutput('❌ Hiç PDF bulunamadı!', 'error');
                addToConsoleOutput('Önce bir journal oluşturup PDF yükleyin.', 'info');
                return;
            }
        }
        
        addToConsoleOutput(`📋 Test edilen URL: ${pdfUrl.substring(0, 80)}...`, 'info');
        
        // Test 1: HEAD Request
        addToConsoleOutput('🔬 Test 1: HEAD Request (CORS olmadan)', 'info');
        try {
            const headResponse = await fetch(pdfUrl, { 
                method: 'HEAD',
                mode: 'no-cors'
            });
            addToConsoleOutput(`✅ HEAD Request başarılı`, 'success');
        } catch (headError) {
            addToConsoleOutput(`❌ HEAD Request başarısız: ${headError.message}`, 'error');
        }
        
        // Test 2: CORS Request
        addToConsoleOutput('🔬 Test 2: CORS Request', 'info');
        try {
            const corsResponse = await fetch(pdfUrl, { 
                method: 'HEAD',
                mode: 'cors',
                credentials: 'omit'
            });
            addToConsoleOutput(`✅ CORS Request başarılı: ${corsResponse.status}`, 'success');
        } catch (corsError) {
            addToConsoleOutput(`❌ CORS Request başarısız: ${corsError.message}`, 'error');
            
            if (corsError.message.includes('NetworkError') || 
                corsError.message.includes('CORS') ||
                corsError.message.includes('Origin')) {
                addToConsoleOutput('🚨 CORS HATASI TESPİT EDİLDİ!', 'error');
                addToConsoleOutput('Bu hatanın çözümü için "Storage Rules Düzelt" butonuna tıklayın.', 'warning');
            }
        }
        
        // Test 3: Direct Access Test
        addToConsoleOutput('🔬 Test 3: Direct Window Open Test', 'info');
        try {
            const directResult = confirm('PDF\'i yeni sekmede açmayı test etmek istiyor musunuz?\n\n(Eğer PDF açılırsa testi kapayabilirsiniz)');
            if (directResult) {
                const testWindow = window.open(pdfUrl, '_blank', 'width=800,height=600');
                if (testWindow) {
                    addToConsoleOutput('✅ Yeni sekme açıldı - PDF\'in yüklenip yüklenmediğini kontrol edin', 'success');
                    setTimeout(() => {
                        try {
                            testWindow.close();
                        } catch (e) {
                            // Sekme kapatılamayabilir
                        }
                    }, 5000);
                } else {
                    addToConsoleOutput('❌ Pop-up engellendi', 'error');
                }
            }
        } catch (directError) {
            addToConsoleOutput(`❌ Direct access başarısız: ${directError.message}`, 'error');
        }
        
        // Test 4: URL Format Check
        addToConsoleOutput('🔬 Test 4: URL Format Kontrolü', 'info');
        const urlChecks = [
            { check: 'HTTPS', result: pdfUrl.startsWith('https://') },
            { check: 'Firebase Storage', result: pdfUrl.includes('firebasestorage.googleapis.com') },
            { check: 'Token', result: pdfUrl.includes('token=') },
            { check: 'Alt media', result: pdfUrl.includes('alt=media') }
        ];
        
        urlChecks.forEach(({ check, result }) => {
            addToConsoleOutput(`${result ? '✅' : '❌'} ${check}: ${result ? 'OK' : 'FAIL'}`, result ? 'success' : 'error');
        });
        
        addToConsoleOutput('', 'info');
        addToConsoleOutput('🔧 TEST SONUCU:', 'warning');
        addToConsoleOutput('Eğer CORS hatası alıyorsanız Firebase Storage Rules\'ı düzeltmeniz gerekiyor.', 'info');
        addToConsoleOutput('Çözüm için "Storage Rules Düzelt" butonuna tıklayın.', 'info');
        
    } catch (error) {
        addToConsoleOutput(`❌ Test sırasında hata: ${error.message}`, 'error');
    }
}

// Window global fonksiyonları güncelle
window.testPdfAccess = testPdfAccess;
