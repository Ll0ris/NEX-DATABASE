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
    // Element seçicileri
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    const sidePanel = document.getElementById('sidePanel');
    const overlay = document.getElementById('overlay');
    const themeToggle = document.getElementById('themeToggle');
    const themeIcon = themeToggle.querySelector('.theme-icon');
    const profileSection = document.getElementById('profileSection');
    const profileDropdown = document.getElementById('profileDropdown');
    const profileSidePanel = document.getElementById('profileSidePanel');
    const closeProfilePanel = document.getElementById('closeProfilePanel');
    const saveProfileBtn = document.querySelector('.save-profile-btn');

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
    hamburgerBtn.addEventListener('click', toggleSidePanel);
    
    // Overlay tıklaması - side panel'i kapat
    if (overlay) {
        overlay.addEventListener('click', function() {
            closeSidePanelFunc();
        });
    }

    // Side panel dışına tıklandığında kapat
    document.addEventListener('click', function(e) {
        if (!sidePanel.contains(e.target) && 
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
            themeIcon.textContent = '🌙';
        } else {
            document.documentElement.removeAttribute('data-theme');
            themeIcon.textContent = '☀️';
        }
        localStorage.setItem('theme', isDarkTheme ? 'dark' : 'light');
    }

    // Sayfa yüklendiğinde tema uygula
    updateTheme();

    themeToggle.addEventListener('click', function() {
        isDarkTheme = !isDarkTheme;
        updateTheme();
    });

    // Profile Dropdown kontrolü
    function toggleProfileDropdown() {
        profileDropdown.classList.toggle('active');
    }

    function closeProfileDropdown() {
        profileDropdown.classList.remove('active');
    }

    profileSection.addEventListener('click', function(e) {
        e.stopPropagation();
        toggleProfileDropdown();
    });

    // Profil dropdown dışına tıklandığında kapat
    document.addEventListener('click', function(e) {
        if (!profileSection.contains(e.target) && !profileDropdown.contains(e.target)) {
            closeProfileDropdown();
        }
    });

    // Profil dropdown içindeki linklere tıklandığında
    profileDropdown.addEventListener('click', function(e) {
        if (e.target.closest('.dropdown-item') && !e.target.closest('#openProfilePanel')) {
            closeProfileDropdown();
        }
    });

    // Profil kaydetme
    saveProfileBtn.addEventListener('click', function() {
        // Profil bilgilerini topla
        const profileData = {
            title: document.querySelector('.profile-input[value="Prof. Dr."]').value,
            fullName: document.querySelector('.profile-input[value="Admin Kullanıcı"]').value,
            institution: document.querySelector('.profile-input[value="Yıldız Teknik Üniversitesi"]').value,
            department: document.querySelector('.profile-input[value="Bilgisayar Mühendisliği"]').value,
            email: document.querySelector('.profile-input[value="admin@yildiz.edu.tr"]').value,
            socialLinks: {
                linkedin: document.querySelector('.social-input[placeholder*="LinkedIn"]').value,
                wos: document.querySelector('.social-input[placeholder*="Web of Science"]').value,
                scopus: document.querySelector('.social-input[placeholder*="Scopus"]').value,
                orcid: document.querySelector('.social-input[placeholder*="ORCID"]').value
            }
        };

        // LocalStorage'a kaydet
        localStorage.setItem('nexProfileData', JSON.stringify(profileData));
        
        // Başarı mesajı
        const originalText = saveProfileBtn.textContent;
        saveProfileBtn.textContent = '✅ Kaydedildi!';
        saveProfileBtn.style.background = '#28a745';
        
        setTimeout(() => {
            saveProfileBtn.textContent = originalText;
            saveProfileBtn.style.background = '';
        }, 2000);
        
        console.log('Profil bilgileri kaydedildi:', profileData);
    });

    // Sayfa yüklendiğinde profil bilgilerini yükle
    function loadProfileData() {
        const savedData = localStorage.getItem('nexProfileData');
        if (savedData) {
            const profileData = JSON.parse(savedData);
            
            // Input alanlarını doldur
            if (profileData.title) document.querySelector('.profile-input[value="Prof. Dr."]').value = profileData.title;
            if (profileData.fullName) document.querySelector('.profile-input[value="Admin Kullanıcı"]').value = profileData.fullName;
            if (profileData.institution) document.querySelector('.profile-input[value="Yıldız Teknik Üniversitesi"]').value = profileData.institution;
            if (profileData.department) document.querySelector('.profile-input[value="Bilgisayar Mühendisliği"]').value = profileData.department;
            if (profileData.email) document.querySelector('.profile-input[value="admin@yildiz.edu.tr"]').value = profileData.email;
            
            // Sosyal bağlantıları doldur
            if (profileData.socialLinks) {
                if (profileData.socialLinks.linkedin) document.querySelector('.social-input[placeholder*="LinkedIn"]').value = profileData.socialLinks.linkedin;
                if (profileData.socialLinks.wos) document.querySelector('.social-input[placeholder*="Web of Science"]').value = profileData.socialLinks.wos;
                if (profileData.socialLinks.scopus) document.querySelector('.social-input[placeholder*="Scopus"]').value = profileData.socialLinks.scopus;
                if (profileData.socialLinks.orcid) document.querySelector('.social-input[placeholder*="ORCID"]').value = profileData.socialLinks.orcid;
            }
        }
    }

    // Profil bilgilerini yükle
    loadProfileData();

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

    // Responsive hamburger animasyonu
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768 && sidePanel.classList.contains('active')) {
            // Büyük ekranlarda side panel otomatik kapanmasın
        }
    });

    // Smooth scroll ve sayfa geçişleri için
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Console log tema ve panel durumu (debug için)
    console.log('NEX Database UI initialized');
    console.log('Current theme:', isDarkTheme ? 'dark' : 'light');
});
