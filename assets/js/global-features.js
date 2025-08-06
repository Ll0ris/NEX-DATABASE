// Global Features - Back to Top, Custom Scrollbar, Session Timer
// This file should be included in all pages

document.addEventListener('DOMContentLoaded', function() {
    initGlobalFeatures();
});

function initGlobalFeatures() {
    // Check authentication first on non-login pages
    const currentPage = window.location.pathname;
    const isLoginPage = currentPage.includes('index.html') || currentPage === '/' || currentPage.endsWith('/');
    
    if (!isLoginPage && !checkAuthentication()) {
        return; // Authentication failed, redirect will happen
    }
    
    createBackToTopButton();
    initThemeToggle(); // Tema toggle'ı başlat
    updateUserNameDisplay(); // Kullanıcı adını güncelle
    
    if (!isLoginPage) {
        // Initialize session timer (HTML'de zaten varsa kullan, yoksa oluştur)
        const existingTimer = document.getElementById('sessionTimer');
        if (!existingTimer) {
            createSessionTimer();
        }
        
        initSessionManagement();
    }
    
    initScrollDetection();
}

// Check authentication token
function checkAuthentication() {
    const authToken = localStorage.getItem('authToken');
    const tokenExpiry = localStorage.getItem('tokenExpiry');
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    
    if (!authToken || !tokenExpiry || isAuthenticated !== 'true') {
        console.warn('❌ Token bulunamadı, giriş sayfasına yönlendiriliyor...');
        redirectToLogin();
        return false;
    }
    
    const currentTime = Date.now();
    if (currentTime >= parseInt(tokenExpiry)) {
        console.warn('❌ Token süresi dolmuş, giriş sayfasına yönlendiriliyor...');
        clearAuthData();
        redirectToLogin();
        return false;
    }
    
    console.log('✅ Geçerli token bulundu, sayfa yükleniyor...');
    return true;
}

// Clear authentication data
function clearAuthData() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('tokenExpiry');
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('currentUserId');
    localStorage.removeItem('currentUserEmail');
}

// Redirect to login page
function redirectToLogin() {
    const currentPath = window.location.pathname;
    let loginPath = '';
    
    if (currentPath.includes('/pages/')) {
        loginPath = 'index.html';
    } else {
        loginPath = 'pages/index.html';
    }
    
    setTimeout(() => {
        window.location.href = loginPath;
    }, 100);
}

// Update user name and photo display from localStorage or database
async function updateUserNameDisplay() {
    const currentUserEmail = localStorage.getItem('currentUserEmail');
    if (!currentUserEmail) return;

    // Firebase hazır olana kadar bekle
    let attempts = 0;
    while (!window.firestoreDb && attempts < 50) {
        await new Promise(resolve => setTimeout(resolve, 100));
        attempts++;
    }

    try {
        if (window.firestoreDb && window.firestoreFunctions) {
            const { collection, query, where, getDocs } = window.firestoreFunctions;
            const q = query(collection(window.firestoreDb, "users"), where("email", "==", currentUserEmail));
            const snapshot = await getDocs(q);
            if (!snapshot.empty) {
                const userData = snapshot.docs[0].data();
                const userName = userData.name || '';
                const userPhoto = userData.photoUrl || null;
                
                // Kullanıcı adını güncelle
                const profileNameElements = document.querySelectorAll('.profile-name, .side-profile-name, .welcome-user');
                profileNameElements.forEach(element => {
                    element.textContent = userName;
                });
                
                // Profil fotoğrafını güncelle
                updateProfilePhoto(userPhoto);
                
                console.log('✅ Kullanıcı bilgileri güncellendi:', userName, userPhoto);
            } else {
                // Kullanıcı bulunamazsa alanlar boş kalsın
                const profileNameElements = document.querySelectorAll('.profile-name, .side-profile-name, .welcome-user');
                profileNameElements.forEach(element => {
                    element.textContent = '';
                });
                updateProfilePhoto(null);
            }
        }
    } catch (error) {
        console.log('Kullanıcı bilgileri güncellenirken hata:', error);
        const profileNameElements = document.querySelectorAll('.profile-name, .side-profile-name, .welcome-user');
        profileNameElements.forEach(element => {
            element.textContent = '';
        });
        updateProfilePhoto(null);
    }
}

