// Profile Page Script

// Global profile data
let profileData = {
    research: [],
    contact: [],
    links: [],
    linkedinLink: '',
    wosLink: '',
    scopusLink: '',
    orcidLink: '',
    fullName: '',
    email: '',
    phone: '',
    department: '',
    title: ''
};

document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    const sidePanel = document.getElementById('sidePanel');
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
    }

    // Initialize profile data
    loadProfileData();

    // Load saved photo
    const savedPhoto = localStorage.getItem('profilePhoto');
    if (savedPhoto) {
        if (profilePhoto) profilePhoto.src = savedPhoto;
        const sideProfilePhoto = document.getElementById('sideProfilePhoto');
        if (sideProfilePhoto) sideProfilePhoto.src = savedPhoto;
    }
});

// Load Profile Data
function loadProfileData() {
    const savedProfileData = localStorage.getItem('profileData');
    if (savedProfileData) {
        const data = JSON.parse(savedProfileData);
        
        // Merge with default profileData structure
        profileData = {
            research: data.research || [],
            contact: data.contact || [],
            links: data.links || [],
            linkedinLink: data.linkedinLink || '',
            wosLink: data.wosLink || '',
            scopusLink: data.scopusLink || '',
            orcidLink: data.orcidLink || '',
            fullName: data.fullName || '',
            email: data.email || '',
            phone: data.phone || '',
            department: data.department || '',
            title: data.title || ''
        };
        
        // Load data into form fields
        document.getElementById('linkedinLink')?.setAttribute('value', profileData.linkedinLink);
        document.getElementById('wosLink')?.setAttribute('value', profileData.wosLink);
        document.getElementById('scopusLink')?.setAttribute('value', profileData.scopusLink);
        document.getElementById('orcidLink')?.setAttribute('value', profileData.orcidLink);
        document.getElementById('fullName')?.setAttribute('value', profileData.fullName);
        document.getElementById('email')?.setAttribute('value', profileData.email);
        document.getElementById('phone')?.setAttribute('value', profileData.phone);
        document.getElementById('department')?.setAttribute('value', profileData.department);
        document.getElementById('title')?.setAttribute('value', profileData.title);
    }
}

// Load profile data on page load
loadProfileData();

