// Members Page Script with Firestore Integration

document.addEventListener('DOMContentLoaded', function() {
    let currentMembers = [];
    let allMembers = [];
    let sortField = 'name';
    let sortDirection = 'asc';

    // Initialize the page
    initializeMembersPage();

    // Otomatik email tespiti fonksiyonu
    function autoDetectUserEmail() {
        // 1. Profile data'dan email'i al
        const profileData = localStorage.getItem('profileData');
        if (profileData) {
            try {
                const data = JSON.parse(profileData);
                if (data.email) {
                    localStorage.setItem('currentUserEmail', data.email);
                    console.log('🎯 Auto-detected email from profile data:', data.email);
                    return data.email;
                }
            } catch (e) {
                console.log('Profile data parse error:', e);
            }
        }
        
        // 2. Contact formlarından email'i al
        const emailInput = document.getElementById('email');
        if (emailInput && emailInput.value) {
            localStorage.setItem('currentUserEmail', emailInput.value);
            console.log('🎯 Auto-detected email from form input:', emailInput.value);
            return emailInput.value;
        }
        
        console.log('❌ Could not auto-detect user email');
        return null;
    }

    // Test fonksiyonu - konsol üzerinden çağırabilirsiniz
    window.setTestUserEmail = function(email) {
        localStorage.setItem('currentUserEmail', email);
        console.log('Test user email set to:', email);
        console.log('Reloading members table...');
        renderMemberTable();
    };

    // Current user email'i kontrol etme fonksiyonu
    window.getCurrentUserEmail = function() {
        const currentEmail = localStorage.getItem('currentUserEmail') || '';
        console.log('Current user email:', currentEmail);
        return currentEmail;
    };

    // Email'i otomatik tespit et ve set et
    window.autoSetUserEmail = function() {
        const detectedEmail = autoDetectUserEmail();
        if (detectedEmail) {
            console.log('✅ Email otomatik olarak tespit edildi ve ayarlandı');
            renderMemberTable(); // Tabloyu yeniden render et
            return detectedEmail;
        } else {
            console.log('❌ Email tespit edilemedi');
            return null;
        }
    };

    // Kolay test için hazır email'ler
    window.testWithArdaEmail = function() {
        setTestUserEmail('ardamertsot@hotmail.com');
    };

    window.testWithDenizEmail = function() {
        setTestUserEmail('dnz@gmail.com');
    };

    window.testWithOguzhanEmail = function() {
        setTestUserEmail('dedeogluoguzhan1603@gmail.com');
    };

    // Giriş yapan kullanıcı email'ini set etme (gerçek giriş simülasyonu)
    window.setCurrentUserAsOguzhan = function() {
        localStorage.setItem('currentUserEmail', 'dedeogluoguzhan1603@gmail.com');
        console.log('✅ Oğuzhan olarak giriş yapıldı');
        renderMemberTable();
    };

    // User olarak giriş yapma (pages/index.html için)
    window.setCurrentUserAsUser = function() {
        localStorage.setItem('currentUserEmail', 'user');
        console.log('✅ User olarak giriş yapıldı');
        renderMemberTable();
    };

    // Debugging için - hangi giriş sisteminden geldiğini kontrol et
    window.checkLoginSystem = function() {
        const userId = localStorage.getItem('currentUserId');
        const userEmail = localStorage.getItem('currentUserEmail');
        const adminMode = localStorage.getItem('adminMode');
        
        console.log('=== LOGIN SYSTEM DEBUG ===');
        console.log('currentUserId:', userId);
        console.log('currentUserEmail:', userEmail);
        console.log('adminMode:', adminMode);
        console.log('=========================');
        
        if (!userEmail && userId) {
            console.log('⚠️ UserId var ama email yok - email\'i userId\'den set ediliyor');
            localStorage.setItem('currentUserEmail', userId);
            renderMemberTable();
        }
    };

    // Debug: Check current localStorage state
    window.debugLocalStorage = function() {
        console.log('=== LOCAL STORAGE DEBUG ===');
        console.log('currentUserId:', localStorage.getItem('currentUserId'));
        console.log('currentUserEmail:', localStorage.getItem('currentUserEmail'));
        console.log('profileData:', localStorage.getItem('profileData'));
        console.log('adminMode:', localStorage.getItem('adminMode'));
        console.log('mode:', localStorage.getItem('mode'));
        console.log('========================');
    };

    async function initializeMembersPage() {
        try {
            await loadMembersFromFirestore();
            updateStatistics();
            renderMemberTable();
            initializeEventListeners();
        } catch (error) {
            console.error('Üyeler yüklenirken hata:', error);
            showError('Üyeler yüklenirken bir hata oluştu.');
        }
    }

    // Firestore'dan üyeleri yükle (users koleksiyonu)
    async function loadMembersFromFirestore() {
        try {
            const usersSnapshot = await db.collection('users').get();
            currentMembers = [];
            usersSnapshot.forEach((doc) => {
                const userData = doc.data();
                currentMembers.push({
                    id: doc.id,
                    name: userData.name || '',
                    email: userData.email || '',
                    phone: userData.phone || '',
                    photoUrl: userData.photoUrl || null,
                    joinDate: userData.createdAt || userData.joinDate || '',
                    membershipType: userData.role || userData.membershipType || '',
                    rank: userData.rank || '',
                    isAdmin: userData.isAdmin || false,
                    positions: userData.positions || [],
                    fsacMembership: userData.fsacMembership || '',
                    fsacMembershipType: userData.fsacMembershipType || '',
                    institution: userData.institution || '',
                    department: userData.department || '',
                    status: userData.status || ''
                });
            });
            allMembers = [...currentMembers];
        } catch (error) {
            console.error('Firestore\'dan üyeler yüklenirken hata:', error);
            throw error;
        }
    }

    function updateStatistics() {
        const totalMembers = currentMembers.length;
        const activeMembers = currentMembers.filter(member => member.membershipType === 'aktif').length;
        const passiveMembers = currentMembers.filter(member => member.membershipType === 'pasif').length;

        document.getElementById('totalMembers').textContent = totalMembers;
        document.getElementById('activeMembers').textContent = activeMembers;
        document.getElementById('activeAlumni').textContent = passiveMembers;
    }

    function renderMemberTable() {
        const tbody = document.getElementById('memberTableBody');
        if (!tbody) return;
        tbody.innerHTML = '';

        // Admin mode kontrolü
        const isAdminMode = localStorage.getItem('mode') === 'admin';
        document.body.classList.toggle('admin-mode', isAdminMode);

        // Mevcut kullanıcı email bilgisi localStorage'dan al
        let currentUserEmail = localStorage.getItem('currentUserEmail') || '';
        
        // Eğer email boşsa, otomatik tespit etmeye çalış
        if (!currentUserEmail) {
            console.log('⚠️ currentUserEmail boş, otomatik tespit ediliyor...');
            const profileData = localStorage.getItem('profileData');
            if (profileData) {
                try {
                    const data = JSON.parse(profileData);
                    if (data.email) {
                        currentUserEmail = data.email;
                        localStorage.setItem('currentUserEmail', currentUserEmail);
                        console.log('✅ Email otomatik tespit edildi:', currentUserEmail);
                    }
                } catch (e) {
                    console.log('Profile data parse hatası:', e);
                }
            }
        }
        
        // Debug: Konsola giriş yapan kullanıcı email bilgisini yazdır
        console.log('=== MEMBERS LIST DEBUG ===');
        console.log('Current user email from localStorage:', currentUserEmail);
        console.log('Admin mode:', isAdminMode);
        console.log('Total members:', currentMembers.length);

        if (currentMembers.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="${isAdminMode ? '7' : '6'}" style="text-align: center; padding: 20px;">
                        <i class="fas fa-users" style="font-size: 48px; color: #ccc; margin-bottom: 10px; display: block;"></i>
                        Henüz kayıtlı üye bulunmuyor.
                    </td>
                </tr>
            `;
            return;
        }

        currentMembers.forEach(member => {
            const statusClass = getStatusClass(member.membershipType);
            const rankBadge = getRankBadge(member.rank);
            const isCurrentUser = member.email && currentUserEmail && member.email.toLowerCase() === currentUserEmail.toLowerCase();
            
            // Debug: Her üye için email karşılaştırmasını konsola yazdır
            console.log(`Member: ${member.name}`);
            console.log(`  - Member email: "${member.email}"`);
            console.log(`  - Current user email: "${currentUserEmail}"`);
            console.log(`  - Is current user: ${isCurrentUser}`);
            if (isCurrentUser) {
                console.log(`  🎯 ICON WILL BE ADDED for ${member.name}`);
            }
            console.log('  ---');
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>
                    <div class="member-cell" onclick="viewMemberProfile('${member.id}')">
                        <div class="member-avatar">
                            ${member.photoUrl ? 
                                `<img src="${member.photoUrl}" alt="${member.name}">` : 
                                `<i class="fas fa-user"></i>`
                            }
                        </div>
                        <div class="member-name-section">
                            <div class="member-name">
                                ${member.name}
                                ${isCurrentUser ? '<i class="fas fa-user-circle" style="color: #800020; margin-left: 8px; font-size: 16px;" title="Bu sizsiniz"></i>' : ''}
                                ${isAdminMode && member.isAdmin ? '<i class="fas fa-cog admin-icon" title="Admin"></i>' : ''}
                            </div>
                            <div class="member-title">${member.institution || 'Kurum belirtilmemiş'}</div>
                        </div>
                    </div>
                </td>
                <td><span class="join-year">${getJoinYear(member.joinDate)}</span></td>
                <td>${rankBadge}</td>
                <td><span class="status-badge ${statusClass}">${member.membershipType}</span></td>
                <td>
                    <div class="position-list">
                        ${getPositionBadges(member.positions || [])}
                    </div>
                </td>
                <td>
                    <div class="contact-buttons">
                        ${member.phone ? `<button class="contact-btn phone" onclick="showContactModal('phone', '${member.phone}', '${member.name}')" title="Telefon"><i class="fas fa-phone"></i></button>` : ''}
                        ${member.email ? `<button class="contact-btn email" onclick="showContactModal('email', '${member.email}', '${member.name}')" title="E-posta"><i class="fas fa-envelope"></i></button>` : ''}
                    </div>
                </td>
                ${isAdminMode ? `
                <td class="admin-only">
                    <button class="manage-btn" onclick="manageMember('${member.id}')" title="Üyeyi Yönet">
                        <i class="fas fa-cog"></i>
                        Yönet
                    </button>
                </td>
                ` : ''}
            `;
            tbody.appendChild(row);
        });
    }

    function getStatusClass(membershipType) {
        switch(membershipType) {
            case 'aktif': return 'status-active';
            case 'pasif': return 'status-inactive';
            case 'fahri': return 'status-honorary';
            case 'aktif mezun': return 'status-active-alumni';
            case 'pasif mezun': return 'status-passive-alumni';
            default: return 'status-unknown';
        }
    }

    function getRankBadge(rank) {
        const rankColors = {
            'Cadet Second Class': 'rank-cadet-2',
            'Cadet First Class': 'rank-cadet-1', 
            'Scholar': 'rank-scholar',
            'Accomplished Scientist': 'rank-scientist',
            'Transcendent': 'rank-transcendent'
        };
        
        const colorClass = rankColors[rank] || 'rank-default';
        return `<span class="rank-badge ${colorClass}">${rank}</span>`;
    }

    function getJoinYear(joinDate) {
        if (!joinDate) return 'Bilinmiyor';
        
        // Firestore timestamp veya string formatını handle et
        let date;
        if (joinDate.seconds) {
            // Firestore timestamp
            date = new Date(joinDate.seconds * 1000);
        } else if (typeof joinDate === 'string') {
            date = new Date(joinDate);
        } else {
            date = joinDate;
        }
        
        return date.getFullYear().toString();
    }

    function getPositionBadges(positions) {
        if (!positions || positions.length === 0) {
            return '<span style="color: #999; font-size: 12px;">Henüz atanmamış</span>';
        }
        
        return positions.map(position => 
            `<span class="position-item">${position}</span>`
        ).join('');
    }

    function getFSACBadge(fsacMembership) {
        const fsacClass = fsacMembership === 'Aktif' ? 'fsac-active' : 'fsac-passive';
        return `<span class="fsac-badge ${fsacClass}">${fsacMembership}</span>`;
    }

    function initializeEventListeners() {
        // Arama işlevi
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', function() {
                filterMembers(this.value);
            });
        }

        // Filtre işlevleri
        const statusFilter = document.getElementById('statusFilter');
        if (statusFilter) {
            statusFilter.addEventListener('change', function() {
                filterMembersByStatus(this.value);
            });
        }

        // Sıralama işlevleri
        const sortButtons = document.querySelectorAll('.sort-btn');
        sortButtons.forEach(btn => {
            btn.addEventListener('click', function() {
                const field = this.dataset.sort;
                sortMembers(field);
            });
        });

        // Yeni üye ekleme butonu
        const addMemberBtn = document.getElementById('addMemberBtn');
        if (addMemberBtn) {
            addMemberBtn.addEventListener('click', function() {
                openAddMemberModal();
            });
        }
    }

    function filterMembers(searchTerm) {
        if (!searchTerm.trim()) {
            currentMembers = [...allMembers];
        } else {
            currentMembers = allMembers.filter(member => 
                member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                member.institution.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        renderMemberTable();
        updateStatistics();
    }

    function filterMembersByStatus(status) {
        if (status === 'all') {
            currentMembers = [...allMembers];
        } else {
            currentMembers = allMembers.filter(member => member.membershipType === status);
        }
        renderMemberTable();
        updateStatistics();
    }

    function sortMembers(field) {
        if (sortField === field) {
            sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
        } else {
            sortField = field;
            sortDirection = 'asc';
        }

        currentMembers.sort((a, b) => {
            let aVal = a[field] || '';
            let bVal = b[field] || '';
            
            if (typeof aVal === 'string') {
                aVal = aVal.toLowerCase();
                bVal = bVal.toLowerCase();
            }

            if (sortDirection === 'asc') {
                return aVal > bVal ? 1 : -1;
            } else {
                return aVal < bVal ? 1 : -1;
            }
        });

        renderMemberTable();
        updateSortIndicators();
    }

    function updateSortIndicators() {
        document.querySelectorAll('.sort-btn').forEach(btn => {
            btn.classList.remove('sort-asc', 'sort-desc');
            if (btn.dataset.sort === sortField) {
                btn.classList.add(sortDirection === 'asc' ? 'sort-asc' : 'sort-desc');
            }
        });
    }

    function showError(message) {
        alert('Hata: ' + message);
    }

    // Global fonksiyonlar
    window.viewMemberProfile = function(memberId) {
        const member = currentMembers.find(m => m.id === memberId);
        if (member) {
            // Profil sayfasına yönlendirme - şimdilik konsola yazdır
            console.log('Profil sayfasına yönlendir:', member);
            alert(`${member.name} profiline yönlendirilecek (henüz eklenmedi)`);
        }
    };

    window.showContactModal = function(type, value, memberName) {
        const modal = document.getElementById('contactModal');
        const title = document.getElementById('contactModalTitle');
        const label = document.getElementById('contactLabel');
        const valueElement = document.getElementById('contactValue');
        const copyBtn = document.getElementById('copyBtn');
        
        title.textContent = `${memberName} - İletişim`;
        
        if (type === 'phone') {
            label.textContent = 'Telefon:';
            valueElement.textContent = value;
        } else if (type === 'email') {
            label.textContent = 'E-posta:';
            valueElement.textContent = value;
        }
        
        // Kopyala butonuna event listener ekle
        copyBtn.onclick = function() {
            navigator.clipboard.writeText(value).then(() => {
                const originalIcon = copyBtn.innerHTML;
                copyBtn.innerHTML = '<i class="fas fa-check"></i>';
                copyBtn.style.background = '#4CAF50';
                
                setTimeout(() => {
                    copyBtn.innerHTML = originalIcon;
                    copyBtn.style.background = '';
                }, 1000);
            }).catch(err => {
                console.error('Kopyalama hatası:', err);
            });
        };
        
        modal.classList.add('show');
    };

    window.manageMember = function(memberId) {
        const member = currentMembers.find(m => m.id === memberId);
        if (member) {
            console.log('Üye yönetimi:', member);
            alert(`${member.name} yönetim paneli açılacak (henüz eklenmedi)`);
        }
    };

    // Modal kapatma
    document.addEventListener('DOMContentLoaded', function() {
        const modal = document.getElementById('contactModal');
        const closeBtn = document.getElementById('contactModalClose');
        
        closeBtn.addEventListener('click', function() {
            modal.classList.remove('show');
        });
        
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                modal.classList.remove('show');
            }
        });
    });
    window.viewMember = function(memberId) {
        window.viewMemberProfile(memberId);
    };

    window.editMember = function(memberId) {
        window.manageMember(memberId);
    };

    window.deleteMember = async function(memberId) {
        if (confirm('Bu üyeyi silmek istediğinizden emin misiniz?')) {
            try {
                await db.collection('users').doc(memberId).delete();
                await loadMembersFromFirestore();
                updateStatistics();
                renderMemberTable();
                console.log('Üye silindi:', memberId);
            } catch (error) {
                console.error('Üye silinirken hata:', error);
                showError('Üye silinirken bir hata oluştu.');
            }
        }
    };

    function openAddMemberModal() {
        console.log('Yeni üye ekleme modalı açılacak');
    }
});