// Update profile photo in all profile sections
function updateProfilePhoto(photoUrl) {
    // Top panel profile avatar
    const topProfileIcon = document.querySelector('.top-profile-icon');
    const profileAvatar = document.querySelector('.profile-avatar');
    
    if (photoUrl) {
        // Eğer fotoğraf varsa
        if (topProfileIcon) {
            topProfileIcon.outerHTML = `<img src="${photoUrl}" alt="Profile" class="top-profile-photo" style="width: 40px; height: 40px; border-radius: 50%; object-fit: cover;">`;
        }
        if (profileAvatar) {
            profileAvatar.innerHTML = `<img src="${photoUrl}" alt="Profile" style="width: 40px; height: 40px; border-radius: 50%; object-fit: cover;">`;
        }
    } else {
        // Eğer fotoğraf yoksa default icon'u göster
        if (profileAvatar && !profileAvatar.querySelector('.top-profile-icon')) {
            profileAvatar.innerHTML = '<i class="fas fa-user-circle top-profile-icon"></i>';
        }
        // Top panel'daki fotoğraf elementi varsa icon'a çevir
        const topProfilePhoto = document.querySelector('.top-profile-photo');
        if (topProfilePhoto) {
            topProfilePhoto.outerHTML = '<i class="fas fa-user-circle top-profile-icon"></i>';
        }
    }
}

// Back to Top Button
function createBackToTopButton() {
    const backToTopBtn = document.createElement('button');
    backToTopBtn.className = 'back-to-top';
    backToTopBtn.innerHTML = '<i class="fas fa-arrow-up"></i>';
    backToTopBtn.title = 'Sayfa Başına Dön';
    
    // Add click event
    backToTopBtn.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
    
    document.body.appendChild(backToTopBtn);
}

// Session Timer
function createSessionTimer() {
    const sessionTimer = document.createElement('div');
    sessionTimer.className = 'session-timer';
    sessionTimer.id = 'sessionTimer';
    sessionTimer.innerHTML = `
        <div class="timer-content">
            <i class="fas fa-clock"></i>
            <span class="timer-text">40:00</span>
        </div>
    `;
    sessionTimer.title = 'Kalan Oturum Süresi';
    
    document.body.appendChild(sessionTimer);
}

// Scroll Detection for Back to Top Button
function initScrollDetection() {
    const backToTopBtn = document.querySelector('.back-to-top');
    
    window.addEventListener('scroll', function() {
        if (window.pageYOffset > 300) {
            backToTopBtn.classList.add('show');
        } else {
            backToTopBtn.classList.remove('show');
        }
    });
}

