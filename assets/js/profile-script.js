// Profile Page Script

// Global variables - declare at top to prevent hoisting issues
let originalFormData = {}; // Store original data for cancel functionality

// Helper utilities for compact, safe DOM updates
const PROFILE_ALLOWED_KEYS = ['name', 'fullName', 'institution', 'faculty', 'department', 'status', 'title_prefix', 'phone', 'photo_url'];

function setText(element, text = '') {
    if (element) {
        element.textContent = text ?? '';
    }
}

function setTextOrHide(element, text = '') {
    if (!element) return;
    const value = (text ?? '').toString().trim();
    element.textContent = value;
    element.style.display = value ? 'inline-block' : 'none';
}

function updateOrInsertImage(container, url) {
    if (!container || !url) return;
    const controls = container.querySelector('.photo-controls');
    let img = container.querySelector('img');
    if (!img) {
        img = document.createElement('img');
        img.style.width = '150px';
        img.style.height = '150px';
        img.style.borderRadius = '50%';
        img.style.objectFit = 'cover';
        if (controls) {
            container.insertBefore(img, controls);
        } else {
            container.appendChild(img);
        }
    }
    img.src = url;
    img.alt = 'Profile Photo';
    const defaultIcon = container.querySelector('.default-photo-icon');
    if (defaultIcon) defaultIcon.remove();
}

