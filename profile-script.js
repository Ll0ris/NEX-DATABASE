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
                setTimeout(initEducationEditing, 100);
            }
            
            // Initialize research system if switching to research section
            if (sectionName === 'research') {
                setTimeout(initResearchSystem, 100);
                setTimeout(initResearchEditing, 100);
            }
            
            // Initialize contact system if switching to contact section
            if (sectionName === 'contact') {
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
    const educationEditBtn = document.getElementById('educationEditBtn');
    if (educationEditBtn) {
        // Önce eski event'leri temizle
        const newBtn = educationEditBtn.cloneNode(true);
        educationEditBtn.parentNode.replaceChild(newBtn, educationEditBtn);
        newBtn.addEventListener('click', function() {
            toggleEditMode('education');
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
        hideAddRemoveButtons(contentSection);
        
        console.log(`${sectionType} edit mode: OFF`);
    } else {
        // Enter edit mode
        contentSection.classList.add('edit-mode');
        editBtn.innerHTML = '<i class="fas fa-times"></i> Çıkış';
        editBtn.style.background = '#ef4444';
        
        // Show edit buttons for each section (sadece aktif sekmede)
        addEditButtons();
        
        // + ve - butonlarını göster
        showAddRemoveButtons(contentSection, sectionType);
        
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
function showAddRemoveButtons(contentSection, sectionType) {
    // + butonlarını göster
    contentSection.querySelectorAll('.section-title, .detail-title').forEach(title => {
        addPlusButton(title, sectionType);
    });
    
    // Mevcut öğelere - butonları ekle
    addMinusButtons(contentSection);
}

function hideAddRemoveButtons(contentSection) {
    // Tüm + ve - butonlarını kaldır
    contentSection.querySelectorAll('.add-btn, .remove-btn').forEach(btn => btn.remove());
}

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
        width: 30px;
        height: 30px;
        margin-left: 10px;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        transition: all 0.3s ease;
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

function addMinusButtons(contentSection) {
    // Mevcut öğeleri bul ve - butonu ekle, ancak başlık gruplarını ve yer tutucu metinleri hariç tut
    const items = contentSection.querySelectorAll('p, .education-item, .research-item, .contact-item');
    
    items.forEach(item => {
        if (item.querySelector('.remove-btn')) return; // Zaten varsa ekleme
        
        // Bu öğeleri koruyacağız (silme butonu eklemeyeceğiz)
        const protectedTexts = [
            'Henüz tez bilgisi eklenmemiş',
            'Henüz yayın eklenmemiş',
            'Henüz proje eklenmemiş',
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
    });
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