// Session Management
function initSessionManagement() {
    // Session duration: 40 minutes (2400 seconds)
    const SESSION_DURATION = 40 * 60; // 40 minutes in seconds
    const WARNING_TIME = 5 * 60; // Last 5 minutes warning
    
    let remainingTime = SESSION_DURATION;
    let lastActivity = Date.now();
    let sessionTimer;
    let warningShown = false;
    
    // Initialize session
    startSessionTimer();
    
    // Track user activity
    const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    activityEvents.forEach(event => {
        document.addEventListener(event, resetActivityTimer, true);
    });
    
    function startSessionTimer() {
        sessionTimer = setInterval(function() {
            // Always decrease remaining time
            remainingTime--;
            
            updateTimerDisplay();
            
            // Show warning for last 5 minutes
            if (remainingTime <= WARNING_TIME && !warningShown) {
                showSessionWarning();
                warningShown = true;
            }
            
            // Session expired - direkt yönlendir
            if (remainingTime <= 0) {
                sessionExpired();
            }
        }, 1000);
    }
    
    function resetActivityTimer() {
        lastActivity = Date.now();
        
        // Reset timer only if user was inactive and timer is running low
        // This prevents abuse while allowing legitimate session extension
        const now = Date.now();
        const timeSinceLastActivity = Math.floor((now - lastActivity) / 1000);
        
        // If user was inactive for more than 1 minute and timer is below 30 minutes, extend slightly
        if (timeSinceLastActivity > 60 && remainingTime < (SESSION_DURATION - 10 * 60)) {
            remainingTime = Math.min(remainingTime + 60, SESSION_DURATION); // Add 1 minute, max 40 min
        }
        
        // Reset warning state if timer goes above warning threshold
        if (warningShown && remainingTime > WARNING_TIME) {
            warningShown = false;
            const sessionTimerEl = document.querySelector('.session-timer');
            if (sessionTimerEl) {
                sessionTimerEl.classList.remove('warning');
            }
        }
    }
    
    function updateTimerDisplay() {
        const minutes = Math.floor(remainingTime / 60);
        const seconds = remainingTime % 60;
        const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        const timeDisplay = document.querySelector('.timer-text');
        if (timeDisplay) {
            timeDisplay.textContent = timeString;
        }
        
        // Update timer color based on remaining time
        const sessionTimerEl = document.querySelector('.session-timer');
        if (sessionTimerEl) {
            if (remainingTime <= WARNING_TIME) {
                sessionTimerEl.classList.add('warning');
            } else {
                sessionTimerEl.classList.remove('warning');
            }
        }
    }
    
    function showSessionWarning() {
        // Show animated warning notification from bottom
        showWarningNotification();
        
        // Request notification permission if supported
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('Oturum Uyarısı', {
                body: 'Oturumunuz 5 dakika içinde sona erecek!',
                icon: '../assets/images/logo.png'
            });
        }
    }
    
    function showWarningNotification() {
        const warningEl = document.getElementById('sessionWarning');
        if (warningEl) {
            warningEl.classList.add('show');
            
            // Hide after 2 seconds
            setTimeout(() => {
                warningEl.classList.remove('show');
            }, 2000);
        }
    }
    
    function sessionExpired() {
        clearInterval(sessionTimer);
        
        // Clear authentication data before redirecting
        clearAuthData();
        
        // Direkt giriş sayfasına yönlendir (uyarı yok)
        window.location.href = 'index.html';
    }
    
    // Request notification permission on page load
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
    }
}

// Extend session function (can be called from anywhere)
window.extendSession = function() {
    const sessionTimerEl = document.querySelector('.session-timer');
    if (sessionTimerEl) {
        sessionTimerEl.classList.remove('warning');
    }
    
    // Reset session time
    if (window.sessionManagement) {
        window.sessionManagement.remainingTime = 10 * 60; // Reset to 10 minutes
        window.sessionManagement.warningShown = false;
    }
    
    console.log('Session extended by user action');
};

// Global utility functions
window.globalFeatures = {
    scrollToTop: function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    },
    
    extendSession: function() {
        window.extendSession();
    }
};

// Top Bar Functions
function initTopBarFeatures() {
    initHamburgerMenu();
    initThemeToggle();
    initProfileSection();
    initAdminDropdown();
}

// Hamburger Menu
function initHamburgerMenu() {
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    const sidePanel = document.getElementById('sidePanel');
    const overlay = document.getElementById('overlay');

    if (hamburgerBtn && sidePanel) {
        hamburgerBtn.addEventListener('click', function() {
            sidePanel.classList.toggle('active');
            hamburgerBtn.classList.toggle('active');
            
            if (overlay) {
                overlay.classList.toggle('active');
            }
            
            if (sidePanel.classList.contains('active')) {
                document.body.style.overflow = 'hidden';
            } else {
                document.body.style.overflow = 'auto';
            }
        });
        
        // Close side panel when clicking overlay
        if (overlay) {
            overlay.addEventListener('click', function() {
                sidePanel.classList.remove('active');
                hamburgerBtn.classList.remove('active');
                overlay.classList.remove('active');
                document.body.style.overflow = 'auto';
            });
        }
    }
}

// Theme Toggle
function initThemeToggle() {
    const themeToggle = document.getElementById('themeToggle');
    const themeIcon = themeToggle?.querySelector('.theme-icon');
    
    if (!themeToggle) return;

    // Load saved theme
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    
    // Update icon based on current theme
    updateThemeIcon(savedTheme, themeIcon);

    themeToggle.addEventListener('click', function() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        
        updateThemeIcon(newTheme, themeIcon);
    });
}