document.addEventListener('DOMContentLoaded', function() {
    // Hide profile content initially to prevent placeholder flash
    const profileContent = document.getElementById('profileContent');
    if (profileContent) {
        profileContent.style.visibility = 'hidden';
    }
    
    // Backend tabanlı profil yükleme
    setTimeout(() => {
        loadProfileFromDatabase();
    }, 100);
    
    // Elements
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    const sidePanel = document.getElementById('profileSidePanel');
    const mainContent = document.getElementById('mainContent');
    const overlay = document.getElementById('overlay');
    const profileSection = document.getElementById('profileSection');
    const profileDropdown = document.getElementById('profileDropdown');
    const profileEditingPanel = document.getElementById('profileEditingPanel');
    const saveProfileBtn = document.getElementById('saveProfileBtn');
    const photoUpload = document.getElementById('photoUpload');
    const profilePhoto = document.getElementById('profilePhoto');

    // Hamburger Menu Control
    if (hamburgerBtn && sidePanel && mainContent) {
        // Side panel ve hamburger başta açık/aktif olsun
        sidePanel.classList.add('active');
        hamburgerBtn.classList.add('active');
        console.log('Initial setup complete');
        
        // Basit test: Hamburger butona direkt onclick ekle
        hamburgerBtn.onclick = function(event) {
            event.preventDefault();
            event.stopPropagation();
            console.log('Hamburger button clicked!');
            
            const isActive = sidePanel.classList.contains('active');
            console.log('Current panel state:', isActive);
            
            if (isActive) {
                // Panel'i kapat
                console.log('Closing panel...');
                sidePanel.classList.remove('active');
                mainContent.classList.add('sidebar-closed');
                hamburgerBtn.classList.remove('active');
                if (overlay) overlay.classList.remove('active');
            } else {
                // Panel'i aç
                console.log('Opening panel...');
                sidePanel.classList.add('active');
                mainContent.classList.remove('sidebar-closed');
                hamburgerBtn.classList.add('active');
                // Mobile'da overlay göster
                if (window.innerWidth <= 768 && overlay) {
                    overlay.classList.add('active');
                }
            }
            
            console.log('New state - Panel active:', sidePanel.classList.contains('active'));
        };
        
    // Not: Duplicate listeners elsewhere can cause double toggles; keep only this handler
        
        // Overlay'e tıklandığında panel'i kapat (mobile)
        if (overlay) {
            overlay.addEventListener('click', function() {
                sidePanel.classList.remove('active');
                mainContent.classList.add('sidebar-closed');
                hamburgerBtn.classList.remove('active');
                overlay.classList.remove('active');
            });
        }
        
        // Window resize kontrolü
        window.addEventListener('resize', function() {
            if (window.innerWidth > 768) {
                // Desktop'ta overlay'i kaldır
                if (overlay) overlay.classList.remove('active');
            }
        });
    }

    // Section Navigation
    function switchSection(sectionName) {
        // Hide all sections
        const allSections = document.querySelectorAll('.content-section');
        allSections.forEach(section => {
            section.classList.remove('active');
            section.style.display = 'none';
        });

        // Show target section
        const targetSection = document.getElementById(sectionName + 'Content');
        if (targetSection) {
            targetSection.style.display = 'block';
            targetSection.classList.add('active');
            
            // Read-only mod kontrolü ve admin kontrolü
            const urlParams = new URLSearchParams(window.location.search);
            const isReadOnly = urlParams.get('readOnly') === 'true';
            const adminMode = localStorage.getItem('adminMode');
            const hasRealAdminAccess = localStorage.getItem('realAdminAccess') === 'true';
            const isAdminMode = adminMode === 'admin' && hasRealAdminAccess;
            
            // Initialize profile editing if switching to profile section (read-only değilse veya admin modundaysa)
            if (sectionName === 'profile' && (!isReadOnly || isAdminMode)) {
                // Use longer timeout to ensure DOM is ready
                setTimeout(() => {
                    initProfileEditing();
                }, 200);
            }
            
            // Initialize education system if switching to education section (read-only değilse veya admin modundaysa)
            if (sectionName === 'education' && (!isReadOnly || isAdminMode)) {
                setTimeout(initEducationEditing, 100);
                // Initialize education data rendering
                setTimeout(() => {
                    renderEducationItems();
                    renderThesisItems();
                    renderLanguageItems();
                }, 150);
            }
            
            // Initialize research system if switching to research section (read-only değilse veya admin modundaysa)
            if (sectionName === 'research' && (!isReadOnly || isAdminMode)) {
                setTimeout(initResearchSystem, 100);
            }
            
            // Initialize contact system if switching to contact section (read-only değilse veya admin modundaysa)
            if (sectionName === 'contact' && (!isReadOnly || isAdminMode)) {
                setTimeout(initContactSystem, 100);
                setTimeout(initContactEditing, 100);
            }
        }

        // Update navigation active state
        const allNavItems = document.querySelectorAll('.nav-item');
        allNavItems.forEach(item => {
            item.classList.remove('active');
        });

        const activeNavItem = document.querySelector(`[data-section="${sectionName}"]`);
        if (activeNavItem) {
            activeNavItem.classList.add('active');
        }
    }

    // Navigation Click Events
    const navItems = document.querySelectorAll('.nav-item[data-section]');
    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const sectionName = this.getAttribute('data-section');
            switchSection(sectionName);
        });
    });

    // Initialize with profile section active
    switchSection('profile');

    // Database initialization and profile loading handled in checkDatabase function above
    
    // Global toggle function for purple edit button
    window.toggleBlueEditButton = function() {
        // Read-only mod kontrolü ve admin kontrolü
        const urlParams = new URLSearchParams(window.location.search);
        const isReadOnly = urlParams.get('readOnly') === 'true';
        const adminMode = localStorage.getItem('adminMode');
        const hasRealAdminAccess = localStorage.getItem('realAdminAccess') === 'true';
        const isAdminMode = adminMode === 'admin' && hasRealAdminAccess;
        
        if (isReadOnly && !isAdminMode) { return; }
        
        const editButton = document.getElementById('editBasicInfoBtn');
        const editMode = document.getElementById('infoEditMode');
        
        if (editButton) {
            const isVisible = editButton.style.display === 'flex';
            editButton.style.display = isVisible ? 'none' : 'flex';
            
            if (!isVisible) {
                editButton.style.animation = 'pulse 1s ease-in-out 3';
                editButton.scrollIntoView({ behavior: 'smooth', block: 'center' });
            } else {
                // If hiding the blue edit button, also close edit mode if open
                if (editMode && editMode.style.display === 'block') {
                    cancelEdit();
                }
            }
        }
    };

    // Global function to hide photo controls and overlays
    window.hidePhotoControls = function() {
        const photoControls = document.getElementById('photoControls');
        const photoOverlay = document.getElementById('photoUploadOverlay');
        
        if (photoControls) {
            photoControls.style.display = 'none';
            photoControls.classList.remove('show-controls');
        }
        
        if (photoOverlay) {
            photoOverlay.style.display = 'none';
        }
    };

    // Global function to hide blue edit button
    window.hideBlueEditButton = function() {
        const editButton = document.getElementById('editBasicInfoBtn');
        if (editButton) {
            editButton.style.display = 'none';
        }
        // Also hide photo controls when hiding edit button
        window.hidePhotoControls();
    };

    // Database functions for profile data
    function saveProfileToDatabase(profileData, targetUserIdentifier = null) {
        try {
        // URL parametrelerini kontrol et - hangi kullanıcının profilini düzenlediğimizi belirle
        const urlParams = new URLSearchParams(window.location.search);
        const viewUserParam = urlParams.get('viewUser');
            const targetUser = targetUserIdentifier || viewUserParam || localStorage.getItem('currentUserEmail');
        
        if (!targetUser) {
            console.warn('Hedef kullanıcı belirlenemedi, profil kaydedilemiyor');
            return;
        }

            // Sadece veritabanında mevcut olduğu bilinen alanları gönder
            const filteredProfile = {};
            PROFILE_ALLOWED_KEYS.forEach(k => {
                if (Object.hasOwn(profileData, k)) filteredProfile[k] = profileData[k];
            });

            const payload = {
                action: 'update',
                targetUser,
                profile: filteredProfile
            };

            console.log('🛰️ Profil update payload:', payload);

            window.backendAPI.post('profile.php?action=update', payload)
                .then((res) => {
                    console.log('🛰️ Profil update response:', res);
                    if (!res || res.success !== true) {
                        console.error('Profil güncelleme hatası:', res?.error);
                    } else {
                        console.log('✅ Profil backend\'e kaydedildi! Hedef:', targetUser);
                    }
                })
                .catch((err) => {
                    console.error('🔥 Profil güncelleme backend hatası:', err);
                });
                } catch (error) {
            console.error('🔥 Profil kaydetme hatası:', error);
        }
    }

    function loadProfileFromDatabase() {
        // URL parametrelerini kontrol et
        const urlParams = new URLSearchParams(window.location.search);
        const viewUserParam = urlParams.get('viewUser');
        const isReadOnly = urlParams.get('readOnly') === 'true';
        
        // Admin kontrolü
        const adminMode = localStorage.getItem('adminMode');
        const hasRealAdminAccess = localStorage.getItem('realAdminAccess') === 'true';
        const isAdminMode = adminMode === 'admin' && hasRealAdminAccess;
        const isAdminUser = ((localStorage.getItem('userRole') || '').toLowerCase() === 'admin');
        const currentUserEmail = (localStorage.getItem('currentUserEmail') || '').toLowerCase();
        const isSelfProfile = !viewUserParam || (viewUserParam || '').toLowerCase() === currentUserEmail;
        
        // Hangi kullanıcının profilini göstereceğimizi belirle
        let targetUserIdentifier = viewUserParam || localStorage.getItem('currentUserEmail');
        
        if (!targetUserIdentifier) {
            console.warn('Profil yükleme: targetUserIdentifier bulunamadı (viewUser veya currentUserEmail yok).');
            const pc = document.getElementById('profileContent');
            if (pc) pc.style.visibility = 'visible';
            return;
        }
        
        // Read-only ve admin kontrolü
        if (viewUserParam && !isReadOnly && !isAdminMode) {
            // URL'i temizle ve kendi profiline yönlendir
            window.location.href = 'profile.html';
            return;
        }

        console.log('🔎 Profil isteniyor:', { targetUserIdentifier });
        window.backendAPI.get('profile.php', { action: 'get', viewUser: targetUserIdentifier })
            .then((res) => {
                console.log('📦 Profil yanıtı:', res);
                if (!res || res.success !== true || !res.user) {
                    console.error('❌ Profil verisi alınamadı:', res?.error);
                        return;
                }
                
                const data = res.user;
                const fullNameValue = data.full_name || data.fullName || data.name || '';

                // Sadece backend'den gelen verileri DOM'a yaz
                setText(document.querySelector('.title-prefix'), (typeof data.title_prefix !== 'undefined') ? data.title_prefix : '');
                setText(document.querySelector('.full-name'), fullNameValue);
                setText(document.querySelector('.institution'), (typeof data.institution !== 'undefined') ? data.institution : '');
                setText(document.querySelector('.faculty'), (typeof data.faculty !== 'undefined') ? data.faculty : '');
                setText(document.querySelector('.department'), (typeof data.department !== 'undefined') ? data.department : '');
                setTextOrHide(document.querySelector('.status'), (typeof data.status !== 'undefined') ? String(data.status) : '');

                // About section
                const aboutSectionEl = document.getElementById('profileAboutSection');
                const aboutEl = document.getElementById('aboutText');
                if (aboutEl) {
                    const aboutText = (typeof data.about !== 'undefined' ? data.about : (data.bio || '')) || '';
                    const trimmed = aboutText.toString().trim();
                    if (trimmed) {
                        aboutEl.textContent = trimmed;
                        if (aboutSectionEl) aboutSectionEl.style.display = '';
                    } else {
                        aboutEl.textContent = '';
                        if (aboutSectionEl) aboutSectionEl.style.display = 'none';
                    }
                }

                // Side panel
                setText(document.querySelector('.side-profile-title'), (typeof data.title_prefix !== 'undefined') ? data.title_prefix : '');
                setText(document.querySelector('.side-profile-name'), fullNameValue);
                setText(document.querySelector('.side-profile-institution'), (typeof data.institution !== 'undefined') ? data.institution : '');

                // Top panel name: Sadece kendi profilini görüntülerken güncelle
                const topProfileName = document.querySelector('.profile-name');
                if (topProfileName && isSelfProfile) {
                    topProfileName.textContent = fullNameValue;
                }

                // Fotoğraf
                const incomingPhotoUrl = data.photo_url || data.photoUrl;
                if (incomingPhotoUrl) {
                    const mainProfilePhoto = document.getElementById('mainProfilePhoto');
                    updateOrInsertImage(mainProfilePhoto, incomingPhotoUrl);
                        setTimeout(() => { initPhotoUploadListeners(); }, 100);
                        const sideProfilePhoto = document.querySelector('.side-profile-photo');
                        if (sideProfilePhoto) {
                        sideProfilePhoto.innerHTML = `<img src="${incomingPhotoUrl}" alt="Profile Photo">`;
                    }
                }

                // Read-only indicator'ı kullanıcı adıyla güncelle
                if (isReadOnly) {
                    const indicator = document.getElementById('viewOnlyIndicator');
                    if (indicator && fullNameValue) {
                        indicator.innerHTML = `📋 <strong>${fullNameValue}</strong> kullanıcısının profili görüntüleniyor (Salt okunur mod)`;
                    }
                }

                // Read-only/admin kontrolüne göre butonları göster/gizle
                if (isReadOnly && !isAdminMode) {
                    hideEditButtons();
                } else {
                    showEditButtons();
                }

                // Hakkında edit butonu görünürlüğü
                const aboutEditBtn = document.getElementById('aboutEditBtn');
                const aboutEditContainer = document.getElementById('aboutEditContainer');
                const aboutTextEl = document.getElementById('aboutText');
                const aboutField = document.getElementById('aboutEditField');
                const aboutSaveBtn = document.getElementById('aboutSaveBtn');
                const aboutCancelBtn = document.getElementById('aboutCancelBtn');
                if (aboutEditBtn) {
                    if (isReadOnly && !isAdminMode) {
                        aboutEditBtn.style.display = 'none';
                    } else {
                        aboutEditBtn.style.display = 'inline-flex';
                        // Set click handler
                        aboutEditBtn.onclick = function() {
                            const currentText = aboutTextEl?.textContent || '';
                            if (aboutField) aboutField.value = currentText;
                            if (aboutEditContainer) aboutEditContainer.style.display = 'block';
                            if (aboutTextEl) aboutTextEl.style.display = 'none';
                        };
                    }
                }
                if (aboutCancelBtn) {
                    aboutCancelBtn.onclick = function() {
                        if (aboutEditContainer) aboutEditContainer.style.display = 'none';
                        if (aboutTextEl) aboutTextEl.style.display = '';
                    };
                }
                if (aboutSaveBtn) {
                    aboutSaveBtn.onclick = async function() {
                        const newAbout = (aboutField?.value || '').trim();
                        const urlParams = new URLSearchParams(window.location.search);
                        const viewUserParam = urlParams.get('viewUser');
                        const targetUser = viewUserParam || localStorage.getItem('currentUserEmail');
                        if (!targetUser) return;
                        try {
                            const payload = {
                                action: 'update',
                                targetUser,
                                profile: { about: newAbout }
                            };
                            const res = await window.backendAPI.post('profile.php?action=update', payload);
                            if (res?.success) {
                                if (aboutTextEl) aboutTextEl.textContent = newAbout;
                                showSuccessMessage('Hakkında bilgisi güncellendi');
                                if (aboutEditContainer) aboutEditContainer.style.display = 'none';
                                if (aboutTextEl) aboutTextEl.style.display = '';
                                const aboutSectionEl = document.getElementById('profileAboutSection');
                                if (aboutSectionEl) {
                                    aboutSectionEl.style.display = newAbout ? '' : 'none';
                                }
                            } else {
                                showErrorMessage('Güncelleme başarısız: ' + (res?.error || 'Bilinmeyen hata'));
                            }
                        } catch (err) {
                            console.error('Hakkında kaydetme hatası:', err);
                            showErrorMessage('Güncelleme sırasında hata oluştu');
                        }
                    };
                }

                // Eğer admin kendi profilindeyse ana Düzenle butonunu koyu kırmızı yap
                if (isAdminUser && isSelfProfile) {
                    const profileEditBtnEl = document.getElementById('profileEditBtn');
                    if (profileEditBtnEl) {
                        profileEditBtnEl.style.background = '#800020'; // koyu kırmızı
                        profileEditBtnEl.style.borderColor = '#800020';
                    }
                }
            })
            .catch((error) => {
                console.error('🔥 Profil getirme hatası:', error);
            })
            .finally(() => {
                // Başarısız olsa bile içeriği görünür yap
                const pc = document.getElementById('profileContent');
                if (pc) pc.style.visibility = 'visible';
            });
    }

    // Update Database users collection name field
    async function updateDatabaseUserName(newName) {
        try {
            const currentUserEmail = localStorage.getItem('currentUserEmail');
            if (!currentUserEmail) {
                return;
            }

            const payload = {
                action: 'update',
                targetUser: currentUserEmail,
                profile: { fullName: newName, name: newName }
            };

            const res = await window.backendAPI.post('profile.php?action=update', payload);
            if (!res || res.success !== true) {
                console.warn('Kullanıcı adı güncellemesi başarısız:', res?.error);
            } else {
                console.log('✅ Backend users name güncellendi:', newName);
                    if (typeof updateUserNameDisplay === 'function') {
                        updateUserNameDisplay();
                    }
            }
        } catch (error) {
            console.error('Backend users name güncelleme hatası:', error);
        }
    }

    // Update Database users collection photoUrl field
    async function updateDatabaseUserPhoto(photoUrlOrData, targetUserIdentifier = null) {
        try {
            // Hangi kullanıcının fotoğrafını güncellediğimizi belirle
            const urlParams = new URLSearchParams(window.location.search);
            const viewUserParam = urlParams.get('viewUser');
            const targetUser = targetUserIdentifier || viewUserParam || localStorage.getItem('currentUserEmail');
            
            if (!targetUser) {
                console.warn('Hedef kullanıcı belirlenemedi, photo güncellemesi yapılamıyor');
                return;
            }

            const body = { action: 'photo', targetUser };
            if (photoUrlOrData === null) {
                body.remove = true;
            } else if (typeof photoUrlOrData === 'string' && photoUrlOrData.startsWith('data:image/')) {
                body.photoData = photoUrlOrData; // base64 data URL
            } else if (typeof photoUrlOrData === 'string') {
                body.photoUrl = photoUrlOrData; // direct URL
            }

            const res = await window.backendAPI.post('profile.php?action=photo', body);
            if (res?.success) {
                // Update side panel photo based on response
                const sideProfilePhoto = document.querySelector('.side-profile-photo');
                if (sideProfilePhoto) {
                    const updatedUrl = res.photo_url || res.photoUrl;
                    if (updatedUrl) {
                        sideProfilePhoto.innerHTML = `<img src="${updatedUrl}" alt="Profile Photo">`;
                    } else if (body.remove) {
                        sideProfilePhoto.innerHTML = `<i class="fas fa-user-circle default-profile-icon"></i>`;
                    }
                }
                // Update main photo too
                const mainProfilePhoto = document.getElementById('mainProfilePhoto');
                const updatedUrl = res.photo_url || res.photoUrl;
                updateOrInsertImage(mainProfilePhoto, updatedUrl);
                console.log('✅ Backend users collection photo_url güncellendi:', updatedUrl, 'Hedef:', targetUser);
                } else {
                console.warn('Fotoğraf güncelleme başarısız:', res?.error);
            }
        } catch (error) {
            console.error('Backend users photoUrl güncelleme hatası:', error);
        }
    }

    // Profile Editing Functions
    function initProfileEditing() {
        // Read-only mod kontrolü ve admin kontrolü
        const urlParams = new URLSearchParams(window.location.search);
        const isReadOnly = urlParams.get('readOnly') === 'true';
        const adminMode = localStorage.getItem('adminMode');
        const hasRealAdminAccess = localStorage.getItem('realAdminAccess') === 'true';
        const isAdminMode = adminMode === 'admin' && hasRealAdminAccess;
        
        // Read-only modda profil düzenleme özelliklerini devre dışı bırak (admin değilse)
        if (isReadOnly && !isAdminMode) { return; }
        
        const profileEditBtn = document.getElementById('profileEditBtn');
        const cancelBtn = document.getElementById('cancelBasicInfoBtn');
        const saveBtn = document.getElementById('saveBasicInfoBtn');
        const editBasicInfoBtn = document.getElementById('editBasicInfoBtn');
        
        // Initialize originalFormData to prevent access errors
        originalFormData = {};
        
        // Mavi düzenle butonunu tamamen gizle
        if (editBasicInfoBtn) {
            editBasicInfoBtn.style.display = 'none';
        }
        
        // Mor düzenle butonuna event listener eklemeden önce eskiyi temizle
        if (profileEditBtn) {
            // Remove all existing event listeners
            const newProfileEditBtn = profileEditBtn.cloneNode(true);
            profileEditBtn.parentNode.replaceChild(newProfileEditBtn, profileEditBtn);
            
            // Add new event listener to the new element - with toggle functionality
            newProfileEditBtn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                // Read-only mod kontrolü ve admin kontrolü
                const urlParams = new URLSearchParams(window.location.search);
                const isReadOnly = urlParams.get('readOnly') === 'true';
                const adminMode = localStorage.getItem('adminMode');
                const hasRealAdminAccess = localStorage.getItem('realAdminAccess') === 'true';
                const isAdminMode = adminMode === 'admin' && hasRealAdminAccess;
                
                if (isReadOnly && !isAdminMode) {
                    console.log('Profile editing disabled in read-only mode');
                    return;
                }
                
                // Check if edit mode is currently open
                const editMode = document.getElementById('infoEditMode');
                const viewMode = document.getElementById('infoViewMode');
                
                if (editMode && editMode.style.display === 'block') {
                    // Edit mode is open, close it (gizli iptal)
                    cancelEdit();
                } else {
                    // Edit mode is closed, open it
                    openProfileEditMode();
                }
            });
        }
        
        // İptal tuşuna event listener ekle
        if (cancelBtn) {
            cancelBtn.onclick = null;
            cancelBtn.removeEventListener('click', cancelEdit);
            cancelBtn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                cancelEdit();
            });
        }
        
        // Kaydet tuşuna event listener ekle
        if (saveBtn) {
            saveBtn.onclick = null;
            saveBtn.removeEventListener('click', saveBasicInfo);
            saveBtn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                saveBasicInfo();
            });
        }
        
        // Initialize photo upload event listeners
        initPhotoUploadListeners();
        
        // Ensure photo controls are hidden initially
        window.hidePhotoControls();
    }
    
    function initPhotoUploadListeners() {
        // Initialize photo upload event listeners
        const photoUpload = document.getElementById('photoUpload');
        const photoRemoveBtn = document.getElementById('photoRemoveBtn');
        
        if (photoUpload) {
            photoUpload.removeEventListener('change', handlePhotoUpload);
            photoUpload.addEventListener('change', handlePhotoUpload);
        }
        
        if (photoRemoveBtn) {
            photoRemoveBtn.removeEventListener('click', removeProfilePhoto);
            photoRemoveBtn.addEventListener('click', removeProfilePhoto);
        }
    }
    
    // Özlük bilgileri düzenleme modunu açan fonksiyon
    function openProfileEditMode() {
        // DOM hazır olmasını bekle
        setTimeout(() => {
            const viewMode = document.getElementById('infoViewMode');
            const editMode = document.getElementById('infoEditMode');
            let photoControls = document.getElementById('photoControls'); // Yeni: photoControls
            
            // Eğer ID ile bulunamazsa class ile dene
            if (!photoControls) {
                photoControls = document.querySelector('.photo-controls');
                console.log('Photo controls found by class selector:', photoControls);
            }
            
        if (viewMode && editMode) {
            // Görüntüleme modunu gizle
            viewMode.style.display = 'none';
            // Düzenleme modunu göster
            editMode.style.display = 'block';
            
            // Fotoğraf kontrol butonlarını göster (düzenleme modunda)
            if (photoControls) {
                photoControls.style.display = 'flex';
                photoControls.classList.add('show-controls'); // CSS class ekle
                
                // CSS class da ekleyelim güvenlik için
                if (editMode) {
                    editMode.classList.add('info-edit-mode');
                }
                
                // Photo upload butonu her zaman gösterilsin
                const photoUploadBtn = photoControls.querySelector('.photo-upload-btn');
                if (photoUploadBtn) {
                    photoUploadBtn.style.display = 'flex';
                } else {
                    console.warn('❌ Photo upload button not found in photoControls');
                }
                
                // Photo remove butonunu sadece fotoğraf varsa göster
                const photoRemoveBtn = document.getElementById('photoRemoveBtn');
                const mainPhotoImg = document.querySelector('#mainProfilePhoto img');
                
                if (photoRemoveBtn) {
                    if (mainPhotoImg) {
                        photoRemoveBtn.style.display = 'flex';
                    } else {
                        photoRemoveBtn.style.display = 'none';
                    }
                } else {
                    console.warn('❌ Photo remove button not found');
                }
                
                // Final verification
            } else {
                console.warn('❌ Photo controls element not found!');
                // Element bulunamadıysa tüm photo-controls elementlerini ara
                const allPhotoControls = document.querySelectorAll('.photo-controls');
                allPhotoControls.forEach((el, index) => {
                    console.log(`Element ${index}:`, el);
                });
            }
            
            // Mevcut verileri forma yükle
            loadCurrentDataToForm();
            
        } else {
            console.error('Could not find view/edit mode elements!');
            console.error('viewMode element:', viewMode);
            console.error('editMode element:', editMode);
            
            // Try to find elements with more specific selectors
            const allViewModes = document.querySelectorAll('[id*="View"], [id*="view"]');
            const allEditModes = document.querySelectorAll('[id*="Edit"], [id*="edit"]');
            console.log('All elements with "view" in ID:', allViewModes);
            console.log('All elements with "edit" in ID:', allEditModes);
        }
        }, 50); // setTimeout kapatması
    }
    
    function cancelEdit() {
        const viewMode = document.getElementById('infoViewMode');
        const editMode = document.getElementById('infoEditMode');
        const photoControls = document.getElementById('photoControls');
        const photoOverlay = document.getElementById('photoUploadOverlay');
        
        // Restore original form data - with null check
        if (originalFormData && typeof originalFormData === 'object') {
            const titleSelect = document.getElementById('titlePrefixEdit');
            const nameInput = document.getElementById('fullNameEdit');
            const institutionInput = document.getElementById('institutionEdit');
            const facultyInput = document.getElementById('facultyEdit');
            const departmentInput = document.getElementById('departmentEdit');
            const statusSelect = document.getElementById('statusEdit');
            
            if (titleSelect) titleSelect.value = originalFormData.title_prefix || '';
            if (nameInput) nameInput.value = originalFormData.fullName || '';
            if (institutionInput) institutionInput.value = originalFormData.institution || '';
            if (facultyInput) facultyInput.value = originalFormData.faculty || '';
            if (departmentInput) departmentInput.value = originalFormData.department || '';
            if (statusSelect) statusSelect.value = originalFormData.status || '';
            
            // Restore original photo
            if (originalFormData.photoHTML) {
                const mainProfilePhoto = document.getElementById('mainProfilePhoto');
                if (mainProfilePhoto) {
                    mainProfilePhoto.innerHTML = originalFormData.photoHTML;
                    
                    // Re-attach event listeners after restoring HTML
                    setTimeout(() => {
                        initPhotoUploadListeners();
                    }, 10);
                }
                
                // Also restore side panel photo to match
                const sideProfilePhoto = document.querySelector('.side-profile-photo');
                const mainPhotoImg = document.querySelector('#mainProfilePhoto img');
                if (sideProfilePhoto && mainPhotoImg) {
                    // If main photo has an image, restore side panel image too
                    const imgSrc = mainPhotoImg.src;
                    sideProfilePhoto.innerHTML = `<img src="${imgSrc}" alt="Profile Photo">`;
                } else if (sideProfilePhoto) {
                    // If no image, restore default icon
                    sideProfilePhoto.innerHTML = `<i class="fas fa-user-circle default-profile-icon"></i>`;
                }
            }
        }
        
        if (viewMode && editMode) {
            viewMode.style.display = 'block';
            editMode.style.display = 'none';
            editMode.classList.remove('info-edit-mode'); // Class'ı kaldır
            
            // Hide photo controls using global function
            window.hidePhotoControls();
            
            // Hide the blue edit button after canceling
            const editButton = document.getElementById('editBasicInfoBtn');
            if (editButton) {
                editButton.style.display = 'none';
            }
            
            // Update the toggle state
            if (typeof window.hideBlueEditButton === 'function') {
                window.hideBlueEditButton();
            }
        }
    }
    
    function loadCurrentDataToForm() {
        // Initialize originalFormData if not already done
        if (!originalFormData) {
            originalFormData = {};
        }
        
        // Get current data from display and store as original
        const title_prefix = document.querySelector('.title-prefix')?.textContent.trim() || '';
        const fullName = document.querySelector('.full-name')?.textContent.trim() || '';
        const institution = document.querySelector('.institution')?.textContent.trim() || '';
        const faculty = document.querySelector('.faculty')?.textContent.trim() || '';
        const department = document.querySelector('.department')?.textContent.trim() || '';
        const status = document.querySelector('.status')?.textContent.trim() || '';
        
        // Get current photo state
        const mainProfilePhoto = document.getElementById('mainProfilePhoto');
        let originalPhotoHTML = '';
        if (mainProfilePhoto) {
            originalPhotoHTML = mainProfilePhoto.innerHTML;
        }
        
        // Store original data for cancel functionality
        originalFormData = {
            title_prefix,
            fullName,
            institution,
            faculty,
            department,
            status,
            photoHTML: originalPhotoHTML
        };
        
        // Populate form fields
        const titleSelect = document.getElementById('titlePrefixEdit');
        const nameInput = document.getElementById('fullNameEdit');
        const institutionInput = document.getElementById('institutionEdit');
        const facultyInput = document.getElementById('facultyEdit');
        const departmentInput = document.getElementById('departmentEdit');
        const statusSelect = document.getElementById('statusEdit');
        
        if (titleSelect) titleSelect.value = title_prefix;
        if (nameInput) nameInput.value = fullName;
        if (institutionInput) institutionInput.value = institution;
        if (facultyInput) facultyInput.value = faculty;
        if (departmentInput) departmentInput.value = department;
        if (statusSelect) statusSelect.value = status;
        
        // Re-initialize photo upload listeners after form load
        setTimeout(() => {
            initPhotoUploadListeners();
        }, 100);
    }
    
    function saveBasicInfo() {
        // Hangi kullanıcının profilini düzenlediğimizi belirle
        const urlParams = new URLSearchParams(window.location.search);
        const viewUserParam = urlParams.get('viewUser');
        const targetUserIdentifier = viewUserParam || localStorage.getItem('currentUserEmail');
        
        // Get all form data
        const title_prefix = document.getElementById('titlePrefixEdit')?.value || '';
        const fullName = document.getElementById('fullNameEdit')?.value || '';
        const institution = document.getElementById('institutionEdit')?.value || '';
        const faculty = document.getElementById('facultyEdit')?.value || '';
        const department = document.getElementById('departmentEdit')?.value || '';
        const status = document.getElementById('statusEdit')?.value || '';
        const phone = document.getElementById('phoneEdit')?.value || '';
        // Positions (assume comma separated string)
        const positions = document.getElementById('positionsEdit')?.value || '';
        // Add other fields as needed

        // Update display elements
        setText(document.querySelector('.title-prefix'), title_prefix || '');
        setText(document.querySelector('.full-name'), fullName || '');
        setText(document.querySelector('.institution'), institution || '');
        setText(document.querySelector('.faculty'), faculty || '');
        setText(document.querySelector('.department'), department || '');
        setTextOrHide(document.querySelector('.status'), status || '');
        setText(document.querySelector('.phone'), phone || '');
        setText(document.querySelector('.position'), positions || '');

        // Update top panel name
        const topProfileName = document.querySelector('.profile-name');
        if (topProfileName) {
            topProfileName.textContent = fullName || '';
        }

        // Update side panel information
        const sideProfileTitle = document.querySelector('.side-profile-title');
        const sideProfileName = document.querySelector('.side-profile-name');
        const sideProfileInstitution = document.querySelector('.side-profile-institution');

        setText(sideProfileTitle, title_prefix || '');
        setText(sideProfileName, fullName || '');
        setText(sideProfileInstitution, institution || '');

        // Update original form data with current saved values (including photo)
        const mainProfilePhoto = document.getElementById('mainProfilePhoto');
        if (mainProfilePhoto) {
            originalFormData.photoHTML = mainProfilePhoto.innerHTML;
        }
        originalFormData.title_prefix = title_prefix;
        originalFormData.fullName = fullName;
        originalFormData.institution = institution;
        originalFormData.faculty = faculty;
        originalFormData.department = department;
        originalFormData.status = status;
        originalFormData.phone = phone;
        originalFormData.positions = positions;

        // Save to Database - hedef kullanıcıyı belirt
        saveProfileToDatabase({
            title_prefix,
            name: fullName,
            institution,
            faculty,
            department,
            status,
            phone,
            // email is not updated here
            positions: positions ? positions.split(',').map(p => p.trim()) : [],
            photo_url: mainProfilePhoto ? (mainProfilePhoto.querySelector('img')?.src || '') : ''
        }, targetUserIdentifier);

        // Update Database users collection name field if fullName is provided
        // Sadece kendi profilimizi düzenliyorsak global user name'i güncelle
        if (fullName.trim() && !viewUserParam) {
            updateDatabaseUserName(fullName);
        }

        // Show success message
        showSuccessMessage('Profil başarıyla güncellendi!');

        // Switch back to view mode
        const viewMode = document.getElementById('infoViewMode');
        const editMode = document.getElementById('infoEditMode');
        const photoOverlay = document.getElementById('photoUploadOverlay');
        const photoControls = document.getElementById('photoControls');

        if (viewMode && editMode) {
            viewMode.style.display = 'block';
            editMode.style.display = 'none';
            
            // Hide photo controls using global function
            window.hidePhotoControls();
            
            // Hide the blue edit button after saving
            const editButton = document.getElementById('editBasicInfoBtn');
            if (editButton) {
                editButton.style.display = 'none';
            }
            
            // Update the toggle state
            if (typeof window.hideBlueEditButton === 'function') {
                window.hideBlueEditButton();
            }
        }
    }
    

    
    function handlePhotoUpload(e) {
        const file = e.target.files[0];
        if (file) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                showErrorMessage('Lütfen geçerli bir resim dosyası seçin.');
                return;
            }
            
            // Validate file size (25MB max)
            const maxSize = 25 * 1024 * 1024; // 25MB
            if (file.size > maxSize) {
                showErrorMessage('Dosya boyutu 25MB\'dan küçük olmalıdır.');
                return;
            }
            
            // Read and update photo
            const reader = new FileReader();
            reader.onload = function(e) {
                updateProfilePhoto(e.target.result);
            };
            reader.readAsDataURL(file);
        }
    }
    
    function updateProfilePhoto(imageSrc) {
        const mainProfilePhoto = document.getElementById('mainProfilePhoto');
        if (mainProfilePhoto) {
            // Sadece img tag'ini güncelle, photo-controls'i koru
            const existingImg = mainProfilePhoto.querySelector('img');
            const photoControls = mainProfilePhoto.querySelector('.photo-controls');
            
            if (existingImg) {
                // Mevcut img'yi güncelle
                existingImg.src = imageSrc;
                existingImg.style.width = '150px';
                existingImg.style.height = '150px';
                existingImg.style.borderRadius = '50%';
                existingImg.style.objectFit = 'cover';
            } else {
                // Yeni img oluştur ama photo-controls'i koru
                const defaultIcon = mainProfilePhoto.querySelector('.default-photo-icon');
                if (defaultIcon) {
                    defaultIcon.remove();
                }
                
                const img = document.createElement('img');
                img.src = imageSrc;
                img.alt = 'Profile Photo';
                img.style.width = '150px';
                img.style.height = '150px';
                img.style.borderRadius = '50%';
                img.style.objectFit = 'cover';
                
                // img'yi photo-controls'den önce ekle
                if (photoControls) {
                    mainProfilePhoto.insertBefore(img, photoControls);
                } else {
                    mainProfilePhoto.appendChild(img);
                }
            }
            
            // Photo remove butonunu göster (fotoğraf var artık)
            const photoRemoveBtn = document.getElementById('photoRemoveBtn');
            if (photoRemoveBtn) {
                photoRemoveBtn.style.display = 'flex';
            }
            
            // Re-attach event listeners
            setTimeout(() => {
                initPhotoUploadListeners();
            }, 10);
        }
        
        // Update side panel photo as well
        const sideProfilePhoto = document.querySelector('.side-profile-photo');
        if (sideProfilePhoto) {
            // Keep the existing CSS classes and structure, just replace the content
            sideProfilePhoto.innerHTML = `
                <img src="${imageSrc}" alt="Profile Photo">
            `;
        }
        
        // Update Database with new photo URL - hedef kullanıcıyı belirt
        const urlParams = new URLSearchParams(window.location.search);
        const viewUserParam = urlParams.get('viewUser');
        const targetUserIdentifier = viewUserParam || localStorage.getItem('currentUserEmail');
        updateDatabaseUserPhoto(imageSrc, targetUserIdentifier);
        
        // Do NOT update original form data here - only update on save
        // This allows cancel to revert photo changes
        
        showSuccessMessage('Profil fotoğrafı güncellendi!');
    }
    
    function removeProfilePhoto() {
        const mainProfilePhoto = document.getElementById('mainProfilePhoto');
        if (mainProfilePhoto) {
            // Img'yi kaldır ve default icon ekle, photo-controls'i koru
            const existingImg = mainProfilePhoto.querySelector('img');
            if (existingImg) {
                existingImg.remove();
            }
            
            // Default icon ekle eğer yoksa
            const defaultIcon = mainProfilePhoto.querySelector('.default-photo-icon');
            if (!defaultIcon) {
                const icon = document.createElement('i');
                icon.className = 'fas fa-user-circle default-photo-icon';
                
                // Icon'u photo-controls'den önce ekle
                const photoControls = mainProfilePhoto.querySelector('.photo-controls');
                if (photoControls) {
                    mainProfilePhoto.insertBefore(icon, photoControls);
                } else {
                    mainProfilePhoto.appendChild(icon);
                }
            }
            
            // Photo remove butonunu gizle (fotoğraf yok artık)
            const photoRemoveBtn = document.getElementById('photoRemoveBtn');
            if (photoRemoveBtn) {
                photoRemoveBtn.style.display = 'none';
            }
            
            // Re-attach event listener
            setTimeout(() => {
                initPhotoUploadListeners();
            }, 10);
        }
        
        // Reset side panel photo as well
        const sideProfilePhoto = document.querySelector('.side-profile-photo');
        if (sideProfilePhoto) {
            sideProfilePhoto.innerHTML = `
                <i class="fas fa-user-circle default-profile-icon"></i>
            `;
        }
        
        // Remove photo from Database (set to null) - hedef kullanıcıyı belirt
        const urlParams = new URLSearchParams(window.location.search);
        const viewUserParam = urlParams.get('viewUser');
        const targetUserIdentifier = viewUserParam || localStorage.getItem('currentUserEmail');
        updateDatabaseUserPhoto(null, targetUserIdentifier);
        
        // Do NOT update original form data here - only update on save
        // This allows cancel to revert photo removal
        
        showSuccessMessage('Profil fotoğrafı kaldırıldı!');
    }
    
    function showSuccessMessage(message) {
        // Create and show success notification
        const notification = document.createElement('div');
        notification.className = 'success-notification';
        notification.innerHTML = `
            <i class="fas fa-check-circle"></i>
            <span>${message}</span>
        `;
        
        document.body.appendChild(notification);
        
        // Show with animation
        setTimeout(() => notification.classList.add('show'), 100);
        
        // Hide after 3 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 3000);
        }, 3000);
    }
    
    function showErrorMessage(message) {
        // Create and show error notification
        const notification = document.createElement('div');
        notification.className = 'error-notification';
        notification.innerHTML = `
            <i class="fas fa-exclamation-circle"></i>
            <span>${message}</span>
        `;
        
        document.body.appendChild(notification);
        
        // Show with animation
        setTimeout(() => notification.classList.add('show'), 100);
        
        // Hide after 3 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    // Remove duplicate hamburger handlers below to avoid double toggling

    // Profile Dropdown Toggle (database-script.js'teki gibi)
    function toggleProfileDropdown() {
        if (profileDropdown) {
            profileDropdown.classList.toggle('active');
        }
    }

    // Profile section click event - sadece bir kez tanımla ve user dropdown işlevselliği ekle
    if (profileSection) {
        profileSection.addEventListener('click', function(e) {
            e.stopPropagation();
            toggleProfileDropdown();
        });
    }

    // Close dropdown when clicking outside
    document.addEventListener('click', function(e) {
        if (profileSection && profileDropdown && 
            !profileSection.contains(e.target) && 
            !profileDropdown.contains(e.target)) {
            profileDropdown.classList.remove('active');
            profileDropdown.classList.remove('show');
        }
    });

    // Photo Upload Handler
    if (photoUpload && profilePhoto) {
        photoUpload.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    profilePhoto.src = e.target.result;
                    localStorage.setItem('profilePhoto', e.target.result);
                    
                    // Side panel fotoğrafını da güncelle
                    const sideProfilePhoto = document.getElementById('sideProfilePhoto');
                    if (sideProfilePhoto) {
                        sideProfilePhoto.src = e.target.result;
                    }
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // Load Profile Data
    function loadProfileData() {
        const profileData = localStorage.getItem('profileData');
        if (profileData) {
            const data = JSON.parse(profileData);
            
            // Academic Links
            if (document.getElementById('linkedinLink')) document.getElementById('linkedinLink').value = data.linkedinLink || '';
            if (document.getElementById('wosLink')) document.getElementById('wosLink').value = data.wosLink || '';
            if (document.getElementById('scopusLink')) document.getElementById('scopusLink').value = data.scopusLink || '';
            if (document.getElementById('orcidLink')) document.getElementById('orcidLink').value = data.orcidLink || '';
            
            // Personal Info
            if (document.getElementById('fullName')) document.getElementById('fullName').value = data.fullName || '';
            if (document.getElementById('email')) document.getElementById('email').value = data.email || '';
            if (document.getElementById('phone')) document.getElementById('phone').value = data.phone || '';
            if (document.getElementById('department')) document.getElementById('department').value = data.department || '';
            if (document.getElementById('title')) document.getElementById('title').value = data.title || '';
        }
        
        // Load saved photo
        const savedPhoto = localStorage.getItem('profilePhoto');
        if (savedPhoto) {
            if (profilePhoto) profilePhoto.src = savedPhoto;
            const sideProfilePhoto = document.getElementById('sideProfilePhoto');
            if (sideProfilePhoto) sideProfilePhoto.src = savedPhoto;
        }
    }

    // Load profile data on page load
    loadProfileData();

    // Save Profile Data
    function saveProfileData() {
        // Tüm profil alanlarını topla ve Database'e kaydet
        const profileData = {
            name: document.getElementById('fullName')?.value || '',
            email: document.getElementById('email')?.value || '',
            phone: document.getElementById('phone')?.value || '',
            department: document.getElementById('department')?.value || '',
            title_prefix: document.getElementById('title_prefix')?.value || '',
            institution: document.getElementById('institution')?.value || '',
            faculty: document.getElementById('faculty')?.value || '',
            status: document.getElementById('status')?.value || '',
            positions: document.getElementById('positions')?.value ? document.getElementById('positions').value.split(',').map(p=>p.trim()) : [],
            linkedinLink: document.getElementById('linkedinLink')?.value || '',
            wosLink: document.getElementById('wosLink')?.value || '',
            scopusLink: document.getElementById('scopusLink')?.value || '',
            orcidLink: document.getElementById('orcidLink')?.value || '',
            lastUpdated: new Date().toISOString()
        };
        localStorage.setItem('profileData', JSON.stringify(profileData));
        saveProfileToDatabase(profileData);
        // Reload contact data if contact section is active
        const contactSection = document.getElementById('contactContent');
        if (contactSection && contactSection.style.display !== 'none') {
            loadContactData();
        }
        // Show save confirmation
        if (saveProfileBtn) {
            saveProfileBtn.textContent = '✅ Kaydedildi!';
            saveProfileBtn.style.background = '#28a745';
            setTimeout(() => {
                saveProfileBtn.textContent = '💾 Profili Kaydet';
                saveProfileBtn.style.background = '';
            }, 2000);
        }
    }

    // Save Button Handler
    if (saveProfileBtn) {
        saveProfileBtn.addEventListener('click', saveProfileData);
    }

    // Auto-save on input change
    const inputs = document.querySelectorAll('#profileEditingPanel input');
    inputs.forEach(input => {
        input.addEventListener('blur', saveProfileData);
    });

    // Close profile editing panel when clicking on main content
    if (mainContent) {
        mainContent.addEventListener('click', function() {
            if (profileEditingPanel && profileEditingPanel.classList.contains('open')) {
                profileEditingPanel.classList.remove('open');
            }
        });
    }

    // Prevent panels from closing when clicking inside them
    if (sidePanel) {
        sidePanel.addEventListener('click', function(e) {
            e.stopPropagation();
        });
    }

    if (profileEditingPanel) {
        profileEditingPanel.addEventListener('click', function(e) {
            e.stopPropagation();
        });
    }

    // CV Download functionality
    // CV Download fonksiyonu kaldırıldı. Artık default bilgi yok.

    // Initialize
    loadProfileData();
    
    // Hamburger animation is handled in the main click handler above
    
    // Mor düzenle butonuna tıklandığında direkt edit modunu aç
    // Zaten yukarıda tanımlı profileEditBtn ile event listener ekleniyor
});

