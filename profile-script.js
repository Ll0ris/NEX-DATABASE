// Profile Page Script

document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    const sidePanel = document.getElementById('profileSidePanel');
    const mainContent = document.getElementById('mainContent');
    const themeToggle = document.getElementById('themeToggle');
    const profileSection = document.getElementById('profileSection');
    const profileDropdown = document.getElementById('profileDropdown');
    const editProfileBtn = document.getElementById('editProfileBtn');
    const profileEditingPanel = document.getElementById('profileEditingPanel');
    const saveProfileBtn = document.getElementById('saveProfileBtn');
    const photoUpload = document.getElementById('photoUpload');
    const profilePhoto = document.getElementById('profilePhoto');

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
            
            // Initialize profile editing if switching to profile section
            if (sectionName === 'profile') {
                setTimeout(initProfileEditing, 100);
            }
            
            // Initialize education system if switching to education section
            if (sectionName === 'education') {
                setTimeout(initEducationSystem, 100);
            }
            
            // Initialize research system if switching to research section
            if (sectionName === 'research') {
                setTimeout(initResearchSystem, 100);
            }
            
            // Initialize contact system if switching to contact section
            if (sectionName === 'contact') {
                setTimeout(initContactSystem, 100);
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

    // Side Panel Toggle (database-script.js'teki gibi)
    function toggleSidePanel() {
        const isActive = sidePanel.classList.contains('active');
        
        if (isActive) {
            closeSidePanel();
        } else {
            openSidePanel();
        }
    }

    function openSidePanel() {
        sidePanel.classList.add('active');
        hamburgerBtn.classList.add('active');
    }

    function closeSidePanel() {
        sidePanel.classList.remove('active');
        hamburgerBtn.classList.remove('active');
    }

    // Hamburger button event
    if (hamburgerBtn) {
        hamburgerBtn.addEventListener('click', function() {
            toggleSidePanel();
        });
    }

    // Profile Dropdown Toggle (database-script.js'teki gibi)
    function toggleProfileDropdown() {
        if (profileDropdown) {
            profileDropdown.classList.toggle('active');
        }
    }

    // Profile section click event
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
        }
    });

    // Profile Editing Panel Toggle
    if (editProfileBtn) {
        editProfileBtn.addEventListener('click', function() {
            profileEditingPanel.classList.toggle('open');
        });
    }

    // Theme Toggle
    function updateThemeIcon() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const themeIcon = themeToggle.querySelector('.theme-icon');
        themeIcon.className = currentTheme === 'dark' ? 'fas fa-moon theme-icon' : 'fas fa-sun theme-icon';
    }

    // Load saved theme
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon();

    if (themeToggle) {
        themeToggle.addEventListener('click', function() {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            updateThemeIcon();
        });
    }

    // Profile Dropdown Toggle
    if (profileSection) {
        profileSection.addEventListener('click', function(e) {
            e.stopPropagation();
            profileDropdown.classList.toggle('show');
        });
    }

    // Close dropdown when clicking outside
    document.addEventListener('click', function(e) {
        if (profileSection && profileDropdown && 
            !profileSection.contains(e.target) && 
            !profileDropdown.contains(e.target)) {
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

    // Load Profile Data
    function loadProfileData() {
        const savedProfileData = localStorage.getItem('profileData');
        if (savedProfileData) {
            const data = JSON.parse(savedProfileData);
            
            // Load data into form fields
            document.getElementById('linkedinLink')?.setAttribute('value', data.linkedinLink || '');
            document.getElementById('wosLink')?.setAttribute('value', data.wosLink || '');
            document.getElementById('scopusLink')?.setAttribute('value', data.scopusLink || '');
            document.getElementById('orcidLink')?.setAttribute('value', data.orcidLink || '');
            document.getElementById('fullName')?.setAttribute('value', data.fullName || '');
            document.getElementById('email')?.setAttribute('value', data.email || '');
            document.getElementById('phone')?.setAttribute('value', data.phone || '');
            document.getElementById('department')?.setAttribute('value', data.department || '');
            document.getElementById('title')?.setAttribute('value', data.title || '');
            
            // Update contact section if it's currently active
            const contactSection = document.getElementById('contactContent');
            if (contactSection && contactSection.style.display !== 'none') {
                loadContactData();
            }
        }
    }

    // Load profile data on page load
    loadProfileData();

    // Save Profile Data
    function saveProfileData() {
        const profileData = {
            linkedinLink: document.getElementById('linkedinLink')?.value || '',
            wosLink: document.getElementById('wosLink')?.value || '',
            scopusLink: document.getElementById('scopusLink')?.value || '',
            orcidLink: document.getElementById('orcidLink')?.value || '',
            fullName: document.getElementById('fullName')?.value || '',
            email: document.getElementById('email')?.value || '',
            phone: document.getElementById('phone')?.value || '',
            department: document.getElementById('department')?.value || '',
            title: document.getElementById('title')?.value || '',
            lastUpdated: new Date().toISOString()
        };
        
        localStorage.setItem('profileData', JSON.stringify(profileData));
        
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
    const downloadCVBtn = document.getElementById('downloadCV');
    if (downloadCVBtn) {
        downloadCVBtn.addEventListener('click', function(e) {
            e.preventDefault();
            
            const cvData = {
                name: "Admin Kullanıcı",
                title: "Prof. Dr.",
                institution: "Yıldız Teknik Üniversitesi",
                downloadDate: new Date().toLocaleString('tr-TR')
            };
            
            const cvText = `
=== CV - ${cvData.name} ===

Ünvan: ${cvData.title}
Ad Soyad: ${cvData.name}
Kurum: ${cvData.institution}

İndirilme Tarihi: ${cvData.downloadDate}

Bu CV NEX Database sisteminden indirilmiştir.
            `;
            
            const blob = new Blob([cvText], { type: 'text/plain;charset=utf-8' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `CV_${cvData.name.replace(/\s+/g, '_')}.txt`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
            
            alert('CV başarıyla indirildi!');
        });
    }

    // Initialize
    loadProfileData();
    
    // Add hamburger animation
    if (hamburgerBtn) {
        hamburgerBtn.addEventListener('click', function() {
            this.classList.toggle('active');
        });
    }
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
    languages: []
};

// Load data from localStorage on page load
function loadEducationData() {
    const savedData = localStorage.getItem('educationData');
    if (savedData) {
        educationData = JSON.parse(savedData);
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
    const sections = document.querySelectorAll('.education-section');
    const addBtns = document.querySelectorAll('.add-item-btn');
    
    if (editMode) {
        educationEditBtn.innerHTML = '<i class="fas fa-check"></i> Bitir';
        educationEditBtn.style.background = '#28a745';
        sections.forEach(section => section.classList.add('edit-mode'));
        addBtns.forEach(btn => btn.style.display = 'flex');
    } else {
        educationEditBtn.innerHTML = '<i class="fas fa-edit"></i> Düzenle';
        educationEditBtn.style.background = '#8b5cf6';
        sections.forEach(section => section.classList.remove('edit-mode'));
        addBtns.forEach(btn => btn.style.display = 'none');
    }
}

// Add button event listeners

// Modal functions
function openModal(type, item = null) {
    currentEditType = type;
    currentEditItem = item;
    
    const modal = document.getElementById(type + 'Modal');
    const form = document.getElementById(type + 'Form');
    
    if (item) {
        // Edit mode - populate form
        fillForm(form, item);
    } else {
        // Add mode - clear form
        form.reset();
    }
    
    modal.classList.add('show');
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
    if (confirm('Bu öğeyi silmek istediğinizden emin misiniz?')) {
        educationData[type] = educationData[type].filter(item => item.id !== id);
        
        if (type === 'education') renderEducationItems();
        else if (type === 'thesis') renderThesisItems();
        else if (type === 'languages') renderLanguageItems();
        
        saveEducationData(); // Save to localStorage after deletion
    }
}

function renderEducationItems() {
    const container = document.getElementById('educationItems');
    container.innerHTML = '';

    educationData.education.forEach(item => {
        const div = document.createElement('div');
        div.className = 'education-item';
        div.innerHTML = `
            <button class="delete-btn" onclick="deleteItem('education', ${item.id})">
                <i class="fas fa-times"></i>
            </button>
            <h4>${item.level}</h4>
            <p><strong>${item.institution}</strong></p>
            <p class="year">${item.startYear} - ${item.endYear}</p>
        `;
        
        div.addEventListener('click', function() {
            if (editMode) {
                openModal('education', item);
            }
        });
        
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
        
        div.addEventListener('click', function() {
            if (editMode) {
                openModal('thesis', item);
            }
        });
        
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
        
        div.addEventListener('click', function() {
            if (editMode) {
                openModal('language', item);
            }
        });
        
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
    
    // Load existing data
    loadResearchData();
    
    if (researchEditBtn) {
        researchEditBtn.addEventListener('click', toggleResearchEditMode);
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
    const deleteButtons = document.querySelectorAll('#workAreaItems .delete-btn, #interestAreaItems .delete-btn');
    
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

function handleWorkAreaSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const workAreaData = {
        id: Date.now(),
        name: formData.get('areaName')
    };
    
    saveWorkAreaData(workAreaData);
    closeModal('workArea');
    loadResearchData();
}

function handleInterestAreaSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const interestAreaData = {
        id: Date.now(),
        name: formData.get('areaName')
    };
    
    saveInterestAreaData(interestAreaData);
    closeModal('interestArea');
    loadResearchData();
}

function saveWorkAreaData(data) {
    let workAreas = JSON.parse(localStorage.getItem('workAreas')) || [];
    workAreas.push(data);
    localStorage.setItem('workAreas', JSON.stringify(workAreas));
}

function saveInterestAreaData(data) {
    let interestAreas = JSON.parse(localStorage.getItem('interestAreas')) || [];
    interestAreas.push(data);
    localStorage.setItem('interestAreas', JSON.stringify(interestAreas));
}

function loadResearchData() {
    loadWorkAreas();
    loadInterestAreas();
}

function loadWorkAreas() {
    const workAreas = JSON.parse(localStorage.getItem('workAreas')) || [];
    const container = document.getElementById('workAreaItems');
    
    if (container) {
        container.innerHTML = '';
        workAreas.forEach(area => {
            const areaElement = createResearchAreaElement(area, 'workArea');
            container.appendChild(areaElement);
        });
    }
}

function loadInterestAreas() {
    const interestAreas = JSON.parse(localStorage.getItem('interestAreas')) || [];
    const container = document.getElementById('interestAreaItems');
    
    if (container) {
        container.innerHTML = '';
        interestAreas.forEach(area => {
            const areaElement = createResearchAreaElement(area, 'interestArea');
            container.appendChild(areaElement);
        });
    }
}

function createResearchAreaElement(area, type) {
    const div = document.createElement('div');
    div.className = 'research-item';
    div.innerHTML = `
        <div class="research-info">
            <div class="research-name">${area.name}</div>
        </div>
        <button class="delete-btn" onclick="deleteResearchItem(${area.id}, '${type}')" style="display: none;">
            <i class="fas fa-trash"></i>
        </button>
    `;
    return div;
}

function deleteResearchItem(id, type) {
    const storageKey = type === 'workArea' ? 'workAreas' : 'interestAreas';
    let items = JSON.parse(localStorage.getItem(storageKey)) || [];
    items = items.filter(item => item.id !== id);
    localStorage.setItem(storageKey, JSON.stringify(items));
    loadResearchData();
}

// Global function for research delete buttons
window.deleteResearchItem = deleteResearchItem;

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
});

// Profile Editing System
function initProfileEditing() {
    const profileEditBtn = document.getElementById('profileEditBtn');
    
    if (profileEditBtn) {
        profileEditBtn.addEventListener('click', function() {
            toggleProfileEditMode();
        });
    }
}

function toggleProfileEditMode() {
    const profileContent = document.querySelector('#profileContent');
    const editBtn = document.getElementById('profileEditBtn');
    const isEditing = profileContent.classList.contains('edit-mode');
    
    if (isEditing) {
        // Exit edit mode
        profileContent.classList.remove('edit-mode');
        editBtn.innerHTML = '<i class="fas fa-edit"></i> Düzenle';
        editBtn.style.background = '#8b5cf6';
        
        // Hide all edit buttons
        const editButtons = profileContent.querySelectorAll('.edit-item-btn');
        editButtons.forEach(btn => btn.style.display = 'none');
        
        console.log('Profile edit mode: OFF');
    } else {
        // Enter edit mode
        profileContent.classList.add('edit-mode');
        editBtn.innerHTML = '<i class="fas fa-times"></i> Çıkış';
        editBtn.style.background = '#ef4444';
        
        // Show edit buttons for each section
        addEditButtons();
        
        console.log('Profile edit mode: ON');
    }
}

function addEditButtons() {
    const detailSections = document.querySelectorAll('.detail-section');
    
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
            // Here you would open specific edit modal for each section
        });
        
        section.appendChild(editBtn);
    });
}