function updateThemeIcon(theme, iconElement) {
    if (!iconElement) return;
    
    if (theme === 'dark') {
        iconElement.className = 'fas fa-moon theme-icon';
    } else {
        iconElement.className = 'fas fa-sun theme-icon';
    }
}

// Profile Section
function initProfileSection() {
    const profileSection = document.getElementById('profileSection');
    const profileDropdown = document.getElementById('profileDropdown');
    
    if (profileSection && profileDropdown) {
        // Profile section click handler
        profileSection.addEventListener('click', function(e) {
            e.stopPropagation();
            toggleProfileDropdown();
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', function(e) {
            if (profileSection && profileDropdown && 
                !profileSection.contains(e.target) && 
                !profileDropdown.contains(e.target)) {
                closeProfileDropdown();
            }
        });
        
        // Close dropdown when clicking inside dropdown links
        if (profileDropdown) {
            profileDropdown.addEventListener('click', function(e) {
                if (e.target.closest('.dropdown-item')) {
                    closeProfileDropdown();
                }
            });
        }
    }
}

// Profile Dropdown Functions
function toggleProfileDropdown() {
    const profileDropdown = document.getElementById('profileDropdown');
    if (profileDropdown) {
        profileDropdown.classList.toggle('active');
    }
}

function closeProfileDropdown() {
    const profileDropdown = document.getElementById('profileDropdown');
    if (profileDropdown) {
        profileDropdown.classList.remove('active');
    }
}

// Initialize top bar features when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Check if this is database.html - if so, don't initialize hamburger here
    // because database-script.js handles it
    const isDatabase = window.location.pathname.includes('database.html') || 
                       window.location.pathname === '/' || 
                       window.location.pathname === '';
    
    // Check if this is profile.html - profile-script.js handles theme toggle
    const isProfile = window.location.pathname.includes('profile.html');
    
    if (isDatabase) {
        // Only initialize theme and navigation for database page
        // Profile and hamburger are handled by database-script.js
        initThemeToggle();
        initNavigationActive();
    } else if (isProfile) {
        // Profile page - only initialize admin dropdown
        // Theme toggle is handled by profile-script.js
        // Navigation is handled by profile-script.js
        // Hamburger menu not needed as sidebar is always visible
        initAdminDropdown();
    } else {
        // Initialize all features for other pages including admin dropdown
        initTopBarFeatures();
        initNavigationActive();
        
        // Add admin-user class only if adminMode is set in localStorage
        const adminMode = localStorage.getItem('adminMode');
        if (adminMode === 'admin') {
            document.body.classList.add('admin-user');
        } else {
            document.body.classList.remove('admin-user');
        }
    }
});