// Global function for profile dropdown toggle (database-script.js'teki gibi)
function toggleProfileDropdown() {
    const profileDropdown = document.getElementById('profileDropdown');
    if (profileDropdown) {
        profileDropdown.classList.toggle('active');
    }
}

// Close dropdown when clicking outside
document.addEventListener('click', function(event) {
    const profileSection = document.getElementById('profileSection');
    const profileDropdown = document.getElementById('profileDropdown');
    
    if (profileSection && profileDropdown && 
        !profileSection.contains(event.target) && 
        !profileDropdown.contains(event.target)) {
        profileDropdown.classList.remove('show');
        console.log('Dropdown closed by outside click'); // Debug
    }
});

// Education System
let educationData = {
    education: [],
    thesis: [],
    languages: [],
    workAreas: [],
    interestAreas: []
};

// Load data from localStorage on page load
function loadEducationData() {
    const savedData = localStorage.getItem('educationData');
    if (savedData) {
        educationData = JSON.parse(savedData);
        
        // Ensure all required properties exist (backward compatibility)
        if (!educationData.workAreas) {
            educationData.workAreas = [];
        }
        if (!educationData.interestAreas) {
            educationData.interestAreas = [];
        }
        if (!educationData.education) {
            educationData.education = [];
        }
        if (!educationData.thesis) {
            educationData.thesis = [];
        }
        if (!educationData.languages) {
            educationData.languages = [];
        }
    }
}

