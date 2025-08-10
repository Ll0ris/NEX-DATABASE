// Members Page Script with Firestore Integration

document.addEventListener('DOMContentLoaded', function() {
    let currentMembers = [];
    let allMembers = [];
    let sortField = 'name';
    let sortDirection = 'asc';

    // Initialize the page
    initializeMembersPage();

    async function initializeMembersPage() {
        try {
            // Firebase hazır olana kadar bekle
            let attempts = 0;
            while (!window.firestoreDb && attempts < 50) {
                await new Promise(resolve => setTimeout(resolve, 100));
                attempts++;
            }
            
            if (!window.firestoreDb) {
                console.error('Firebase bağlantısı kurulamadı');
                showError('Veritabanı bağlantısı kurulamadı.');
                return;
            }
            
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
            // Firebase v9+ modular SDK kullanım
            if (!window.firestoreDb || !window.firestoreFunctions) {
                console.error('Firebase bağlantısı henüz hazır değil');
                return;
            }
            
            const { collection, getDocs } = window.firestoreFunctions;
            const usersSnapshot = await getDocs(collection(window.firestoreDb, 'users'));
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
                    membershipType: userData.role || userData.membershipType || 'aktif',
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
        const totalMembers = allMembers.length;
        const activeMembers = allMembers.filter(m => m.membershipType === 'aktif').length;
        const activeAlumni = allMembers.filter(m => m.membershipType === 'aktif mezun').length;
        
        const totalElement = document.getElementById('totalMembers');
        const activeElement = document.getElementById('activeMembers');
        const alumniElement = document.getElementById('activeAlumni');
        
        if (totalElement) totalElement.textContent = totalMembers;
        if (activeElement) activeElement.textContent = activeMembers;
        if (alumniElement) alumniElement.textContent = activeAlumni;
    }

    function renderMemberTable() {
        const tbody = document.getElementById('memberTableBody');
        if (!tbody) return;
        
        tbody.innerHTML = '';
        
        // Admin modunu kontrol et
        const isAdminMode = localStorage.getItem('adminMode') === 'true' || localStorage.getItem('mode') === 'admin';
        
        // Giriş yapan kullanıcının email'ini al
        let currentUserEmail = localStorage.getItem('currentUserEmail') || '';

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
        if (!rank) return '<span class="rank-badge rank-default">-</span>';
        
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

    function initializeEventListeners() {
        // Arama işlevi
        const searchInput = document.getElementById('memberSearch');
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
        const sortableHeaders = document.querySelectorAll('.sortable');
        sortableHeaders.forEach(header => {
            header.addEventListener('click', function() {
                const field = this.dataset.sort;
                sortMembers(field);
            });
        });
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
        document.querySelectorAll('.sortable').forEach(header => {
            header.classList.remove('sort-asc', 'sort-desc');
            if (header.dataset.sort === sortField) {
                header.classList.add(sortDirection === 'asc' ? 'sort-asc' : 'sort-desc');
            }
        });
    }

    function showError(message) {
        console.error('Error:', message);
        alert('Hata: ' + message);
    }

    // Global fonksiyonlar
    window.viewMemberProfile = function(memberId) {
        const member = currentMembers.find(m => m.id === memberId);
        if (member) {
            alert(`${member.name} profiline yönlendirilecek (henüz eklenmedi)`);
        }
    };

    window.showContactModal = function(type, value, memberName) {
        const modal = document.getElementById('contactModal');
        const title = document.getElementById('contactModalTitle');
        const label = document.getElementById('contactLabel');
        const valueElement = document.getElementById('contactValue');
        const copyBtn = document.getElementById('copyBtn');
        
        if (!modal) return;
        
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
            alert(`${member.name} yönetim paneli açılacak (henüz eklenmedi)`);
        }
    };

    window.deleteMember = async function(memberId) {
        if (confirm('Bu üyeyi silmek istediğinizden emin misiniz?')) {
            try {
                // Firebase v9+ modular SDK kullanım
                if (!window.firestoreDb || !window.firestoreFunctions) {
                    console.error('Firebase bağlantısı henüz hazır değil');
                    return;
                }
                
                const { doc, deleteDoc } = window.firestoreFunctions;
                await deleteDoc(doc(window.firestoreDb, 'users', memberId));
                await loadMembersFromFirestore();
                updateStatistics();
                renderMemberTable();
            } catch (error) {
                console.error('Üye silinirken hata:', error);
                showError('Üye silinirken bir hata oluştu.');
            }
        }
    };

    // Modal kapatma işlevleri
    const modal = document.getElementById('contactModal');
    const closeBtn = document.getElementById('contactModalClose');
    
    if (closeBtn) {
        closeBtn.addEventListener('click', function() {
            modal.classList.remove('show');
        });
    }
    
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                modal.classList.remove('show');
            }
        });
    }

    // Test fonksiyonları
    window.setTestUserEmail = function(email) {
        localStorage.setItem('currentUserEmail', email);
        console.log('Test user email set to:', email);
        renderMemberTable();
    };

    window.testWithOguzhanEmail = function() {
        setTestUserEmail('dedeogluoguzhan1603@gmail.com');
    };
    
    // Üye profili görüntüleme fonksiyonu
    window.viewMemberProfile = function(memberId) {
        // Üye bilgilerini bul
        const member = currentMembers.find(m => m.id === memberId);
        if (!member) {
            return;
        }
        
        // Profile sayfasına üye ID'si ile yönlendir (email yerine Firestore document ID kullan)
        window.location.href = `profile.html?viewUser=${member.id}&readOnly=true`;
    };
});
