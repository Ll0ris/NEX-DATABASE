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
        const progressFill = document.querySelector('.progress-fill');
        const progressText = document.querySelector('.progress-text');
        
        if (progressFill && progressText) {
            // Örnek progress değeri (gerçek sistemde backend'den gelecek)
            const currentPages = 0;
            const totalPages = 40;
            const progressPercentage = (currentPages / totalPages) * 100;
            
            // Animasyonlu progress bar
            setTimeout(() => {
                progressFill.style.width = `${progressPercentage}%`;
            }, 500);
            
            progressText.textContent = `${currentPages}/${totalPages} sayfa hazırlandı`;
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
            console.log('Hakkında butonuna tıklandı');
            // showAboutModal(); // Bu fonksiyon sonra eklenecek
        });
    }

    if (btnRead) {
        btnRead.addEventListener('click', function() {
            // Dergiyi okuma sayfası açılacak
            console.log('Oku butonuna tıklandı');
            // window.open('journal-reader.html', '_blank');
        });
    }

    if (btnEdit) {
        btnEdit.addEventListener('click', function() {
            // Düzenleme sayfası açılacak
            console.log('Düzenle butonuna tıklandı');
            // window.location.href = 'journal-editor.html';
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
    const name = document.getElementById('userName').value.trim();
    const email = document.getElementById('userEmail').value.trim();
    const role = document.getElementById('userRole').value.trim() || 'user';
    
    if (!name || !email) {
        addToConsoleOutput('✗ Hata: İsim ve e-mail alanları gerekli!', 'error');
        return;
    }
    
    // Firebase bağlantısını kontrol et ve gerekirse başlat
    if (!initializeFirebase() || !window.firestoreDb) {
        addToConsoleOutput('✗ Hata: Firebase bağlantısı kurulamadı!', 'error');
        return;
    }
    
    addToConsoleOutput(`→ Kullanıcı ekleniyor: ${name} (${email})`, 'info');
    
    const { collection, addDoc } = window.firestoreFunctions;
    
    addDoc(collection(window.firestoreDb, "users"), {
        name: name,
        email: email,
        role: role,
        createdAt: new Date(),
        createdBy: 'admin'
    }).then(() => {
        addToConsoleOutput(`✓ Kullanıcı başarıyla eklendi: ${name}`, 'success');
        // Form temizle
        document.getElementById('userName').value = '';
        document.getElementById('userEmail').value = '';
        document.getElementById('userRole').value = '';
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