// Save data to localStorage
function saveEducationData() {
    localStorage.setItem('educationData', JSON.stringify(educationData));
}

// Load data on initialization
loadEducationData();

let editMode = false;
let currentEditItem = null;
let currentEditType = null;

// Research system variables
let researchEditMode = false;

function initEducationSystem() {
    // Education Edit Mode Toggle
    const educationEditBtn = document.getElementById('educationEditBtn');
    if (educationEditBtn && !educationEditBtn.hasEventListener) {
        educationEditBtn.hasEventListener = true;
        educationEditBtn.addEventListener('click', function() {
            editMode = !editMode;
            toggleEducationEditMode();
        });
    }

    // Add button event listeners
    const addEducationBtn = document.getElementById('addEducationBtn');
    const addThesisBtn = document.getElementById('addThesisBtn');
    const addLanguageBtn = document.getElementById('addLanguageBtn');

    if (addEducationBtn && !addEducationBtn.hasEventListener) {
        addEducationBtn.hasEventListener = true;
        addEducationBtn.addEventListener('click', () => openModal('education'));
    }
    if (addThesisBtn && !addThesisBtn.hasEventListener) {
        addThesisBtn.hasEventListener = true;
        addThesisBtn.addEventListener('click', () => openModal('thesis'));
    }
    if (addLanguageBtn && !addLanguageBtn.hasEventListener) {
        addLanguageBtn.hasEventListener = true;
        addLanguageBtn.addEventListener('click', () => openModal('language'));
    }

    // Initialize education data rendering
    renderEducationItems();
    renderThesisItems();
    renderLanguageItems();
}

// Education Edit Mode Toggle

function toggleEducationEditMode() {
    const educationEditBtn = document.getElementById('educationEditBtn');
    const sections = document.querySelectorAll('.education-section');
    const addBtns = document.querySelectorAll('.add-item-btn');
    
    if (editMode) {
        if (educationEditBtn) {
            educationEditBtn.innerHTML = '<i class="fas fa-check"></i> Bitir';
            educationEditBtn.style.background = '#28a745';
        }
        sections.forEach(section => section.classList.add('edit-mode'));
        addBtns.forEach(btn => {
            btn.classList.add('show');
        });
    } else {
        if (educationEditBtn) {
            educationEditBtn.innerHTML = '<i class="fas fa-edit"></i> Düzenle';
            educationEditBtn.style.background = '#8b5cf6';
        }
        sections.forEach(section => section.classList.remove('edit-mode'));
        addBtns.forEach(btn => {
            btn.classList.remove('show');
        });
    }
}

// Add button event listeners

// Modal functions
function openModal(type, item = null) {
    currentEditType = type;
    currentEditItem = item;
    
    console.log(`🚀 Opening modal for type: ${type}`);
    
    // EMERGENCY FIX: If modals don't exist, create them dynamically
    if (type === 'education') {
        let educationModal = document.getElementById('educationModal');
        if (!educationModal) {
            console.warn(`🔧 EMERGENCY FIX: Creating educationModal dynamically because it's missing from DOM`);
            createEducationModalDynamically();
            educationModal = document.getElementById('educationModal');
            console.log(`✅ Dynamic educationModal created:`, !!educationModal);
        }
    } else if (type === 'workArea') {
        let workAreaModal = document.getElementById('workAreaModal');
        if (!workAreaModal) {
            console.warn(`🔧 EMERGENCY FIX: Creating workAreaModal dynamically because it's missing from DOM`);
            createWorkAreaModalDynamically();
            workAreaModal = document.getElementById('workAreaModal');
            console.log(`✅ Dynamic workAreaModal created:`, !!workAreaModal);
        }
    } else if (type === 'interestArea') {
        let interestAreaModal = document.getElementById('interestAreaModal');
        if (!interestAreaModal) {
            console.warn(`🔧 EMERGENCY FIX: Creating interestAreaModal dynamically because it's missing from DOM`);
            createInterestAreaModalDynamically();
            interestAreaModal = document.getElementById('interestAreaModal');
            console.log(`✅ Dynamic interestAreaModal created:`, !!interestAreaModal);
        }
    }
    
    // COMPREHENSIVE DOM DEBUGGING FOR EDUCATION MODAL ISSUE
    if (type === 'education') {
        console.log(`🔍 DEEP DOM INVESTIGATION FOR EDUCATION MODAL:`);
        
        // 1. Check document readiness
        console.log(`📋 Document state:`, {
            readyState: document.readyState,
            bodyExists: !!document.body,
            htmlExists: !!document.documentElement
        });
        
        // 2. Search for ANY element containing "education" in its ID or class
        const allElements = document.querySelectorAll('*');
        const educationRelatedElements = Array.from(allElements).filter(el => 
            (el.id && el.id.toLowerCase().includes('education')) ||
            (el.className && el.className.toLowerCase().includes('education'))
        );
        
        console.log(`📋 Elements with 'education' in ID/class:`, educationRelatedElements.map(el => ({
            tag: el.tagName,
            id: el.id,
            className: el.className,
            visible: el.offsetHeight > 0
        })));
        
        // 3. Check if the educationModal HTML exists in the raw document
        const fullHTML = document.documentElement.outerHTML;
        const educationModalInHTML = fullHTML.includes('id="educationModal"');
        const educationFormInHTML = fullHTML.includes('id="educationForm"');
        
        console.log(`📋 Raw HTML check:`, {
            educationModalInHTML,
            educationFormInHTML,
            htmlLength: fullHTML.length
        });
        
        // 4. If HTML exists but DOM element doesn't, there's a parsing issue
        if (educationModalInHTML && !document.getElementById('educationModal')) {
            console.error(`🚨 CRITICAL: educationModal exists in HTML but not in DOM! This suggests an HTML parsing error.`);
            
            // Find the position of educationModal in HTML
            const modalIndex = fullHTML.indexOf('id="educationModal"');
            const beforeModal = fullHTML.substring(Math.max(0, modalIndex - 200), modalIndex);
            const afterModal = fullHTML.substring(modalIndex, modalIndex + 200);
            
            console.log(`📋 HTML context around educationModal:`, {
                before: beforeModal,
                after: afterModal
            });
        }
        
        // 5. Check for any JavaScript errors that might prevent DOM loading
        console.log(`📋 Window errors:`, window.onerror ? 'Error handler exists' : 'No error handler');
        
        // 6. Check if modal is inside a display:none container
        const allModals = document.querySelectorAll('[id*="Modal"]');
        console.log(`📋 All modal elements and their visibility:`, Array.from(allModals).map(modal => ({
            id: modal.id,
            visible: modal.offsetHeight > 0,
            display: window.getComputedStyle(modal).display,
            parentVisible: modal.parentElement ? modal.parentElement.offsetHeight > 0 : 'no parent'
        })));
    }
    
    // First, let's check what's actually in the DOM
    console.log(`🔍 DOM Investigation for ${type}Modal:`);
    
    // Check if element exists using multiple methods
    const modalById = document.getElementById(type + 'Modal');
    const modalBySelector = document.querySelector(`#${type}Modal`);
    const allModalElements = document.querySelectorAll('[id*="Modal"]');
    const allEducationElements = document.querySelectorAll('[id*="education"]');
    
    console.log(`📋 Element search results:`, {
        getElementById: !!modalById,
        querySelector: !!modalBySelector,
        totalModals: allModalElements.length,
        totalEducationElements: allEducationElements.length
    });
    
    console.log(`📋 All modal IDs found:`, Array.from(allModalElements).map(el => el.id));
    console.log(`📋 All education-related IDs:`, Array.from(allEducationElements).map(el => el.id));
    
    // Retry mechanism for DOM elements that might not be ready yet
    function findModalElements(retryCount = 0) {
        const modal = document.getElementById(type + 'Modal');
        const form = document.getElementById(type + 'Form');
        
        console.log(`🎯 Modal search attempt ${retryCount + 1}:`, {
            modal: !!modal,
            form: !!form,
            modalId: type + 'Modal',
            formId: type + 'Form'
        });
        
        if (!modal || !form) {
            if (retryCount < 3) {
                console.log(`⏳ Elements not found, retrying in 100ms... (attempt ${retryCount + 1}/3)`);
                setTimeout(() => findModalElements(retryCount + 1), 100);
                return;
            } else {
                console.error(`❌ Failed to find modal elements after 3 attempts:`);
                console.error(`   - Modal (${type}Modal): ${!!modal}`);
                console.error(`   - Form (${type}Form): ${!!form}`);
                
                // Debug: List all modals that actually exist
                const allModals = document.querySelectorAll('[id*="Modal"]');
                console.log(`🔍 Available modals in DOM:`, Array.from(allModals).map(m => m.id));
                
                // Special debugging for education modal
                if (type === 'education') {
                    console.log(`🔍 Specific education debugging:`);
                    const educationModalVariants = [
                        'educationModal',
                        'education-modal', 
                        'educationmodal',
                        'EducationModal'
                    ];
                    
                    educationModalVariants.forEach(variant => {
                        const element = document.getElementById(variant);
                        console.log(`   - ${variant}: ${!!element}`);
                    });
                    
                    // Check if there's an HTML structure issue
                    const bodyHTML = document.body.innerHTML;
                    const hasEducationModalInHTML = bodyHTML.includes('educationModal');
                    console.log(`   - educationModal in body HTML: ${hasEducationModalInHTML}`);
                    
                    if (hasEducationModalInHTML) {
                        const educationModalMatch = bodyHTML.match(/id="educationModal"[^>]*>/);
                        console.log(`   - educationModal HTML fragment:`, educationModalMatch);
                    }
                }
                return;
            }
        }
        
        // Success - proceed with modal opening
        if (item) {
            // Edit mode - populate form
            console.log(`✏️ Edit mode - filling form with:`, item);
            fillForm(form, item);
        } else {
            // Add mode - clear form
            console.log(`➕ Add mode - clearing form`);
            form.reset();
        }
        
        modal.classList.add('show');
        console.log(`✅ Modal opened successfully: ${type}Modal`);
    }
    
    // Start the search
    findModalElements();
}

// Emergency function to create education modal dynamically
function createEducationModalDynamically() {
    console.log(`🔧 Creating educationModal dynamically...`);
    
    const modalHTML = `
    <!-- Education Modal (Dynamically Created) -->
    <div class="modal-overlay" id="educationModal">
        <div class="modal-content">
            <div class="modal-header">
                <h3>Eğitim Bilgisi Ekle/Düzenle</h3>
                <button class="modal-close" id="closeEducationModal">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <form class="modal-form" id="educationForm">
                <div class="form-group">
                    <label>Düzey</label>
                    <select name="level" required>
                        <option value="">Seçiniz</option>
                        <option value="Lise">Lise</option>
                        <option value="Lisans">Lisans</option>
                        <option value="Yüksek Lisans">Yüksek Lisans</option>
                        <option value="Doktora">Doktora</option>
                        <option value="Yan Dal">Yan Dal</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Kurum</label>
                    <input type="text" name="institution" required>
                </div>
                <div class="form-group">
                    <label>Birim/Bölüm</label>
                    <input type="text" name="department" placeholder="ör: Fizik, Bilgisayar Mühendisliği">
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Başlangıç Yılı</label>
                        <input type="number" name="startYear" min="1950" max="2030" required>
                    </div>
                    <div class="form-group">
                        <label>Bitiş Yılı</label>
                        <input type="number" name="endYear" min="1950" max="2030">
                    </div>
                </div>
                <div class="modal-actions">
                    <button type="button" class="btn-cancel" id="cancelEducation">İptal</button>
                    <button type="submit" class="btn-save">Kaydet</button>
                </div>
            </form>
        </div>
    </div>`;
    
    // Insert the modal at the end of body
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Set up event listeners for the dynamically created modal
    const closeBtn = document.getElementById('closeEducationModal');
    const cancelBtn = document.getElementById('cancelEducation');
    const form = document.getElementById('educationForm');
    
    if (closeBtn) {
        closeBtn.addEventListener('click', () => closeModal('education'));
    }
    
    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => closeModal('education'));
    }
    
    // Form submit event listener - EN ÖNEMLİSİ!
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            console.log('📝 Dynamic modal form submitted!');
            saveEducationItem(this);
        });
    }
    
    console.log(`✅ Dynamic educationModal created successfully with all event listeners`);
}

// Emergency function to create work area modal dynamically
function createWorkAreaModalDynamically() {
    console.log(`🔧 Creating workAreaModal dynamically...`);
    
    const modalHTML = `
    <!-- Work Area Modal (Dynamically Created) -->
    <div class="modal-overlay" id="workAreaModal">
        <div class="modal-content">
            <div class="modal-header">
                <h3>Çalışma Alanı Ekle/Düzenle</h3>
                <button class="modal-close" id="closeWorkAreaModal">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <form class="modal-form" id="workAreaForm">
                <div class="form-group">
                    <label>Çalışma Alanı Adı</label>
                    <input type="text" name="areaName" required>
                </div>
                <div class="modal-actions">
                    <button type="button" class="btn-cancel" id="cancelWorkArea">İptal</button>
                    <button type="submit" class="btn-save">Kaydet</button>
                </div>
            </form>
        </div>
    </div>`;
    
    // Insert the modal at the end of body
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Set up event listeners for the dynamically created modal
    const closeBtn = document.getElementById('closeWorkAreaModal');
    const cancelBtn = document.getElementById('cancelWorkArea');
    const form = document.getElementById('workAreaForm');
    
    if (closeBtn) {
        closeBtn.addEventListener('click', () => closeModal('workArea'));
    }
    
    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => closeModal('workArea'));
    }
    
    // Form submit event listener
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            console.log('📝 Dynamic workArea modal form submitted!');
            handleWorkAreaSubmit(e);
        });
    }
    
    console.log(`✅ Dynamic workAreaModal created successfully with all event listeners`);
}