// Navigation Active State
function initNavigationActive() {
    const currentPage = window.location.pathname.split('/').pop() || 'database.html';
    const navItems = document.querySelectorAll('.nav-item');
    
    navItems.forEach(item => {
        const href = item.getAttribute('href');
        
        // Handle different URL patterns
        if (href === currentPage || 
            (href === 'database.html' && (currentPage === '' || currentPage === 'index.html')) ||
            (href && href.includes(currentPage))) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
}

// Admin Dropdown Functions
function initAdminDropdown() {
    const dropdownTrigger = document.getElementById('dropdownTrigger');
    const dropdownMenu = document.getElementById('dropdownMenu');
    const dropdownOptions = document.querySelectorAll('.dropdown-option');
    const modeText = document.querySelector('.mode-text');

    if (!dropdownTrigger || !dropdownMenu) return;

    // Load saved admin state
    loadAdminState();

    // Dropdown toggle
    dropdownTrigger.addEventListener('click', function(e) {
        e.stopPropagation();
        toggleAdminDropdown();
    });

    // Option selection - handle both safe and admin modes
    dropdownOptions.forEach(option => {
        option.addEventListener('click', function() {
            const mode = this.getAttribute('data-mode');
            const text = this.querySelector('span').textContent;
            
            if (mode === 'safe') {
                selectAdminMode(mode, text);
                closeAdminDropdown();
            } else if (mode === 'admin') {
                // Show protocol modal for admin access
                showGlobalProtocolModal(mode, text);
            }
        });
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', function(e) {
        if (!dropdownTrigger.contains(e.target) && !dropdownMenu.contains(e.target)) {
            closeAdminDropdown();
        }
    });
}

function toggleAdminDropdown() {
    const dropdownMenu = document.getElementById('dropdownMenu');
    const dropdownTrigger = document.getElementById('dropdownTrigger');
    
    if (dropdownMenu) {
        dropdownMenu.classList.toggle('show');
        dropdownTrigger.classList.toggle('active');
    }
}

function closeAdminDropdown() {
    const dropdownMenu = document.getElementById('dropdownMenu');
    const dropdownTrigger = document.getElementById('dropdownTrigger');
    
    if (dropdownMenu) {
        dropdownMenu.classList.remove('show');
        dropdownTrigger.classList.remove('active');
    }
}

function selectAdminMode(mode, text) {
    const dropdownOptions = document.querySelectorAll('.dropdown-option');
    const modeText = document.querySelector('.mode-text');
    
    // Remove active class from all options
    dropdownOptions.forEach(opt => opt.classList.remove('active'));
    
    // Add active class to selected option
    const selectedOption = document.querySelector(`[data-mode="${mode}"]`);
    if (selectedOption) {
        selectedOption.classList.add('active');
    }
    
    // Update trigger text and icon
    if (modeText) {
        modeText.textContent = text;
    }
    updateAdminModeIcon(mode);
    
    // Save admin state
    saveAdminState(mode, text);
}

function updateAdminModeIcon(mode) {
    const modeIcon = document.getElementById('modeIcon');
    if (!modeIcon) return;
    
    if (mode === 'admin') {
        modeIcon.className = 'fas fa-cog mode-icon';
    } else {
        modeIcon.className = 'fas fa-shield-alt mode-icon';
    }
}

function saveAdminState(mode, text) {
    localStorage.setItem('adminMode', mode);
    localStorage.setItem('adminModeText', text);
}

function loadAdminState() {
    // GitHub domain kontrolü - eğer GitHub Pages'te ise güvenli moda zorla
    const isGitHubPages = window.location.hostname.includes('github.io');
    
    let savedMode, savedText;
    
    if (isGitHubPages) {
        // GitHub Pages'te ise her zaman güvenli mod
        savedMode = 'safe';
        savedText = 'Güvenli Mod';
        localStorage.setItem('adminMode', 'safe');
        localStorage.setItem('adminModeText', 'Güvenli Mod');
    } else {
        // Localhost'ta ise kayıtlı durumu kullan
        savedMode = localStorage.getItem('adminMode') || 'safe';
        savedText = localStorage.getItem('adminModeText') || 'Güvenli Mod';
    }
    
    selectAdminMode(savedMode, savedText);
}

// Global Protocol Modal for Admin Access
function showGlobalProtocolModal(mode, text) {
    // GitHub Pages'te admin erişimini engelle
    const isGitHubPages = window.location.hostname.includes('github.io');
    if (isGitHubPages) {
        alert('Admin modu GitHub Pages\'te kullanılamaz. Sadece güvenli mod aktiftir.');
        return;
    }
    
    // Create modal if it doesn't exist
    let modal = document.getElementById('globalProtocolModal');
    if (!modal) {
        createGlobalProtocolModal();
        modal = document.getElementById('globalProtocolModal');
    }
    
    const passwordInput = modal.querySelector('#globalProtocolPassword');
    const errorMessage = modal.querySelector('#globalErrorMessage');
    
    // Reset modal state
    passwordInput.value = '';
    errorMessage.style.display = 'none';
    
    // Store pending mode change
    modal.setAttribute('data-pending-mode', mode);
    modal.setAttribute('data-pending-text', text);
    
    // Show modal
    modal.style.display = 'flex';
    setTimeout(() => {
        modal.classList.add('show');
        passwordInput.focus();
    }, 10);
}

function createGlobalProtocolModal() {
    const modal = document.createElement('div');
    modal.id = 'globalProtocolModal';
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content protocol-modal">
            <div class="modal-header">
                <h3>
                    <i class="fas fa-lock"></i>
                    Protokol Şifresi Gerekli
                </h3>
                <button class="modal-close" onclick="closeGlobalProtocolModal()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <p class="protocol-description">
                    Admin paneline erişim için protokol şifresini girin:
                </p>
                <div class="password-field">
                    <input type="password" id="globalProtocolPassword" placeholder="Protokol şifresi..." maxlength="20">
                    <i class="fas fa-eye password-toggle" id="globalPasswordToggle"></i>
                </div>
                <div class="error-message" id="globalErrorMessage" style="display: none;">
                    <i class="fas fa-exclamation-triangle"></i>
                    Yanlış şifre! Tekrar deneyin.
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn-cancel" onclick="closeGlobalProtocolModal()">İptal</button>
                <button class="btn-confirm" onclick="verifyGlobalProtocol()">Onayla</button>
            </div>
        </div>
    `;
    
    // Add modal styles
    const style = document.createElement('style');
    style.textContent = `
        /* Protocol Modal Styles - Same as main page */
        .modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.7);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 2000;
            opacity: 0;
            visibility: hidden;
            transition: all 0.3s ease;
        }

        .modal-overlay.show {
            opacity: 1;
            visibility: visible;
        }

        .modal-content {
            background: var(--panel-bg, #ffffff);
            border-radius: 15px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            overflow: hidden;
            transform: translateY(-20px);
            transition: all 0.3s ease;
            border: 1px solid var(--border-color, #e0e0e0);
        }

        .modal-overlay.show .modal-content {
            transform: translateY(0);
        }

        .protocol-modal {
            width: 90%;
            max-width: 450px;
        }

        .modal-header {
            background: var(--primary-color, #5d0d0e);
            color: white;
            padding: 20px 25px;
            display: flex;
            align-items: center;
            justify-content: space-between;
        }

        .modal-header h3 {
            margin: 0;
            font-size: 1.2rem;
            font-weight: 600;
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .modal-close {
            background: none;
            border: none;
            color: white;
            font-size: 20px;
            cursor: pointer;
            padding: 5px;
            border-radius: 50%;
            transition: all 0.3s ease;
            width: 35px;
            height: 35px;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .modal-close:hover {
            background: rgba(255, 255, 255, 0.2);
            transform: scale(1.1);
        }

        .modal-body {
            padding: 25px;
        }

        .protocol-description {
            margin: 0 0 20px 0;
            color: var(--text-color, #333);
            font-size: 1rem;
            line-height: 1.5;
        }

        .password-field {
            position: relative;
            margin-bottom: 15px;
        }

        .password-field input {
            width: 100%;
            padding: 12px 50px 12px 15px;
            border: 2px solid var(--border-color, #e0e0e0);
            border-radius: 8px;
            background: var(--bg-color, #f8f9fa);
            color: var(--text-color, #333);
            font-size: 1rem;
            transition: all 0.3s ease;
            outline: none;
        }

        .password-field input:focus {
            border-color: var(--primary-color, #5d0d0e);
            box-shadow: 0 0 0 3px rgba(93, 13, 14, 0.1);
        }

        .password-toggle {
            position: absolute;
            right: 15px;
            top: 50%;
            transform: translateY(-50%);
            color: var(--text-color, #333);
            cursor: pointer;
            transition: color 0.3s ease;
            opacity: 0.6;
        }

        .password-toggle:hover {
            opacity: 1;
            color: var(--primary-color, #5d0d0e);
        }

        .error-message {
            background: rgba(220, 53, 69, 0.1);
            border: 1px solid #dc3545;
            border-radius: 6px;
            padding: 10px 15px;
            color: #dc3545;
            font-size: 0.9rem;
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 15px;
        }

        .modal-footer {
            padding: 20px 25px;
            background: var(--bg-color, #f8f9fa);
            display: flex;
            gap: 10px;
            justify-content: flex-end;
            border-top: 1px solid var(--border-color, #e0e0e0);
        }

        .btn-cancel, .btn-confirm {
            padding: 10px 20px;
            border: none;
            border-radius: 6px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            font-size: 0.9rem;
        }

        .btn-cancel {
            background: #6c757d;
            color: white;
        }

        .btn-cancel:hover {
            background: #5a6268;
            transform: translateY(-1px);
        }

        .btn-confirm {
            background: var(--primary-color, #5d0d0e);
            color: white;
        }

        .btn-confirm:hover {
            background: #7a1315;
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(93, 13, 14, 0.3);
        }

        /* Dark theme modal styles */
        [data-theme="dark"] .modal-content {
            background: #2d2d2d;
            border-color: #404040;
        }

        [data-theme="dark"] .password-field input {
            background: #141516;
            border-color: #404040;
            color: #f09192;
        }

        [data-theme="dark"] .password-field input:focus {
            border-color: #f09192;
            box-shadow: 0 0 0 3px rgba(240, 145, 146, 0.1);
        }

        [data-theme="dark"] .protocol-description {
            color: #f09192;
        }

        [data-theme="dark"] .password-toggle {
            color: #f09192;
        }
    `;
    
    document.head.appendChild(style);
    document.body.appendChild(modal);
    
    // Add enter key support
    modal.querySelector('#globalProtocolPassword').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            verifyGlobalProtocol();
        }
    });

    // Add password toggle functionality
    const passwordToggle = modal.querySelector('#globalPasswordToggle');
    const passwordInput = modal.querySelector('#globalProtocolPassword');
    
    passwordToggle.addEventListener('click', function() {
        const type = passwordInput.type === 'password' ? 'text' : 'password';
        passwordInput.type = type;
        
        // Toggle icon
        if (type === 'password') {
            passwordToggle.className = 'fas fa-eye password-toggle';
        } else {
            passwordToggle.className = 'fas fa-eye-slash password-toggle';
        }
    });
}

function closeGlobalProtocolModal() {
    const modal = document.getElementById('globalProtocolModal');
    if (!modal) return;
    
    modal.classList.remove('show');
    setTimeout(() => {
        modal.style.display = 'none';
    }, 300);
}

function verifyGlobalProtocol() {
    const modal = document.getElementById('globalProtocolModal');
    const passwordInput = modal.querySelector('#globalProtocolPassword');
    const errorMessage = modal.querySelector('#globalErrorMessage');
    const pendingMode = modal.getAttribute('data-pending-mode');
    const pendingText = modal.getAttribute('data-pending-text');
    
    const password = passwordInput.value.trim();
    const correctPassword = 'admin';
    
    // Check password (changed to 'admin')
    if (password === correctPassword) {
        // Success - activate admin mode
        selectAdminMode(pendingMode, pendingText);
        closeGlobalProtocolModal();
        closeAdminDropdown();
        
        // Show purple success notification (same as main page)
        showAdminSuccessNotification();
    } else {
        // Error
        errorMessage.style.display = 'flex';
        passwordInput.value = '';
        passwordInput.focus();
    }
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

// Add admin success notification styles
function addAdminSuccessStyles() {
    if (document.getElementById('admin-success-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'admin-success-styles';
    style.textContent = `
        .admin-success-notification {
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border-radius: 12px;
            padding: 0;
            min-width: 320px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
            z-index: 10001;
            animation: slideInRight 0.5s ease-out;
            border: 1px solid rgba(255, 255, 255, 0.2);
            overflow: hidden;
        }

        .admin-notification-header {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 15px 20px 10px 20px;
            font-weight: 600;
            font-size: 1rem;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .admin-notification-header i {
            font-size: 1.2rem;
            color: #ffd700;
        }

        .admin-notification-body {
            padding: 12px 20px;
            font-size: 0.9rem;
            line-height: 1.4;
            opacity: 0.9;
        }

        .admin-notification-footer {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 10px 20px 15px 20px;
            font-size: 0.8rem;
            opacity: 0.8;
            border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .admin-notification-footer i {
            font-size: 0.9rem;
        }

        @keyframes slideInRight {
            from {
                transform: translateX(400px);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }

        /* Dark theme support */
        [data-theme="dark"] .admin-success-notification {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-color: rgba(255, 255, 255, 0.3);
        }
    `;
    
    document.head.appendChild(style);
}

// Add admin dropdown styles dynamically if not already present
function addAdminDropdownStyles() {
    // Check if styles are already added
    if (document.getElementById('admin-dropdown-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'admin-dropdown-styles';
    style.textContent = `
        /* Admin Dropdown Styles for Global Features */
        .admin-dropdown {
            position: relative;
            display: flex;
            align-items: center;
        }

        .admin-dropdown-trigger {
            display: flex;
            align-items: center;
            gap: 8px;
            background: transparent;
            border: 1px solid rgba(255, 255, 255, 0.2);
            color: white;
            padding: 8px 12px;
            border-radius: 25px;
            cursor: pointer;
            transition: all 0.3s ease;
            font-size: 14px;
        }

        .admin-dropdown-trigger:hover {
            background: rgba(255, 255, 255, 0.1);
            border-color: rgba(255, 255, 255, 0.4);
        }

        .admin-dropdown-trigger.active {
            background: rgba(240, 145, 146, 0.2);
            border-color: #f09192;
        }

        .mode-icon {
            font-size: 16px;
            color: #f09192;
        }

        .dropdown-arrow {
            transition: transform 0.3s ease;
            color: rgba(255, 255, 255, 0.7);
        }

        .admin-dropdown-trigger.active .dropdown-arrow {
            transform: rotate(180deg);
        }

        .dropdown-menu {
            position: absolute;
            top: 100%;
            left: 50%;
            transform: translateX(-50%);
            background: #1a1a1a;
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 15px;
            min-width: 150px;
            opacity: 0;
            visibility: hidden;
            transform: translateX(-50%) translateY(-10px);
            transition: all 0.3s ease;
            z-index: 1000;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
        }

        .dropdown-menu.show {
            opacity: 1;
            visibility: visible;
            transform: translateX(-50%) translateY(0);
        }

        .dropdown-option {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 12px 15px;
            color: white;
            cursor: pointer;
            transition: background 0.3s ease;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .dropdown-option:last-child {
            border-bottom: none;
        }

        .dropdown-option:hover {
            background: rgba(255, 255, 255, 0.1);
        }

        .dropdown-option.active {
            background: rgba(240, 145, 146, 0.2);
            color: #f09192;
        }

        .dropdown-option i {
            width: 16px;
            text-align: center;
        }

        /* Dark theme support */
        [data-theme="dark"] .admin-dropdown-trigger {
            border-color: rgba(255, 255, 255, 0.3);
        }

        [data-theme="dark"] .dropdown-menu {
            background: #2a2a2a;
            border-color: rgba(255, 255, 255, 0.3);
        }

        [data-theme="dark"] .dropdown-option {
            border-color: rgba(255, 255, 255, 0.2);
        }
    `;
    
    document.head.appendChild(style);
}

// Initialize admin dropdown styles when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    addAdminDropdownStyles();
    addAdminSuccessStyles();
});

// Global Admin State Management
function loadAdminState() {
    const savedMode = localStorage.getItem('adminMode') || 'safe';
    const savedText = localStorage.getItem('adminModeText') || 'Güvenli Mod';
    
    const dropdownOptions = document.querySelectorAll('.dropdown-option');
    const modeText = document.querySelector('.mode-text');
    const modeIcon = document.getElementById('modeIcon');
    
    // Update UI
    dropdownOptions.forEach(opt => opt.classList.remove('active'));
    const selectedOption = document.querySelector(`[data-mode="${savedMode}"]`);
    if (selectedOption) {
        selectedOption.classList.add('active');
    }
    
    if (modeText) {
        modeText.textContent = savedText;
    }
    
    if (modeIcon) {
        modeIcon.className = savedMode === 'admin' ? 'fas fa-cog mode-icon' : 'fas fa-shield-alt mode-icon';
    }
    
    // Apply admin mode
    if (savedMode === 'admin') {
        document.body.classList.add('admin-mode');
    } else {
        document.body.classList.remove('admin-mode');
    }
}

function saveAdminState(mode, text) {
    localStorage.setItem('adminMode', mode);
    localStorage.setItem('adminModeText', text);
}
