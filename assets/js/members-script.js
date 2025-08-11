// Members Page Script with Firestore Integration

document.addEventListener('DOMContentLoaded', function() {
    let currentMembers = [];
    let allMembers = [];
    let sortField = 'name';
    let sortDirection = 'asc';
    let backendTotalCount = null; // Backend'den gelen toplam üye sayısı

    // Initialize the page
    initializeMembersPage();

    async function initializeMembersPage() {
        try {
            // Backend'den toplam sayıyı ve listeyi paralel çek
            const [countRes, listRes] = await Promise.all([
                window.backendAPI.get('users.php', { action: 'count' }),
                window.backendAPI.get('users.php', { action: 'list' })
            ]);

            // Toplam sayı
            if (countRes && countRes.success) {
                backendTotalCount = Number(countRes.total || countRes.count || 0);
            } else {
                backendTotalCount = null;
            }

            // Liste
            const items = (listRes && listRes.success && Array.isArray(listRes.items)) ? listRes.items : [];
            allMembers = items.map(normalizeUserFromBackend);
            currentMembers = [...allMembers];

            updateStatistics();
            renderMemberTable();
            initializeEventListeners();
        } catch (error) {
            console.error('Üyeler yüklenirken hata:', error);
            showError('Üyeler yüklenirken bir hata oluştu.');
        }
    }

    function normalizeUserFromBackend(row) {
        // Backend alanlarını UI için normalize et
        // Olası kolonlar: id, name, email, phone, photo_url, institution, rank, role, position, created_at/createdAt
        const createdAtRaw = row.createdAt || row.created_at || row.created_at_ms || null;
        let createdAt;
        if (typeof createdAtRaw === 'number') {
            createdAt = new Date(createdAtRaw);
        } else if (typeof createdAtRaw === 'string') {
            const parsed = Date.parse(createdAtRaw);
            createdAt = isNaN(parsed) ? null : new Date(parsed);
        } else if (createdAtRaw && createdAtRaw.seconds) {
            // Firestore benzeri destek
            createdAt = new Date(createdAtRaw.seconds * 1000);
        } else {
            createdAt = null;
        }

        // position tek string veya liste olabilir
        let positions = row.positions || row.position || [];
        if (typeof positions === 'string') {
            positions = positions.split(',').map(s => s.trim()).filter(Boolean);
        }

        return {
            id: row.id ?? row.user_id ?? row.uid ?? null,
            name: row.name || '',
            email: row.email || '',
            phone: row.phone || '',
            photoUrl: row.photo_url || row.photoUrl || null,
            institution: row.institution || '',
            rank: row.rank || '',
            role: row.role || '',
            positions: positions,
            createdAt: createdAt
        };
    }

    function updateStatistics() {
        const totalMembers = (backendTotalCount !== null && !isNaN(backendTotalCount)) ? backendTotalCount : allMembers.length;

        // Role alanından türet (uygunsa)
        const activeMembers = allMembers.filter(m => normalizeRole(m.role) === 'active').length;
        const activeAlumni = allMembers.filter(m => normalizeRole(m.role) === 'active_alumni').length;
        
        const totalElement = document.getElementById('totalMembers');
        const activeElement = document.getElementById('activeMembers');
        const alumniElement = document.getElementById('activeAlumni');
        
        if (totalElement) totalElement.textContent = totalMembers;
        if (activeElement) activeElement.textContent = activeMembers;
        if (alumniElement) alumniElement.textContent = activeAlumni;
    }

    function normalizeRole(role) {
        if (!role) return 'unknown';
        const r = String(role).toLowerCase();
        if (r === 'aktif' || r === 'active') return 'active';
        if (r === 'pasif' || r === 'inactive') return 'inactive';
        if (r === 'fahri' || r === 'honorary') return 'honorary';
        if (r === 'aktif mezun' || r === 'active_alumni' || r === 'active alumni') return 'active_alumni';
        if (r === 'pasif mezun' || r === 'passive_alumni' || r === 'passive alumni') return 'passive_alumni';
        return r;
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
            const statusClass = getStatusClass(normalizeRole(member.role));
            const rankBadge = getRankBadge(member.rank);
            const isCurrentUser = member.email && currentUserEmail && member.email.toLowerCase() === currentUserEmail.toLowerCase();
            const joinYear = getJoinYear(member.createdAt);
            
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
                <td><span class="join-year">${joinYear}</span></td>
                <td>${rankBadge}</td>
                <td><span class="status-badge ${statusClass}">${member.role || '-'}</span></td>
                <td>
                    <div class="position-list">
                        ${getPositionBadges(member.positions || [])}
                    </div>
                </td>
                <td>
                    <div class="contact-buttons">
                        ${member.email ? `<button class="contact-btn email" onclick="showContactModal('email', '${member.email}', '${member.name}')" title="E-posta"><i class="fas fa-envelope"></i></button>` : ''}
                        ${member.phone ? `<button class="contact-btn phone" onclick="showContactModal('phone', '${member.phone}', '${member.name}')" title="Telefon"><i class="fas fa-phone"></i></button>` : ''}
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

    function getStatusClass(roleNorm) {
        switch(roleNorm) {
            case 'active': return 'status-active';
            case 'inactive': return 'status-inactive';
            case 'honorary': return 'status-honorary';
            case 'active_alumni': return 'status-active-alumni';
            case 'passive_alumni': return 'status-passive-alumni';
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

    function getJoinYear(createdAt) {
        if (!createdAt) return 'Bilinmiyor';
        try {
            const d = (createdAt instanceof Date) ? createdAt : new Date(createdAt);
            if (isNaN(d.getTime())) return 'Bilinmiyor';
            return d.getFullYear().toString();
        } catch (_) {
            return 'Bilinmiyor';
        }
    }

    function getPositionBadges(positions) {
        if (!positions) return '<span style="color: #999; font-size: 12px;">Henüz atanmamış</span>';
        let list = positions;
        if (typeof list === 'string') {
            list = list.split(',').map(s => s.trim()).filter(Boolean);
        }
        if (!Array.isArray(list) || list.length === 0) {
            return '<span style="color: #999; font-size: 12px;">Henüz atanmamış</span>';
        }
        return list.map(position => 
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
            currentMembers = allMembers.filter(member => normalizeRole(member.role) === status);
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

    // deleteMember sonrası listeyi backend'den yenile
    window.deleteMember = async function(memberId) {
        if (confirm('Bu üyeyi silmek istediğinizden emin misiniz?')) {
            try {
                if (!window.backendAPI) {
                    console.error('Backend API hazır değil');
                    return;
                }
                await window.backendAPI.post('users.php', { action: 'delete', id: memberId });
                // Yeniden yükle
                const [countRes, listRes] = await Promise.all([
                    window.backendAPI.get('users.php', { action: 'count' }),
                    window.backendAPI.get('users.php', { action: 'list' })
                ]);
                backendTotalCount = (countRes && countRes.success) ? Number(countRes.total || 0) : null;
                const items = (listRes && listRes.success && Array.isArray(listRes.items)) ? listRes.items : [];
                allMembers = items.map(normalizeUserFromBackend);
                currentMembers = [...allMembers];
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