// Emergency function to create interest area modal dynamically
function createInterestAreaModalDynamically() {
    console.log(`🔧 Creating interestAreaModal dynamically...`);
    
    const modalHTML = `
    <!-- Interest Area Modal (Dynamically Created) -->
    <div class="modal-overlay" id="interestAreaModal">
        <div class="modal-content">
            <div class="modal-header">
                <h3>İlgi Alanı Ekle/Düzenle</h3>
                <button class="modal-close" id="closeInterestAreaModal">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <form class="modal-form" id="interestAreaForm">
                <div class="form-group">
                    <label>İlgi Alanı Adı</label>
                    <input type="text" name="areaName" required>
                </div>
                <div class="modal-actions">
                    <button type="button" class="btn-cancel" id="cancelInterestArea">İptal</button>
                    <button type="submit" class="btn-save">Kaydet</button>
                </div>
            </form>
        </div>
    </div>`;
    
    // Insert the modal at the end of body
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Set up event listeners for the dynamically created modal
    const closeBtn = document.getElementById('closeInterestAreaModal');
    const cancelBtn = document.getElementById('cancelInterestArea');
    const form = document.getElementById('interestAreaForm');
    
    if (closeBtn) {
        closeBtn.addEventListener('click', () => closeModal('interestArea'));
    }
    
    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => closeModal('interestArea'));
    }
    
    // Form submit event listener
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            console.log('📝 Dynamic interestArea modal form submitted!');
            handleInterestAreaSubmit(e);
        });
    }
    
    console.log(`✅ Dynamic interestAreaModal created successfully with all event listeners`);
}

function closeModal(type) {
    const modal = document.getElementById(type + 'Modal');
    modal.classList.remove('show');
    currentEditItem = null;
    currentEditType = null;
}

function fillForm(form, data) {
    const inputs = form.querySelectorAll('input, select');
    inputs.forEach(input => {
        if (data[input.name]) {
            input.value = data[input.name];
        }
    });
}

// Modal close events
document.getElementById('closeEducationModal')?.addEventListener('click', () => closeModal('education'));
document.getElementById('closeThesisModal')?.addEventListener('click', () => closeModal('thesis'));
document.getElementById('closeLanguageModal')?.addEventListener('click', () => closeModal('language'));
document.getElementById('closeWorkAreaModal')?.addEventListener('click', () => closeModal('workArea'));
document.getElementById('closeInterestAreaModal')?.addEventListener('click', () => closeModal('interestArea'));
document.getElementById('closeAddressModal')?.addEventListener('click', () => closeModal('address'));
document.getElementById('closeEmailModal')?.addEventListener('click', () => closeModal('email'));
document.getElementById('closePhoneModal')?.addEventListener('click', () => closeModal('phone'));
document.getElementById('closeLinkModal')?.addEventListener('click', () => closeModal('link'));

document.getElementById('cancelEducation')?.addEventListener('click', () => closeModal('education'));
document.getElementById('cancelThesis')?.addEventListener('click', () => closeModal('thesis'));
document.getElementById('cancelLanguage')?.addEventListener('click', () => closeModal('language'));
document.getElementById('cancelWorkArea')?.addEventListener('click', () => closeModal('workArea'));
document.getElementById('cancelInterestArea')?.addEventListener('click', () => closeModal('interestArea'));
document.getElementById('cancelAddress')?.addEventListener('click', () => closeModal('address'));
document.getElementById('cancelEmail')?.addEventListener('click', () => closeModal('email'));
document.getElementById('cancelPhone')?.addEventListener('click', () => closeModal('phone'));
document.getElementById('cancelLink')?.addEventListener('click', () => closeModal('link'));

// Form submissions
document.getElementById('educationForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    saveEducationItem(this);
});

document.getElementById('thesisForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    saveThesisItem(this);
});

document.getElementById('languageForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    saveLanguageItem(this);
});

document.getElementById('workAreaForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    handleWorkAreaSubmit(e);
});

document.getElementById('interestAreaForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    handleInterestAreaSubmit(e);
});

document.getElementById('addressForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    handleAddressSubmit(e);
});

document.getElementById('emailForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    handleEmailSubmit(e);
});

document.getElementById('phoneForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    handlePhoneSubmit(e);
});

document.getElementById('linkForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    handleLinkSubmit(e);
});

function saveEducationItem(form) {
    const formData = new FormData(form);
    const item = {
        id: currentEditItem ? currentEditItem.id : Date.now(),
        level: formData.get('level'),
        institution: formData.get('institution'),
        department: formData.get('department') || '', // Yeni birim field'ı
        startYear: formData.get('startYear'),
        endYear: formData.get('endYear') || 'Devam ediyor'
    };

    if (currentEditItem) {
        const index = educationData.education.findIndex(e => e.id === currentEditItem.id);
        educationData.education[index] = item;
    } else {
        educationData.education.push(item);
    }

    renderEducationItems();
    closeModal('education');
    saveEducationData(); // Save to localStorage
    
    // Eğitim sekmesini aç
    switchSection('education');
}

function saveThesisItem(form) {
    const formData = new FormData(form);
    const item = {
        id: currentEditItem ? currentEditItem.id : Date.now(),
        level: formData.get('level'),
        title: formData.get('title'),
        year: formData.get('year')
    };

    if (currentEditItem) {
        const index = educationData.thesis.findIndex(t => t.id === currentEditItem.id);
        educationData.thesis[index] = item;
    } else {
        educationData.thesis.push(item);
    }

    renderThesisItems();
    closeModal('thesis');
    saveEducationData(); // Save to localStorage
}

function saveLanguageItem(form) {
    const formData = new FormData(form);
    const item = {
        id: currentEditItem ? currentEditItem.id : Date.now(),
        language: formData.get('language'),
        level: formData.get('level')
    };

    if (currentEditItem) {
        const index = educationData.languages.findIndex(l => l.id === currentEditItem.id);
        educationData.languages[index] = item;
    } else {
        educationData.languages.push(item);
    }

    renderLanguageItems();
    closeModal('language');
    saveEducationData(); // Save to localStorage
}

function deleteItem(type, id) {
    // No confirmation needed for better UX
    
    // Handle different type names
    let dataKey = type;
    if (type === 'workArea') dataKey = 'workAreas';
    if (type === 'interestArea') dataKey = 'interestAreas';
    
    educationData[dataKey] = educationData[dataKey].filter(item => item.id !== id);
    
    // Re-render the appropriate list
    if (type === 'education') renderEducationItems();
    else if (type === 'thesis') renderThesisItems();
    else if (type === 'languages') renderLanguageItems();
    else if (type === 'workArea') {
        renderWorkAreaItems();
        // If in research edit mode, show delete buttons after re-render
        if (researchEditMode) {
            setTimeout(() => {
                const deleteButtons = document.querySelectorAll('#workAreaItems .delete-btn');
                deleteButtons.forEach(btn => btn.style.display = 'block');
            }, 10);
        }
    }
    else if (type === 'interestArea') {
        renderInterestAreaItems();
        // If in research edit mode, show delete buttons after re-render
        if (researchEditMode) {
            setTimeout(() => {
                const deleteButtons = document.querySelectorAll('#interestAreaItems .delete-btn');
                deleteButtons.forEach(btn => btn.style.display = 'block');
            }, 10);
        }
    }
    
    saveEducationData(); // Save to localStorage after deletion
}

function renderEducationItems() {
    const container = document.getElementById('educationItems');
    container.innerHTML = '';

    educationData.education.forEach(item => {
        const div = document.createElement('div');
        div.className = 'education-item';
        
        // Birim bilgisi varsa göster
        const departmentInfo = item.department ? `<p class="department">${item.department}</p>` : '';
        
        div.innerHTML = `
            <button class="delete-btn" onclick="deleteItem('education', ${item.id})">
                <i class="fas fa-times"></i>
            </button>
            <h4>${item.level}</h4>
            <p><strong>${item.institution}</strong></p>
            ${departmentInfo}
            <p class="year">${item.startYear} - ${item.endYear}</p>
        `;
        
        // Edit modal removed for better UX
        
        container.appendChild(div);
    });

    if (educationData.education.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #666; font-style: italic;">Henüz eğitim bilgisi eklenmemiş.</p>';
    }
}

function renderThesisItems() {
    const container = document.getElementById('thesisItems');
    container.innerHTML = '';

    educationData.thesis.forEach(item => {
        const div = document.createElement('div');
        div.className = 'education-item';
        div.innerHTML = `
            <button class="delete-btn" onclick="deleteItem('thesis', ${item.id})">
                <i class="fas fa-times"></i>
            </button>
            <h4>${item.level} Tezi</h4>
            <p><strong>${item.title}</strong></p>
            <p class="year">${item.year}</p>
        `;
        
        // Edit modal removed for better UX
        
        container.appendChild(div);
    });

    if (educationData.thesis.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #666; font-style: italic;">Henüz tez bilgisi eklenmemiş.</p>';
    }
}

function renderLanguageItems() {
    const container = document.getElementById('languageItems');
    container.innerHTML = '';

    educationData.languages.forEach(item => {
        const div = document.createElement('div');
        div.className = 'education-item';
        div.innerHTML = `
            <button class="delete-btn" onclick="deleteItem('languages', ${item.id})">
                <i class="fas fa-times"></i>
            </button>
            <h4>${item.language}</h4>
            <p class="year">Düzey: ${item.level}</p>
        `;
        
        // Edit modal removed for better UX
        
        container.appendChild(div);
    });

    if (educationData.languages.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #666; font-style: italic;">Henüz yabancı dil bilgisi eklenmemiş.</p>';
    }
}

// Close modals when clicking outside
document.addEventListener('click', function(e) {
    const modals = document.querySelectorAll('.modal-overlay.show');
    modals.forEach(modal => {
        if (e.target === modal) {
            const modalType = modal.id.replace('Modal', '');
            closeModal(modalType);
        }
    });
});

// Global function for delete buttons (since they use onclick)
window.deleteItem = deleteItem;

// Research Areas System
function initResearchSystem() {
    
    const researchEditBtn = document.getElementById('researchEditBtn');
    const addWorkAreaBtn = document.getElementById('addWorkAreaBtn');
    const addInterestAreaBtn = document.getElementById('addInterestAreaBtn');
    
    
    // Load existing data from educationData (unified system)
    loadEducationItems();
    
    // Initially hide add buttons (make sure they start hidden)
    if (addWorkAreaBtn) addWorkAreaBtn.classList.remove('show');
    if (addInterestAreaBtn) addInterestAreaBtn.classList.remove('show');
    
    // Hide any existing delete buttons
    const deleteButtons = document.querySelectorAll('#workAreaItems .delete-btn, #interestAreaItems .delete-btn');
    deleteButtons.forEach(btn => btn.style.display = 'none');
    
    // Ensure research edit mode is false
    researchEditMode = false;
    
    if (researchEditBtn) {
        // Remove any existing event listeners by cloning the button
        const newBtn = researchEditBtn.cloneNode(true);
        newBtn.id = 'researchEditBtn'; // Ensure ID is preserved
        researchEditBtn.parentNode.replaceChild(newBtn, researchEditBtn);
        
        // Add our event listener to the new button
        newBtn.addEventListener('click', toggleResearchEditMode);
    } else {
    }
    
    if (addWorkAreaBtn) {
        addWorkAreaBtn.addEventListener('click', () => openModal('workArea'));
    }
    
    if (addInterestAreaBtn) {
        addInterestAreaBtn.addEventListener('click', () => openModal('interestArea'));
    }
}

function toggleResearchEditMode() {
    
    const editBtn = document.getElementById('researchEditBtn');
    const addButtons = document.querySelectorAll('#addWorkAreaBtn, #addInterestAreaBtn');
    
    
    if (!editBtn) {
        return;
    }
    
    const isEditMode = editBtn.textContent.trim().includes('Kaydet');
    
    if (isEditMode) {
        // Exit edit mode - save data
        editBtn.innerHTML = '<i class="fas fa-edit"></i> Düzenle';
        editBtn.style.background = '#8b5cf6';
        
        // Hide add buttons
        addButtons.forEach(btn => {
            btn.classList.remove('show');
        });
        
        // Hide delete buttons
        const deleteButtons = document.querySelectorAll('#workAreaItems .delete-btn, #interestAreaItems .delete-btn');
        deleteButtons.forEach(btn => {
            btn.style.display = 'none';
        });
        
        // Update research edit mode
        researchEditMode = false;
        
        saveEducationData(); // Save to localStorage
        console.log('� Research data saved to localStorage');
    } else {
        // Enter edit mode
        editBtn.innerHTML = '<i class="fas fa-save"></i> Kaydet';
        editBtn.style.background = '#28a745';
        
        // Update research edit mode first
        researchEditMode = true;
        
        // Show add buttons with CSS class instead of inline style
        addButtons.forEach(btn => {
            btn.classList.add('show');
            console.log('👀 Showing add button:', btn.id, 'Classes:', btn.className);
        });
        
        // Show delete buttons (query them again since they might have been created after render)
        const deleteButtons = document.querySelectorAll('#workAreaItems .delete-btn, #interestAreaItems .delete-btn');
        deleteButtons.forEach(btn => {
            btn.style.display = 'block';
            console.log('👀 Showing delete button');
        });
        
        // Update global edit mode
        editMode = true;
    }
}

function handleWorkAreaSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const item = {
        id: currentEditItem ? currentEditItem.id : Date.now(),
        name: formData.get('areaName')
    };
    
    if (currentEditItem) {
        const index = educationData.workAreas.findIndex(w => w.id === currentEditItem.id);
        educationData.workAreas[index] = item;
    } else {
        educationData.workAreas.push(item);
    }
    
    renderWorkAreaItems();
    
    // If in edit mode, show delete buttons for newly rendered items
    if (researchEditMode) {
        const deleteButtons = document.querySelectorAll('#workAreaItems .delete-btn');
        deleteButtons.forEach(btn => btn.style.display = 'block');
    }
    
    closeModal('workArea');
    saveEducationData(); // Save to localStorage
    
    // Eğitim sekmesini aç
    switchSection('education');
}

function handleInterestAreaSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const item = {
        id: currentEditItem ? currentEditItem.id : Date.now(),
        name: formData.get('areaName')
    };
    
    if (currentEditItem) {
        const index = educationData.interestAreas.findIndex(i => i.id === currentEditItem.id);
        educationData.interestAreas[index] = item;
    } else {
        educationData.interestAreas.push(item);
    }
    
    renderInterestAreaItems();
    
    // If in edit mode, show delete buttons for newly rendered items
    if (researchEditMode) {
        const deleteButtons = document.querySelectorAll('#interestAreaItems .delete-btn');
        deleteButtons.forEach(btn => btn.style.display = 'block');
    }
    
    closeModal('interestArea');
    saveEducationData(); // Save to localStorage
    
    // Eğitim sekmesini aç
    switchSection('education');
}

// Render functions for work areas and interest areas
function renderWorkAreaItems() {
    const container = document.getElementById('workAreaItems');
    container.innerHTML = ''; // Clear all existing content including placeholder

    educationData.workAreas.forEach(item => {
        const div = document.createElement('div');
        div.className = 'research-item';
        div.innerHTML = `
            <button class="delete-btn" onclick="event.stopPropagation(); deleteItem('workArea', ${item.id})" style="display: none;">
                <i class="fas fa-times"></i>
            </button>
            <span>${item.name}</span>
        `;
        
        div.addEventListener('click', function() {
            if (researchEditMode) {
                openModal('workArea', item);
            }
        });
        
        container.appendChild(div);
    });

    // Only add placeholder if no items exist
    if (educationData.workAreas.length === 0) {
        const placeholderElement = document.createElement('p');
        placeholderElement.className = 'placeholder-text';
        placeholderElement.style.cssText = 'text-align: center; color: #666; font-style: italic;';
        placeholderElement.textContent = 'Henüz çalışma alanı eklenmemiş.';
        container.appendChild(placeholderElement);
    }
}