// Save Profile Data
function saveProfileData() {
        profileData.linkedinLink = document.getElementById('linkedinLink')?.value || '';
        profileData.wosLink = document.getElementById('wosLink')?.value || '';
        profileData.scopusLink = document.getElementById('scopusLink')?.value || '';
        profileData.orcidLink = document.getElementById('orcidLink')?.value || '';
        profileData.fullName = document.getElementById('fullName')?.value || '';
        profileData.email = document.getElementById('email')?.value || '';
        profileData.phone = document.getElementById('phone')?.value || '';
        profileData.department = document.getElementById('department')?.value || '';
        profileData.title = document.getElementById('title')?.value || '';
        profileData.lastUpdated = new Date().toISOString();
        
        localStorage.setItem('profileData', JSON.stringify(profileData));
        
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
    languages: [],
    research: [],
    contact: [],
    links: []
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
let researchEditMode = false;
let contactEditMode = false;
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

// Research System
function initResearchSystem() {
    const researchEditBtn = document.getElementById('researchEditBtn');
    if (researchEditBtn && !researchEditBtn.hasEventListener) {
        researchEditBtn.hasEventListener = true;
        researchEditBtn.addEventListener('click', function() {
            researchEditMode = !researchEditMode;
            toggleResearchEditMode();
        });
    }

    const addResearchBtn = document.getElementById('addResearchBtn');
    if (addResearchBtn && !addResearchBtn.hasEventListener) {
        addResearchBtn.hasEventListener = true;
        addResearchBtn.addEventListener('click', () => openModal('research'));
    }

    renderResearchItems();
}

function toggleResearchEditMode() {
    const researchSections = document.querySelectorAll('#researchSection .education-section');
    const addBtns = document.querySelectorAll('#researchSection .add-item-btn');
    const researchEditBtn = document.getElementById('researchEditBtn');
    
    if (researchEditMode) {
        researchEditBtn.innerHTML = '<i class="fas fa-check"></i> Bitir';
        researchEditBtn.style.background = '#28a745';
        researchSections.forEach(section => section.classList.add('edit-mode'));
        addBtns.forEach(btn => btn.style.display = 'flex');
    } else {
        researchEditBtn.innerHTML = '<i class="fas fa-edit"></i> Düzenle';
        researchEditBtn.style.background = '#8b5cf6';
        researchSections.forEach(section => section.classList.remove('edit-mode'));
        addBtns.forEach(btn => btn.style.display = 'none');
    }
    
    // Re-render items to show/hide edit buttons
    renderResearchItems();
}

// Contact System
function initContactSystem() {
    const contactEditBtn = document.getElementById('contactEditBtn');
    if (contactEditBtn && !contactEditBtn.hasEventListener) {
        contactEditBtn.hasEventListener = true;
        contactEditBtn.addEventListener('click', function() {
            contactEditMode = !contactEditMode;
            toggleContactEditMode();
        });
    }

    const addContactBtn = document.getElementById('addContactBtn');
    const addLinkBtn = document.getElementById('addLinkBtn');
    
    if (addContactBtn && !addContactBtn.hasEventListener) {
        addContactBtn.hasEventListener = true;
        addContactBtn.addEventListener('click', () => openModal('contact'));
    }
    
    if (addLinkBtn && !addLinkBtn.hasEventListener) {
        addLinkBtn.hasEventListener = true;
        addLinkBtn.addEventListener('click', () => openModal('link'));
    }

    renderContactItems();
    renderLinkItems();
}

function toggleContactEditMode() {
    const contactSections = document.querySelectorAll('#contactSection .education-section');
    const addBtns = document.querySelectorAll('#contactSection .add-item-btn');
    const contactEditBtn = document.getElementById('contactEditBtn');
    
    if (contactEditMode) {
        contactEditBtn.innerHTML = '<i class="fas fa-check"></i> Bitir';
        contactEditBtn.style.background = '#28a745';
        contactSections.forEach(section => section.classList.add('edit-mode'));
        addBtns.forEach(btn => btn.style.display = 'flex');
    } else {
        contactEditBtn.innerHTML = '<i class="fas fa-edit"></i> Düzenle';
        contactEditBtn.style.background = '#8b5cf6';
        contactSections.forEach(section => section.classList.remove('edit-mode'));
        addBtns.forEach(btn => btn.style.display = 'none');
    }
    
    // Re-render items to show/hide edit buttons
    renderContactItems();
    renderLinkItems();
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
    
    if (type === 'research') {
        openResearchModal();
    } else if (type === 'contact') {
        openContactModal();
    } else if (type === 'link') {
        openLinkModal();
    } else {
        // Existing modal system for education/thesis/language
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

document.getElementById('cancelEducation')?.addEventListener('click', () => closeModal('education'));
document.getElementById('cancelThesis')?.addEventListener('click', () => closeModal('thesis'));
document.getElementById('cancelLanguage')?.addEventListener('click', () => closeModal('language'));

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

// Research Functions
function openResearchModal() {
    currentEditIndex = -1;
    document.getElementById('researchForm').reset();
    document.getElementById('researchModal').classList.add('active');
}

function closeResearchModal() {
    document.getElementById('researchModal').classList.remove('active');
}

function saveResearch() {
    const formData = new FormData(document.getElementById('researchForm'));
    const research = {
        id: Date.now(),
        area: formData.get('area')
    };

    if (currentEditIndex === -1) {
        profileData.research.push(research);
    } else {
        profileData.research[currentEditIndex] = { ...profileData.research[currentEditIndex], ...research };
    }

    saveProfileData();
    renderResearchItems();
    closeResearchModal();
}

function editResearch(index) {
    const research = profileData.research[index];
    currentEditIndex = index;

    document.getElementById('researchArea').value = research.area;
    document.getElementById('researchModal').classList.add('active');
}

function deleteResearch(index) {
    if (confirm('Bu araştırma alanını silmek istediğinizden emin misiniz?')) {
        profileData.research.splice(index, 1);
        saveProfileData();
        renderResearchItems();
    }
}

function renderResearchItems() {
    const container = document.getElementById('researchGrid');
    if (!container) return;

    container.innerHTML = '';

    profileData.research.forEach((research, index) => {
        const researchElement = document.createElement('div');
        researchElement.className = 'education-item';
        
        researchElement.innerHTML = `
            <div class="education-content">
                <h4>${research.area}</h4>
                <div class="education-actions" style="display: ${researchEditMode ? 'flex' : 'none'};">
                    <button onclick="editResearch(${index})" class="edit-btn">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="deleteResearch(${index})" class="delete-btn">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;

        container.appendChild(researchElement);
    });
}

// Contact Functions
function openContactModal() {
    currentEditIndex = -1;
    document.getElementById('contactForm').reset();
    document.getElementById('contactModal').classList.add('active');
}

function closeContactModal() {
    document.getElementById('contactModal').classList.remove('active');
}

function saveContact() {
    const formData = new FormData(document.getElementById('contactForm'));
    const contact = {
        id: Date.now(),
        address: formData.get('address'),
        email: formData.get('email'),
        phone: formData.get('phone')
    };

    if (currentEditIndex === -1) {
        profileData.contact.push(contact);
    } else {
        profileData.contact[currentEditIndex] = { ...profileData.contact[currentEditIndex], ...contact };
    }

    saveProfileData();
    renderContactItems();
    closeContactModal();
}

function editContact(index) {
    const contact = profileData.contact[index];
    currentEditIndex = index;

    document.getElementById('contactAddress').value = contact.address;
    document.getElementById('contactEmail').value = contact.email;
    document.getElementById('contactPhone').value = contact.phone;
    document.getElementById('contactModal').classList.add('active');
}

function deleteContact(index) {
    if (confirm('Bu iletişim bilgisini silmek istediğinizden emin misiniz?')) {
        profileData.contact.splice(index, 1);
        saveProfileData();
        renderContactItems();
    }
}

function renderContactItems() {
    const container = document.getElementById('contactGrid');
    if (!container) return;

    container.innerHTML = '';

    profileData.contact.forEach((contact, index) => {
        const contactElement = document.createElement('div');
        contactElement.className = 'education-item';
        
        contactElement.innerHTML = `
            <div class="education-content">
                <h4>İletişim Bilgisi</h4>
                <p><strong>Adres:</strong> ${contact.address}</p>
                <p><strong>E-posta:</strong> ${contact.email}</p>
                <p><strong>Telefon:</strong> ${contact.phone}</p>
                <div class="education-actions" style="display: ${contactEditMode ? 'flex' : 'none'};">
                    <button onclick="editContact(${index})" class="edit-btn">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="deleteContact(${index})" class="delete-btn">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;

        container.appendChild(contactElement);
    });
}

// Link Functions
function openLinkModal() {
    currentEditIndex = -1;
    document.getElementById('linkForm').reset();
    document.getElementById('linkModal').classList.add('active');
}

function closeLinkModal() {
    document.getElementById('linkModal').classList.remove('active');
}

function saveLink() {
    const formData = new FormData(document.getElementById('linkForm'));
    const link = {
        id: Date.now(),
        name: formData.get('name'),
        url: formData.get('url')
    };

    if (currentEditIndex === -1) {
        profileData.links.push(link);
    } else {
        profileData.links[currentEditIndex] = { ...profileData.links[currentEditIndex], ...link };
    }

    saveProfileData();
    renderLinkItems();
    closeLinkModal();
}

function editLink(index) {
    const link = profileData.links[index];
    currentEditIndex = index;

    document.getElementById('linkName').value = link.name;
    document.getElementById('linkUrl').value = link.url;
    document.getElementById('linkModal').classList.add('active');
}

function deleteLink(index) {
    if (confirm('Bu linki silmek istediğinizden emin misiniz?')) {
        profileData.links.splice(index, 1);
        saveProfileData();
        renderLinkItems();
    }
}

function renderLinkItems() {
    const container = document.getElementById('linksGrid');
    if (!container) return;

    container.innerHTML = '';

    profileData.links.forEach((link, index) => {
        const linkElement = document.createElement('div');
        linkElement.className = 'education-item';
        
        linkElement.innerHTML = `
            <div class="education-content">
                <h4>${link.name}</h4>
                <p><a href="${link.url}" target="_blank">${link.url}</a></p>
                <div class="education-actions" style="display: ${contactEditMode ? 'flex' : 'none'};">
                    <button onclick="editLink(${index})" class="edit-btn">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="deleteLink(${index})" class="delete-btn">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;

        container.appendChild(linkElement);
    });
}
