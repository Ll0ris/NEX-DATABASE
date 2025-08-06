document.addEventListener('DOMContentLoaded', function() {
    // Element seçicileri
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    const sidePanel = document.getElementById('sidePanel');
    const overlay = document.getElementById('overlay');
    const themeToggle = document.getElementById('themeToggle');
    const themeIcon = themeToggle ? themeToggle.querySelector('.theme-icon') : null;
    const profileSection = document.getElementById('profileSection');
    const profileDropdown = document.getElementById('profileDropdown');

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
            if (themeIcon) themeIcon.textContent = '🌙';
        } else {
            document.documentElement.removeAttribute('data-theme');
            if (themeIcon) themeIcon.textContent = '☀️';
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

    // Side panel navigation aktif durumu
    const currentPage = window.location.pathname.split('/').pop() || 'database.html';
    const navItems = document.querySelectorAll('.nav-item');
    
    navItems.forEach(item => {
        const href = item.getAttribute('href');
        if (href === currentPage || (href === 'database.html' && currentPage === '')) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
});