function renderInterestAreaItems() {
    const container = document.getElementById('interestAreaItems');
    container.innerHTML = ''; // Clear all existing content including placeholder

    educationData.interestAreas.forEach(item => {
        const div = document.createElement('div');
        div.className = 'research-item';
        div.innerHTML = `
            <button class="delete-btn" onclick="event.stopPropagation(); deleteItem('interestArea', ${item.id})" style="display: none;">
                <i class="fas fa-times"></i>
            </button>
            <span>${item.name}</span>
        `;
        
        div.addEventListener('click', function() {
            if (researchEditMode) {
                openModal('interestArea', item);
            }
        });
        
        container.appendChild(div);
    });

    // Only add placeholder if no items exist
    if (educationData.interestAreas.length === 0) {
        const placeholderElement = document.createElement('p');
        placeholderElement.className = 'placeholder-text';
        placeholderElement.style.cssText = 'text-align: center; color: #666; font-style: italic;';
        placeholderElement.textContent = 'Henüz ilgi alanı eklenmemiş.';
        container.appendChild(placeholderElement);
    }
}

// Load and render all education items when page loads
function loadEducationItems() {
    renderEducationItems();
    renderThesisItems();
    renderLanguageItems();
    renderWorkAreaItems();
    renderInterestAreaItems();
}

// Contact System
function initContactSystem() {
    const contactEditBtn = document.getElementById('contactEditBtn');
    const addAddressBtn = document.getElementById('addAddressBtn');
    const addEmailBtn = document.getElementById('addEmailBtn');
    const addPhoneBtn = document.getElementById('addPhoneBtn');
    const addLinkBtn = document.getElementById('addLinkBtn');
    
    // Load existing data
    loadContactData();
    
    if (contactEditBtn) {
        contactEditBtn.addEventListener('click', toggleContactEditMode);
    }
    
    if (addAddressBtn) {
        addAddressBtn.addEventListener('click', () => openModal('address'));
    }
    
    if (addEmailBtn) {
        addEmailBtn.addEventListener('click', () => openModal('email'));
    }
    
    if (addPhoneBtn) {
        addPhoneBtn.addEventListener('click', () => openModal('phone'));
    }
    
    if (addLinkBtn) {
        addLinkBtn.addEventListener('click', () => openModal('link'));
    }
}

function toggleContactEditMode() {
    const editBtn = document.getElementById('contactEditBtn');
    const addButtons = document.querySelectorAll('#addAddressBtn, #addEmailBtn, #addPhoneBtn, #addLinkBtn');
    const deleteButtons = document.querySelectorAll('#addressItems .delete-btn, #emailItems .delete-btn, #phoneItems .delete-btn, #linkItems .delete-btn');
    
    const isEditMode = editBtn.textContent.trim() === 'Kaydet';
    
    if (isEditMode) {
        // Exit edit mode
        editBtn.innerHTML = '<i class="fas fa-edit"></i> Düzenle';
        addButtons.forEach(btn => btn.style.display = 'none');
        deleteButtons.forEach(btn => btn.style.display = 'none');
    } else {
        // Enter edit mode
        editBtn.innerHTML = '<i class="fas fa-save"></i> Kaydet';
        addButtons.forEach(btn => btn.style.display = 'flex');
        deleteButtons.forEach(btn => btn.style.display = 'block');
    }
}

function handleAddressSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const addressData = {
        id: Date.now(),
        type: formData.get('type') || '',
        address: formData.get('address') || ''
    };
    
    if (addressData.address.trim()) {
        saveAddressData(addressData);
        closeModal('address');
        loadContactData();
    }
}

function handleEmailSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const emailData = {
        id: Date.now(),
        type: formData.get('type') || '',
        email: formData.get('email') || ''
    };
    
    if (emailData.email.trim()) {
        saveEmailData(emailData);
        closeModal('email');
        loadContactData();
    }
}

function handlePhoneSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const phoneData = {
        id: Date.now(),
        type: formData.get('type') || '',
        phone: formData.get('phone') || ''
    };
    
    if (phoneData.phone.trim()) {
        savePhoneData(phoneData);
        closeModal('phone');
        loadContactData();
    }
}

function handleLinkSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const linkData = {
        id: Date.now(),
        type: formData.get('type') || '',
        title: formData.get('title') || '',
        url: formData.get('url') || ''
    };
    
    if (linkData.url.trim()) {
        saveLinkData(linkData);
        closeModal('link');
        loadContactData();
    }
}

function saveAddressData(data) {
    let addresses = JSON.parse(localStorage.getItem('addresses')) || [];
    addresses.push(data);
    localStorage.setItem('addresses', JSON.stringify(addresses));
}

function saveEmailData(data) {
    let emails = JSON.parse(localStorage.getItem('emails')) || [];
    emails.push(data);
    localStorage.setItem('emails', JSON.stringify(emails));
}

function savePhoneData(data) {
    let phones = JSON.parse(localStorage.getItem('phones')) || [];
    phones.push(data);
    localStorage.setItem('phones', JSON.stringify(phones));
}

function saveLinkData(data) {
    let links = JSON.parse(localStorage.getItem('links')) || [];
    links.push(data);
    localStorage.setItem('links', JSON.stringify(links));
}

function loadContactData() {
    loadAddresses();
    loadEmails();
    loadPhones();
    loadLinks();
}

function loadAddresses() {
    const addresses = JSON.parse(localStorage.getItem('addresses')) || [];
    const container = document.getElementById('addressItems');
    
    if (container) {
        container.innerHTML = '';
        addresses.forEach(address => {
            const addressElement = createContactElement(address, 'address');
            container.appendChild(addressElement);
        });
    }
}

function loadEmails() {
    const emails = JSON.parse(localStorage.getItem('emails')) || [];
    const container = document.getElementById('emailItems');
    
    if (container) {
        container.innerHTML = '';
        emails.forEach(email => {
            const emailElement = createContactElement(email, 'email');
            container.appendChild(emailElement);
        });
    }
}

function loadPhones() {
    const phones = JSON.parse(localStorage.getItem('phones')) || [];
    const container = document.getElementById('phoneItems');
    
    if (container) {
        container.innerHTML = '';
        phones.forEach(phone => {
            const phoneElement = createContactElement(phone, 'phone');
            container.appendChild(phoneElement);
        });
    }
}

function loadLinks() {
    const links = JSON.parse(localStorage.getItem('links')) || [];
    const container = document.getElementById('linkItems');
    
    if (container) {
        container.innerHTML = '';
        
        // Load profile links first (LinkedIn, WoS, Scopus, ORCID)
        const profileData = JSON.parse(localStorage.getItem('profileData')) || {};
        const profileLinks = [
            { type: 'LinkedIn', url: profileData.linkedinLink, title: 'LinkedIn Profili' },
            { type: 'Web of Science', url: profileData.wosLink, title: 'Web of Science' },
            { type: 'Scopus', url: profileData.scopusLink, title: 'Scopus Profili' },
            { type: 'ORCID', url: profileData.orcidLink, title: 'ORCID' }
        ];
        
        profileLinks.forEach(link => {
            if (link.url && link.url.trim()) {
                const linkElement = createContactElement({
                    id: `profile_${link.type.toLowerCase().replace(/\s+/g, '_')}`,
                    type: link.type,
                    title: link.title,
                    url: link.url,
                    isProfileLink: true
                }, 'link');
                container.appendChild(linkElement);
            }
        });
        
        // Then load manually added links
        links.forEach(link => {
            const linkElement = createContactElement(link, 'link');
            container.appendChild(linkElement);
        });
    }
}

function createContactElement(item, type) {
    const div = document.createElement('div');
    div.className = 'contact-item';
    
    let content = '';
    
    switch(type) {
        case 'address':
            content = `
                <div class="contact-info">
                    ${item.type ? `<div class="contact-type">${item.type}</div>` : ''}
                    <div class="contact-value">${item.address}</div>
                </div>
            `;
            break;
        case 'email':
            content = `
                <div class="contact-info">
                    ${item.type ? `<div class="contact-type">${item.type}</div>` : ''}
                    <div class="contact-value">
                        <a href="mailto:${item.email}" style="color: inherit; text-decoration: none;">${item.email}</a>
                    </div>
                </div>
            `;
            break;
        case 'phone':
            content = `
                <div class="contact-info">
                    ${item.type ? `<div class="contact-type">${item.type}</div>` : ''}
                    <div class="contact-value">
                        <a href="tel:${item.phone}" style="color: inherit; text-decoration: none;">${item.phone}</a>
                    </div>
                </div>
            `;
            break;
        case 'link':
            content = `
                <div class="contact-info">
                    ${item.type ? `<div class="contact-type">${item.type}</div>` : ''}
                    ${item.title ? `<div class="contact-title">${item.title}</div>` : ''}
                    <div class="contact-value">
                        <a href="${item.url}" target="_blank" style="color: #3b82f6; text-decoration: none;">${item.url}</a>
                    </div>
                </div>
            `;
            break;
    }
    
    div.innerHTML = `
        ${content}
        ${!item.isProfileLink ? `<button class="delete-btn" onclick="deleteContactItem(${item.id}, '${type}')" style="display: none;">
            <i class="fas fa-trash"></i>
        </button>` : ''}
    `;
    
    return div;
}

function deleteContactItem(id, type) {
    const storageKeys = {
        'address': 'addresses',
        'email': 'emails',
        'phone': 'phones',
        'link': 'links'
    };
    
    const storageKey = storageKeys[type];
    let items = JSON.parse(localStorage.getItem(storageKey)) || [];
    items = items.filter(item => item.id !== id);
    localStorage.setItem(storageKey, JSON.stringify(items));
    loadContactData();
}

// Global function for contact delete buttons
window.deleteContactItem = deleteContactItem;

// 3D Mouse Track Effect for Membership Cards
function initMembershipCardEffects() {
    const membershipCards = document.querySelectorAll('.membership-card');
    
    membershipCards.forEach(card => {
        card.addEventListener('mousemove', function(e) {
            const rect = card.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            
            const mouseX = e.clientX;
            const mouseY = e.clientY;
            
            // Calculate distance from center with smooth interpolation
            const deltaX = (mouseX - centerX) / (rect.width / 2);
            const deltaY = (mouseY - centerY) / (rect.height / 2);
            
            // Calculate rotation angles (max 5 degrees - yarıya indirdik)
            const rotateY = deltaX * 5;
            const rotateX = -deltaY * 5;
            
            // Apply transform with mouse-based rotation
            card.style.transition = 'transform 0.1s ease-out';
            card.style.transform = `
                perspective(1000px)
                rotateY(${rotateY}deg)
                rotateX(${rotateX}deg)
                scale(1.02)
                translateZ(20px)
            `;
        });
        
        card.addEventListener('mouseleave', function() {
            // Reset transform when mouse leaves with smooth transition
            card.style.transition = 'transform 0.4s ease-out';
            card.style.transform = `
                perspective(1000px)
                rotateY(0deg)
                rotateX(0deg)
                scale(1)
                translateZ(0px)
            `;
        });
    });
}

// Initialize membership card effects when membership section is shown
document.addEventListener('DOMContentLoaded', function() {
    // Initialize on page load
    setTimeout(initMembershipCardEffects, 500);
    
    // Re-initialize when switching to membership section
    const membershipNavItem = document.querySelector('[data-section="membership"]');
    if (membershipNavItem) {
        membershipNavItem.addEventListener('click', function() {
            setTimeout(initMembershipCardEffects, 100);
        });
    }
    
    // Initialize profile editing on page load
    setTimeout(initProfileEditing, 100);
    setTimeout(initEducationEditing, 100);
    setTimeout(initResearchEditing, 100);
    setTimeout(initContactEditing, 100);
});

// Profile Editing System
function initProfileEditing() {
    const profileEditBtn = document.getElementById('profileEditBtn');
    if (profileEditBtn) {
        // Önce eski event'leri temizle
        const newBtn = profileEditBtn.cloneNode(true);
        profileEditBtn.parentNode.replaceChild(newBtn, profileEditBtn);
        newBtn.addEventListener('click', function() {
            toggleProfileEditMode();
        });
    }
}

function toggleProfileEditMode() {
    const profileContent = document.querySelector('#profileContent');
    const editBtn = document.getElementById('profileEditBtn');
    const isEditing = profileContent.classList.contains('edit-mode');
    // Tüm content-section'lardaki eski edit butonlarını temizle
    document.querySelectorAll('.content-section .edit-item-btn').forEach(btn => btn.remove());
    if (isEditing) {
        // Exit edit mode
        profileContent.classList.remove('edit-mode');
        editBtn.innerHTML = '<i class="fas fa-edit"></i> Düzenle';
        editBtn.style.background = '#8b5cf6';
        console.log('Profile edit mode: OFF');
    } else {
        // Enter edit mode
        profileContent.classList.add('edit-mode');
        editBtn.innerHTML = '<i class="fas fa-times"></i> Çıkış';
        editBtn.style.background = '#ef4444';
        // Show edit buttons for each section (sadece aktif sekmede)
        addEditButtons();
        console.log('Profile edit mode: ON');
    }
}

function addEditButtons() {
    // Sadece aktif olan content-section içindeki detail-section'lara ekle
    const activeSection = document.querySelector('.content-section.active');
    if (!activeSection) return;
    const detailSections = activeSection.querySelectorAll('.detail-section');
    detailSections.forEach(section => {
        // Remove existing edit button if any
        const existingBtn = section.querySelector('.edit-item-btn');
        if (existingBtn) {
            existingBtn.remove();
        }
        // Create edit button
        const editBtn = document.createElement('button');
        editBtn.className = 'edit-item-btn';
        editBtn.innerHTML = '<i class="fas fa-edit"></i>';
        editBtn.style.position = 'absolute';
        editBtn.style.top = '15px';
        editBtn.style.right = '15px';
        editBtn.style.background = '#3b82f6';
        editBtn.style.color = 'white';
        editBtn.style.border = 'none';
        editBtn.style.borderRadius = '50%';
        editBtn.style.width = '35px';
        editBtn.style.height = '35px';
        editBtn.style.cursor = 'pointer';
        editBtn.style.display = 'flex';
        editBtn.style.alignItems = 'center';
        editBtn.style.justifyContent = 'center';
        editBtn.style.fontSize = '14px';
        editBtn.style.transition = 'all 0.3s ease';
        editBtn.style.zIndex = '10';
        // Make section relative for absolute positioning
        section.style.position = 'relative';
        // Add hover effect
        editBtn.addEventListener('mouseenter', function() {
            this.style.background = '#2563eb';
            this.style.transform = 'scale(1.1)';
        });
        editBtn.addEventListener('mouseleave', function() {
            this.style.background = '#3b82f6';
            this.style.transform = 'scale(1)';
        });
        // Add click handler
        editBtn.addEventListener('click', function() {
            const sectionTitle = section.querySelector('.detail-title').textContent.trim();
            console.log(`Editing section: ${sectionTitle}`);
            openEditModal(section, sectionTitle);
        });
        section.appendChild(editBtn);
    });
}

// Education Editing System
function initEducationEditing() {
    // Load existing education data and render
    loadEducationItems();
    
    const educationEditBtn = document.getElementById('educationEditBtn');
    if (educationEditBtn) {
        // Önce eski event'leri temizle
        const newBtn = educationEditBtn.cloneNode(true);
        educationEditBtn.parentNode.replaceChild(newBtn, educationEditBtn);
        
        // Use original education edit system
        newBtn.addEventListener('click', function() {
            console.log('🎓 Education edit button clicked');
            editMode = !editMode;
            toggleEducationEditMode();
        });
        
    } else {
        console.warn('⚠️ Education edit button not found');
    }
    
    // Add button event listeners da burada ekle
    const addEducationBtn = document.getElementById('addEducationBtn');
    const addThesisBtn = document.getElementById('addThesisBtn');
    const addLanguageBtn = document.getElementById('addLanguageBtn');
    const addWorkAreaBtn = document.getElementById('addWorkAreaBtn');
    const addInterestAreaBtn = document.getElementById('addInterestAreaBtn');

    if (addEducationBtn && !addEducationBtn.hasEventListener) {
        addEducationBtn.hasEventListener = true;
        addEducationBtn.addEventListener('click', () => {
            console.log('➕ Add education clicked');
            openModal('education');
        });
    }
    if (addThesisBtn && !addThesisBtn.hasEventListener) {
        addThesisBtn.hasEventListener = true;
        addThesisBtn.addEventListener('click', () => {
            console.log('➕ Add thesis clicked');
            openModal('thesis');
        });
    }
    if (addLanguageBtn && !addLanguageBtn.hasEventListener) {
        addLanguageBtn.hasEventListener = true;
        addLanguageBtn.addEventListener('click', () => {
            console.log('➕ Add language clicked');
            openModal('language');
        });
    }
    if (addWorkAreaBtn && !addWorkAreaBtn.hasEventListener) {
        addWorkAreaBtn.hasEventListener = true;
        addWorkAreaBtn.addEventListener('click', () => {
            console.log('➕ Add work area clicked');
            openModal('workArea');
        });
    }
    if (addInterestAreaBtn && !addInterestAreaBtn.hasEventListener) {
        addInterestAreaBtn.hasEventListener = true;
        addInterestAreaBtn.addEventListener('click', () => {
            console.log('➕ Add interest area clicked');
            openModal('interestArea');
        });
    }
}

// Research Editing System
function initResearchEditing() {
    const researchEditBtn = document.getElementById('researchEditBtn');
    if (researchEditBtn) {
        // Önce eski event'leri temizle
        const newBtn = researchEditBtn.cloneNode(true);
        researchEditBtn.parentNode.replaceChild(newBtn, researchEditBtn);
        newBtn.addEventListener('click', function() {
            toggleEditMode('research');
        });
    }
}

// Contact Editing System
function initContactEditing() {
    const contactEditBtn = document.getElementById('contactEditBtn');
    if (contactEditBtn) {
        // Önce eski event'leri temizle
        const newBtn = contactEditBtn.cloneNode(true);
        contactEditBtn.parentNode.replaceChild(newBtn, contactEditBtn);
        newBtn.addEventListener('click', function() {
            toggleEditMode('contact');
        });
    }
}

// Genel edit mode toggle fonksiyonu
function toggleEditMode(sectionType) {
    const contentSection = document.querySelector(`#${sectionType}Content`);
    const editBtn = document.getElementById(`${sectionType}EditBtn`);
    const isEditing = contentSection.classList.contains('edit-mode');
    
    // Tüm content-section'lardaki eski edit butonlarını temizle
    document.querySelectorAll('.content-section .edit-item-btn').forEach(btn => btn.remove());
    
    if (isEditing) {
        // Exit edit mode
        contentSection.classList.remove('edit-mode');
        editBtn.innerHTML = '<i class="fas fa-edit"></i> Düzenle';
        editBtn.style.background = '#8b5cf6';
        
        // + ve - butonlarını gizle
        console.log(`${sectionType} edit mode: OFF`);
    } else {
        // Enter edit mode
        contentSection.classList.add('edit-mode');
        editBtn.innerHTML = '<i class="fas fa-times"></i> Çıkış';
        editBtn.style.background = '#ef4444';
        
        // Show edit buttons for each section (sadece aktif sekmede)
        addEditButtons();
        
        console.log(`${sectionType} edit mode: ON`);
    }
}

// Modal işlevleri
let currentEditingSection = null;

function openEditModal(section, sectionTitle) {
    const modal = document.getElementById('editModal');
    const modalTitle = document.getElementById('modalTitle');
    const editContent = document.getElementById('editContent');
    
    // Mevcut içeriği al
    const contentElement = section.querySelector('.detail-content, .contact-info, .education-items, .research-items');
    let currentContent = '';
    
    if (contentElement) {
        // Paragraph içeriğini al
        const paragraphs = contentElement.querySelectorAll('p');
        if (paragraphs.length > 0) {
            currentContent = Array.from(paragraphs).map(p => p.textContent).join('\n\n');
        } else {
            currentContent = contentElement.textContent.trim();
        }
    }
    
    currentEditingSection = section;
    modalTitle.textContent = sectionTitle + ' Düzenle';
    editContent.value = currentContent;
    modal.classList.add('show');
    editContent.focus();
}

function closeEditModal() {
    const modal = document.getElementById('editModal');
   
    modal.classList.remove('show');
    currentEditingSection = null;
}

function saveEditContent() {
    if (!currentEditingSection) return;
    
    const editContent = document.getElementById('editContent');
    const newContent = editContent.value.trim();
    
    if (newContent === '') {
        alert('İçerik boş olamaz!');
        return;
    }
    
    // İçeriği güncelle
    const contentElement = currentEditingSection.querySelector('.detail-content, .contact-info, .education-items, .research-items');
    if (contentElement) {
        // Paragraf olarak böl ve HTML'e çevir
        const paragraphs = newContent.split('\n\n').filter(p => p.trim() !== '');
        const htmlContent = paragraphs.map(p => `<p>${p.trim()}</p>`).join('');
        contentElement.innerHTML = htmlContent;
    }
    
    closeEditModal();
    
    // Başarı mesajı
    console.log('İçerik başarıyla güncellendi!');
    
    // İsteğe bağlı: Görsel geri bildirim
    const successMessage = document.createElement('div');
    successMessage.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #10b981;
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        z-index: 1001;
        animation: slideInRight 0.3s ease-out;
    `;
    successMessage.textContent = 'İçerik başarıyla güncellendi!';
    document.body.appendChild(successMessage);
    
    setTimeout(() => {
        successMessage.remove();
    }, 3000);
}

// Modal event listeners
document.addEventListener('DOMContentLoaded', function() {
    const modal = document.getElementById('editModal');
    const closeBtn = document.getElementById('closeModalBtn');
    const cancelBtn = document.getElementById('cancelBtn');
    const saveBtn = document.getElementById('saveBtn');
    
    // Kapama butonları
    closeBtn.addEventListener('click', closeEditModal);
    cancelBtn.addEventListener('click', closeEditModal);
    
    // Kaydet butonu
    saveBtn.addEventListener('click', saveEditContent);
    
    // Modal dışına tıklama ile kapama
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeEditModal();
        }
    });
    
    // Özel form modal event listeners
    const customModal = document.getElementById('customFormModal');
    const customCloseBtn = document.getElementById('closeCustomModalBtn');
    const customCancelBtn = document.getElementById('customCancelBtn');
    const customSaveBtn = document.getElementById('customSaveBtn');
    
    // Kapama butonları
    customCloseBtn.addEventListener('click', closeCustomFormModal);
    customCancelBtn.addEventListener('click', closeCustomFormModal);
    
    // Kaydet butonu
    customSaveBtn.addEventListener('click', saveCustomFormData);
    
    // Modal dışına tıklama ile kapama
    customModal.addEventListener('click', function(e) {
        if (e.target === customModal) {
            closeCustomFormModal();
        }
    });
    
    // ESC tuşu ile kapama
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            if (modal.classList.contains('show')) {
                closeEditModal();
            }
            if (customModal.classList.contains('show')) {
                closeCustomFormModal();
            }
        }
    });
});

// + ve - butonlarını gösterme/gizleme fonksiyonları
function addPlusButton(titleElement, sectionType) {
    // Zaten varsa ekleme
    if (titleElement.querySelector('.add-btn')) return;
    
    const addBtn = document.createElement('button');
    addBtn.className = 'add-btn';
    addBtn.innerHTML = '<i class="fas fa-plus"></i>';
    addBtn.style.cssText = `
        background: #10b981;
        color: white;
        border: none;
        border-radius: 50%;
        width: 25px;
        height: 25px;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        font-size: 10px;
        margin-left: 8px;
        transition: all 0.3s ease;
        position: relative;
        top: -2px;
    `;
    
    addBtn.addEventListener('mouseenter', function() {
        this.style.background = '#059669';
        this.style.transform = 'scale(1.1)';
    });
    
    addBtn.addEventListener('mouseleave', function() {
        this.style.background = '#10b981';
        this.style.transform = 'scale(1)';
    });
    
    addBtn.addEventListener('click', function() {
        addNewItem(titleElement, sectionType);
    });
    
    titleElement.appendChild(addBtn);
}

function hideAddRemoveButtons(contentSection) {
    // Tüm + ve - butonlarını kaldır
    const addButtons = contentSection.querySelectorAll('.add-btn');
    const removeButtons = contentSection.querySelectorAll('.remove-btn');
    
    addButtons.forEach(btn => btn.remove());
    removeButtons.forEach(btn => btn.remove());
    
    // Relative positioning'i geri al (group remove butonları için)
    const groupElements = contentSection.querySelectorAll('[style*="position: relative"]');
    groupElements.forEach(element => {
        if (element.style.position === 'relative') {
            element.style.position = '';
        }
    });
}

function showAddRemoveButtons(contentSection, sectionType) {
    // + butonlarını göster
    contentSection.querySelectorAll('.section-title, .detail-title').forEach(title => {
        addPlusButton(title, sectionType);
    });
    
    // Work areas ve interest areas için özel handling
    if (sectionType === 'education') {
        // Education section için sadece belirli container'larda - butonları göster
        const workAreaContainer = contentSection.querySelector('#workAreaItems');
        const interestAreaContainer = contentSection.querySelector('#interestAreaItems');
        
        if (workAreaContainer) {
            // Her bir work area item için bir - butonu ekle (placeholder hariç)
            workAreaContainer.querySelectorAll('.research-item').forEach(item => {
                if (!item.querySelector('.remove-btn')) {
                    addRemoveButtonToItem(item);
                }
            });
        }
        
        if (interestAreaContainer) {
            // Her bir interest area item için bir - butonu ekle (placeholder hariç)
            interestAreaContainer.querySelectorAll('.research-item').forEach(item => {
                if (!item.querySelector('.remove-btn')) {
                    addRemoveButtonToItem(item);
                }
            });
        }
        
        return; // Education section için erken çık
    }
    
    // Mevcut öğelere - butonları ekle, ancak başlık gruplarını ve yer tutucu metinleri hariç tut
    const items = contentSection.querySelectorAll('p:not(.placeholder-text), .education-item, .research-item, .contact-item');
    
    items.forEach(item => {
        if (item.querySelector('.remove-btn')) return; // Zaten varsa ekleme
        
        // Bu öğeleri koruyacağız (silme butonu eklemeyeceğiz)
        const protectedTexts = [
            'Henüz tez bilgisi eklenmemiş',
            'Henüz yayın eklenmemiş',
            'Henüz proje eklenmemiş',
            'Henüz çalışma alanı eklenmemiş',
            'Henüz ilgi alanı eklenmemiş',
            'Bağlantılar içeriği burada olacak',
            'Duyurular içeriği burada olacak',
            'Başarılar içeriği burada olacak',
            'Çalışmalar içeriği burada olacak'
        ];
        
        const itemText = item.textContent.trim();
        
        // Korumalı metinlerden biriyse veya başlık grubu ise silme butonu ekleme
        if (protectedTexts.some(text => itemText.includes(text))) {
            return;
        }
        
        // Placeholder text class'ına sahipse silme butonu ekleme
        if (item.classList.contains('placeholder-text')) {
            return;
        }
        
        // Başlık gruplarını kontrol et (yıl, kurum adı vb.)
        const parent = item.closest('.education-item, .research-item, .contact-item');
        if (parent && parent.querySelector('.item-header, .year-title, .institution-name, h4, h5')) {
            // Bu bir başlık grubu ise, sadece 1 tane - butonu olmalı (grup seviyesinde)
            if (parent.querySelector('.remove-btn')) return; // Zaten grup seviyesinde buton varsa ekleme
            
            // Grup seviyesinde - butonu ekle
            addGroupRemoveButton(parent);
            return;
        }
        
        // Normal öğeler için - butonu ekle
        addRemoveButtonToItem(item);
    });
}

// Helper function to add remove button to a specific item
function addRemoveButtonToItem(item) {
    const removeBtn = document.createElement('button');
    removeBtn.className = 'remove-btn';
    removeBtn.innerHTML = '<i class="fas fa-minus"></i>';
    removeBtn.style.cssText = `
        background: #ef4444;
        color: white;
        border: none;
        border-radius: 50%;
        width: 25px;
        height: 25px;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        font-size: 10px;
        margin-left: 8px;
        transition: all 0.3s ease;
        position: relative;
        top: -2px;
    `;
    
    removeBtn.addEventListener('mouseenter', function() {
        this.style.background = '#dc2626';
        this.style.transform = 'scale(1.1)';
    });
    
    removeBtn.addEventListener('mouseleave', function() {
        this.style.background = '#ef4444';
        this.style.transform = 'scale(1)';
    });
    
    removeBtn.addEventListener('click', function() {
        if (confirm('Bu öğeyi silmek istediğinizden emin misiniz?')) {
            item.remove();
        }
    });
    
    item.appendChild(removeBtn);
}

function addGroupRemoveButton(groupElement) {
    // Grup seviyesinde tek bir - butonu ekle
    const removeBtn = document.createElement('button');
    removeBtn.className = 'remove-btn group-remove';
    removeBtn.innerHTML = '<i class="fas fa-minus"></i>';
    removeBtn.style.cssText = `
        background: #ef4444;
        color: white;
        border: none;
        border-radius: 50%;
        width: 30px;
        height: 30px;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        margin-left: 10px;
        transition: all 0.3s ease;
        position: absolute;
        top: 10px;
        right: 10px;
        z-index: 5;
    `;
    
    // Grup elementini relative yap
    groupElement.style.position = 'relative';
    
    removeBtn.addEventListener('mouseenter', function() {
        this.style.background = '#dc2626';
        this.style.transform = 'scale(1.1)';
    });
    
    removeBtn.addEventListener('mouseleave', function() {
        this.style.background = '#ef4444';
        this.style.transform = 'scale(1)';
    });
    
    removeBtn.addEventListener('click', function() {
        const groupTitle = groupElement.querySelector('h4, h5, .year-title, .institution-name');
        const titleText = groupTitle ? groupTitle.textContent.trim() : 'Bu grubu';
        
        if (confirm(`${titleText} grubunu silmek istediğinizden emin misiniz?`)) {
            groupElement.remove();
        }
    });
    
    groupElement.appendChild(removeBtn);
}

function addNewItem(titleElement, sectionType) {
    // Özel form modal'ını aç
    openCustomFormModal(titleElement, sectionType);
}

function getItemClassName(sectionType) {
    switch(sectionType) {
        case 'education': return 'education-item';
        case 'research': return 'research-item';
        case 'contact': return 'contact-item';
        default: return 'item';
    }
}

function getItemContainer(titleElement, sectionType) {
    // Başlığın altındaki uygun konteyneri bul
    const section = titleElement.closest('.education-section, .research-section, .contact-section, .detail-section');
    if (!section) return null;
    
    return section.querySelector('.education-items, .research-items, .contact-info, .detail-content') || 
           section.querySelector('.section-content') || 
           section;
}

// Özel Form Modal İşlevleri
let currentCustomFormData = null;

function openCustomFormModal(titleElement, sectionType) {
    const modal = document.getElementById('customFormModal');
    const modalTitle = document.getElementById('customModalTitle');
    const formBody = document.getElementById('customFormBody');
    
    currentCustomFormData = { titleElement, sectionType };
    
    // Form içeriğini temizle
    formBody.innerHTML = '';
    
    // Bölüm türüne göre form oluştur
    switch(sectionType) {
        case 'education':
            createEducationForm(formBody, titleElement);
            break;
        case 'research':
            createResearchForm(formBody, titleElement);
            break;
        case 'contact':
            createContactForm(formBody, titleElement);
            break;
    }
    
    modalTitle.textContent = getModalTitle(sectionType, titleElement);
    modal.classList.add('show');
}

function getModalTitle(sectionType, titleElement) {
    const titleText = titleElement.textContent.trim();
    
    if (titleText.includes('Eğitim')) return 'Yeni Eğitim Bilgisi Ekle';
    if (titleText.includes('Tez')) return 'Yeni Tez Bilgisi Ekle';
    if (titleText.includes('Dil') || titleText.includes('Language')) return 'Yeni Dil Bilgisi Ekle';
    if (titleText.includes('Çalışma Alanları')) return 'Yeni Çalışma Alanı Ekle';
    if (titleText.includes('İlgi Alanları')) return 'Yeni İlgi Alanı Ekle';
    if (titleText.includes('İletişim')) return 'Yeni İletişim Bilgisi Ekle';
    if (titleText.includes('Bağlantılar')) return 'Yeni Bağlantı Ekle';
    
    return 'Yeni Öğe Ekle';
}

function createEducationForm(formBody, titleElement) {
    const titleText = titleElement.textContent.trim();
    
    if (titleText.includes('Tez')) {
        // Tez formu
        formBody.innerHTML = `
            <div class="custom-form-row">
                <div class="form-group">
                    <label for="thesisType">Tez Türü:</label>
                    <select id="thesisType">
                        <option value="">Seçiniz</option>
                        <option value="Yüksek Lisans Tezi">Yüksek Lisans Tezi</option>
                        <option value="Doktora Tezi">Doktora Tezi</option>
                        <option value="Sanatta Yeterlik Tezi">Sanatta Yeterlik Tezi</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="thesisYear">Tez Yılı:</label>
                    <input type="number" id="thesisYear" min="1950" max="2030" placeholder="2023">
                </div>
            </div>
            <div class="form-group">
                <label for="thesisTitle">Tez Başlığı:</label>
                <input type="text" id="thesisTitle" placeholder="Tez başlığını girin">
            </div>
        `;
    } else if (titleText.includes('Dil') || titleText.includes('Language')) {
        // Dil formu
        formBody.innerHTML = `
            <div class="custom-form-row">
                <div class="form-group">
                    <label for="languageName">Yabancı Dil:</label>
                    <select id="languageName">
                        <option value="">Seçiniz</option>
                        <option value="İngilizce">İngilizce</option>
                        <option value="Almanca">Almanca</option>
                        <option value="Fransızca">Fransızca</option>
                        <option value="İspanyolca">İspanyolca</option>
                        <option value="İtalyanca">İtalyanca</option>
                        <option value="Rusça">Rusça</option>
                        <option value="Japonca">Japonca</option>
                        <option value="Çince">Çince</option>
                        <option value="Arapça">Arapça</option>
                        <option value="Diğer">Diğer</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="languageLevel">Seviye:</label>
                    <select id="languageLevel">
                        <option value="">Seçiniz</option>
                        <option value="A1">A1 - Başlangıç</option>
                        <option value="A2">A2 - Temel</option>
                        <option value="B1">B1 - Orta Alt</option>
                        <option value="B2">B2 - Orta Üst</option>
                        <option value="C1">C1 - İleri</option>
                        <option value="C2">C2 - Üst Düzey</option>
                    </select>
                </div>
            </div>
        `;
    } else {
        // Eğitim bilgisi formu
        formBody.innerHTML = `
            <div class="custom-form-row">
                <div class="form-group">
                    <label for="educationType">Eğitim Türü:</label>
                    <select id="educationType">
                        <option value="">Seçiniz</option>
                        <option value="Lisans">Lisans</option>
                        <option value="Yüksek Lisans">Yüksek Lisans</option>
                        <option value="Doktora">Doktora</option>
                        <option value="Sanatta Yeterlik">Sanatta Yeterlik</option>
                        <option value="Lise">Lise</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="institution">Kurum:</label>
                    <input type="text" id="institution" placeholder="Üniversite/Kurum adı">
                </div>
            </div>
            <div class="custom-form-row">
                <div class="form-group">
                    <label for="startYear">Başlangıç Yılı:</label>
                    <input type="number" id="startYear" min="1950" max="2030" placeholder="2018">
                </div>
                <div class="form-group">
                    <label for="endYear">Bitiş Yılı:</label>
                    <input type="number" id="endYear" min="1950" max="2030" placeholder="2022">
                </div>
            </div>
        `;
    }
}

function createResearchForm(formBody, titleElement) {
    formBody.innerHTML = `
        <div class="form-group">
            <label for="researchTitle">Başlık:</label>
            <input type="text" id="researchTitle" placeholder="Araştırma alanı/ilgi alanı başlığını girin">
        </div>
    `;
}

function createContactForm(formBody, titleElement) {
    const titleText = titleElement.textContent.trim();
    
    if (titleText.includes('Bağlantılar')) {
        // Bağlantılar formu
        formBody.innerHTML = `
            <div class="custom-form-row">
                <div class="form-group">
                    <label for="linkType">Platform:</label>
                    <select id="linkType">
                        <option value="">Seçiniz</option>
                        <option value="SCOPUS">SCOPUS</option>
                        <option value="LinkedIn">LinkedIn</option>
                        <option value="ORCID">ORCID</option>
                        <option value="Web of Science">Web of Science</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="linkUrl">URL:</label>
                    <input type="url" id="linkUrl" placeholder="https://example.com/profile">
                </div>
            </div>
        `;
    } else {
        // Genel iletişim formu
        formBody.innerHTML = `
            <div class="form-group">
                <label for="contactTitle">İletişim Türü:</label>
                <input type="text" id="contactTitle" placeholder="E-posta, Telefon, Adres vb.">
            </div>
        `;
    }
}

function closeCustomFormModal() {
    const modal = document.getElementById('customFormModal');
    modal.classList.remove('show');
    currentCustomFormData = null;
}

function saveCustomFormData() {
    if (!currentCustomFormData) return;
    
    const { titleElement, sectionType } = currentCustomFormData;
    const titleText = titleElement.textContent.trim();
    let newContent = '';
    
    // Form verilerini topla
    if (sectionType === 'education') {
        if (titleText.includes('Tez')) {
            const type = document.getElementById('thesisType').value;
            const year = document.getElementById('thesisYear').value;
            const title = document.getElementById('thesisTitle').value;
            
            if (!type || !year || !title) {
                alert('Lütfen tüm alanları doldurun!');
                return;
            }
            
            newContent = `${type} (${year}): ${title}`;
        } else if (titleText.includes('Dil')) {
            const name = document.getElementById('languageName').value;
            const level = document.getElementById('languageLevel').value;
            
            if (!name || !level) {
                alert('Lütfen tüm alanları doldurun!');
                return;
            }
            
            newContent = `${name}: ${level}`;
        } else {
            const type = document.getElementById('educationType').value;
            const institution = document.getElementById('institution').value;
            const startYear = document.getElementById('startYear').value;
            const endYear = document.getElementById('endYear').value;
            
            if (!type || !institution || !startYear || !endYear) {
                alert('Lütfen tüm alanları doldurun!');
                return;
            }
            
            newContent = `${type} - ${institution} (${startYear}-${endYear})`;
        }
    } else if (sectionType === 'research') {
        const title = document.getElementById('researchTitle').value;
        
        if (!title) {
            alert('Lütfen başlık alanını doldurun!');
            return;
        }
        
        newContent = title;
    } else if (sectionType === 'contact') {
        if (titleText.includes('Bağlantılar')) {
            const type = document.getElementById('linkType').value;
            const url = document.getElementById('linkUrl').value;
            
            if (!type || !url) {
                alert('Lütfen tüm alanları doldurun!');
                return;
            }
            
            newContent = `${type}: ${url}`;
        } else {
            const title = document.getElementById('contactTitle').value;
            
            if (!title) {
                alert('Lütfen iletişim türü alanını doldurun!');
                return;
            }
            
            newContent = title;
        }
    }
    
    // Yeni öğeyi oluştur ve ekle
    addNewItemToDOM(titleElement, sectionType, newContent);
    
    closeCustomFormModal();
}

function addNewItemToDOM(titleElement, sectionType, content) {
    // Yeni öğe oluştur
    const newItem = document.createElement('div');
    newItem.className = getItemClassName(sectionType);
    newItem.innerHTML = `<p>${content}</p>`;
    
    // - butonu ekle
    const removeBtn = document.createElement('button');
    removeBtn.className = 'remove-btn';
    removeBtn.innerHTML = '<i class="fas fa-minus"></i>';
    removeBtn.style.cssText = `
        background: #ef4444;
        color: white;
        border: none;
        border-radius: 50%;
        width: 25px;
        height: 25px;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        font-size: 10px;
        margin-left: 8px;
        transition: all 0.3s ease;
        position: relative;
        top: -2px;
    `;
    
    removeBtn.addEventListener('mouseenter', function() {
        this.style.background = '#dc2626';
        this.style.transform = 'scale(1.1)';
    });
    
    removeBtn.addEventListener('mouseleave', function() {
        this.style.background = '#ef4444';
        this.style.transform = 'scale(1)';
    });
    
    removeBtn.addEventListener('click', function() {
        if (confirm('Bu öğeyi silmek istediğinizden emin misiniz?')) {
            newItem.remove();
        }
    });
    
    newItem.querySelector('p').appendChild(removeBtn);
    
    // Uygun konteynera ekle
    const container = getItemContainer(titleElement, sectionType);
    if (container) {
        container.appendChild(newItem);
    }
    
    // Başarı mesajı
    showSuccessMessage('Yeni öğe başarıyla eklendi!');
}

function showSuccessMessage(message) {
    const successMessage = document.createElement('div');
    successMessage.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #10b981;
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        z-index: 1001;
        animation: slideInRight 0.3s ease-out;
    `;
    successMessage.textContent = message;
    document.body.appendChild(successMessage);
    
    setTimeout(() => {
        successMessage.remove();
    }, 3000);
}

// Read-only modda düzenleme butonlarını gizle (admin kontrolü ile)
function hideEditButtons() {
    // Admin kontrolü
    const adminMode = localStorage.getItem('adminMode');
    const hasRealAdminAccess = localStorage.getItem('realAdminAccess') === 'true';
    const isAdminMode = adminMode === 'admin' && hasRealAdminAccess;
    
    // Admin modundaysa düzenleme butonlarını gizleme
    if (isAdminMode) {
        console.log('Admin mode detected, keeping edit buttons visible');
        return;
    }
    
    const editBtn = document.getElementById('editProfileBtn');
    const saveBtn = document.getElementById('saveProfileBtn');
    const cancelBtn = document.getElementById('cancelProfileBtn');
    const photoControls = document.getElementById('photoControls');
    const profileEditBtn = document.getElementById('profileEditBtn'); // Mor düzenle butonu
    const editBasicInfoBtn = document.getElementById('editBasicInfoBtn'); // Mavi düzenle butonu
    
    if (editBtn) editBtn.style.display = 'none';
    if (saveBtn) saveBtn.style.display = 'none';
    if (cancelBtn) cancelBtn.style.display = 'none';
    if (photoControls) photoControls.style.display = 'none';
    
    // Read-only modda TÜM düzenleme butonları gizlenmeli (admin değilse)
    if (profileEditBtn) {
        profileEditBtn.style.display = 'none';
        profileEditBtn.style.visibility = 'hidden';
        profileEditBtn.disabled = true;
    }
    if (editBasicInfoBtn) {
        editBasicInfoBtn.style.display = 'none';
        editBasicInfoBtn.style.visibility = 'hidden';
        editBasicInfoBtn.disabled = true;
    }
    
    // Tüm inputları disable yap
    const inputs = document.querySelectorAll('#profile-container input, #profile-container textarea');
    inputs.forEach(input => {
        input.disabled = true;
        input.style.backgroundColor = '#f5f5f5';
    });
}

// Normal modda düzenleme butonlarını göster
function showEditButtons() {
    const editBtn = document.getElementById('editProfileBtn');
    const saveBtn = document.getElementById('saveProfileBtn');
    const cancelBtn = document.getElementById('cancelProfileBtn');
    const photoControls = document.getElementById('photoControls');
    const profileEditBtn = document.getElementById('profileEditBtn');
    const editBasicInfoBtn = document.getElementById('editBasicInfoBtn'); // Mavi düzenle butonu
    
    if (editBtn) {
        editBtn.style.display = 'block';
        editBtn.style.visibility = 'visible';
        editBtn.disabled = false;
    }
    if (profileEditBtn) {
        profileEditBtn.style.display = 'block';
        profileEditBtn.style.visibility = 'visible';
        profileEditBtn.disabled = false;
    }
    
    // Save ve Cancel butonları edit modda gösterilir, normalde gizli
    if (saveBtn) saveBtn.style.display = 'none';
    if (cancelBtn) cancelBtn.style.display = 'none';
    if (photoControls) photoControls.style.display = 'none';
    // Mavi düzenle butonu başlangıçta gizli, mor düzenle butonuna tıklandığında gösterilir
    if (editBasicInfoBtn) {
        editBasicInfoBtn.style.display = 'none';
        editBasicInfoBtn.style.visibility = 'visible';
        editBasicInfoBtn.disabled = false;
    }
    
    // Tüm inputları enable yap
    const inputs = document.querySelectorAll('#profile-container input, #profile-container textarea');
    inputs.forEach(input => {
        input.disabled = false;
        input.style.backgroundColor = '';
    });
    
    // Read-only indicator'ı kaldır
    const indicator = document.getElementById('viewOnlyIndicator');
    if (indicator) {
        indicator.remove();
    }
}

// Read-only modda kimin profilini görüntülediğimizi belirt
function addViewOnlyIndicator(userIdentifier) {
    // Admin kontrolü
    const adminMode = localStorage.getItem('adminMode');
    const hasRealAdminAccess = localStorage.getItem('realAdminAccess') === 'true';
    const isAdminMode = adminMode === 'admin' && hasRealAdminAccess;
    
    const header = document.querySelector('.header h1') || document.querySelector('h1');
    if (header) {
        const indicator = document.createElement('div');
        indicator.id = 'viewOnlyIndicator'; // ID ekle ki güncellenebilsin
        indicator.style.cssText = `
            background: ${isAdminMode ? '#e8f5e8' : '#e3f2fd'};
            padding: 8px 16px;
            border-radius: 5px;
            margin: 10px 0;
            font-size: 14px;
            color: ${isAdminMode ? '#2e7d32' : '#1976d2'};
            border-left: 4px solid ${isAdminMode ? '#4caf50' : '#2196f3'};
        `;
        
        if (isAdminMode) {
            indicator.innerHTML = `👤 <strong>Admin modu:</strong> Kullanıcı profili düzenlenebilir`;
        } else {
            indicator.innerHTML = `📋 Profil görüntüleniyor (Salt okunur mod)`;
        }
        
        header.parentNode.insertBefore(indicator, header.nextSibling);
    }
}
