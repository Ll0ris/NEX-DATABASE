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
            if (countRes?.success) {
                backendTotalCount = Number(countRes.total || countRes.count || 0);
            } else {
                backendTotalCount = null;
            }

            // Liste
            const items = (listRes?.success && Array.isArray(listRes.items)) ? listRes.items : [];
            allMembers = items.map(normalizeUserFromBackend);
            currentMembers = [...allMembers];

            updateStatistics();
            renderMemberTable();
            updateSortIndicators();
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
    } else if (createdAtRaw?.seconds) {
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
            rank: row.rank_name || '',
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
        
    // Admin modunu kontrol et (gerçek admin ve admin modu birlikte gerekli)
    const isAdminMode = (localStorage.getItem('adminMode') === 'admin') && (localStorage.getItem('realAdminAccess') === 'true');
        
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
    if (!rank) {
        return '<span class="rank-badge rank-default">-</span>';
    }
        
        const rankColors = {
            'Cadet Second Class': 'rank-cadet-2',
            'Cadet First Class': 'rank-cadet-1', 
            'Scholar': 'rank-scholar',
            'Accomplished Scientist': 'rank-scientist',
            'Transcendent': 'rank-transcendent'
        };
        
    const colorClass = rankColors[rank] || 'rank-default';
    const display = String(rank).toLocaleUpperCase('en-US');
    return `<span class="rank-badge ${colorClass}">${display}</span>`;
    }

    function getJoinYear(createdAt) {
        if (!createdAt) return 'Bilinmiyor';
        try {
            const d = (createdAt instanceof Date) ? createdAt : new Date(createdAt);
            if (isNaN(d.getTime())) return 'Bilinmiyor';
            return d.getFullYear().toString();
        } catch (e) {

            console.warn('getJoinYear warning:', e);
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

        // Admin'lere özel "Üye Ekle" butonu
        const addBtn = document.getElementById('addMemberBtn');
        const isRealAdmin = (localStorage.getItem('userRole') || '').toLowerCase() === 'admin';
        const isAdminMode = (localStorage.getItem('adminMode') === 'admin') && (localStorage.getItem('realAdminAccess') === 'true');
        if (addBtn) {
            addBtn.style.display = (isRealAdmin && isAdminMode) ? 'inline-flex' : 'none';
            addBtn.addEventListener('click', openAddMemberModal);
        }

        // Add Member modal kapatma
        const addModal = document.getElementById('addMemberModal');
        const closeAdd = document.getElementById('closeAddMemberModal');
        const cancelAdd = document.getElementById('cancelAddMember');
        if (closeAdd) closeAdd.addEventListener('click', closeAddMemberModal);
        if (cancelAdd) cancelAdd.addEventListener('click', closeAddMemberModal);
        if (addModal) {
            addModal.addEventListener('click', function(e) {
                if (e.target === addModal) closeAddMemberModal();
            });
        }

        // Add Member kaydet
        const saveAdd = document.getElementById('saveAddMember');
        if (saveAdd) saveAdd.addEventListener('click', submitAddMemberForm);

        // React to global admin mode changes
        document.addEventListener('adminModeChanged', function(e) {
            try {
                const addBtn = document.getElementById('addMemberBtn');
                const isAdminUser = ((localStorage.getItem('userRole') || '').toLowerCase() === 'admin');
                const mode = localStorage.getItem('adminMode');
                const hasAccess = localStorage.getItem('realAdminAccess') === 'true';
                const inAdmin = isAdminUser && hasAccess && mode === 'admin';
                if (addBtn) addBtn.style.display = inAdmin ? 'inline-flex' : 'none';
                // Sync table admin-only column visibility via re-render
                renderMemberTable();
                updateSortIndicators();
            } catch (err) {
                console.warn('adminModeChanged handling warning:', err);
            }
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
    updateSortIndicators();
    }

    function filterMembersByStatus(status) {
        if (status === 'all') {
            currentMembers = [...allMembers];
        } else if (status === 'alumni') {
            currentMembers = allMembers.filter(member => {
                const r = normalizeRole(member.role);
                return r === 'active_alumni' || r === 'passive_alumni';
            });
        } else {
            currentMembers = allMembers.filter(member => normalizeRole(member.role) === status);
        }
        renderMemberTable();
        updateStatistics();
        updateSortIndicators();
    }

    // Rank and status ordering for meaningful sort
    const rankOrder = {
        'Cadet Second Class': 1,
        'Cadet First Class': 2,
        'Scholar': 3,
        'Accomplished Scientist': 4,
        'Transcendent': 5
    };

    // statusOrder removed (unused)

    function getComparableValue(member, field) {
        switch (field) {
            case 'name': {
                return (member.name || '').toLowerCase();
            }
            case 'joinYear': {
                let d = null;
                if (member.createdAt instanceof Date) {
                    d = member.createdAt;
                } else if (member.createdAt) {
                    d = new Date(member.createdAt);
                }
                const y = (d && !isNaN(d.getTime())) ? d.getFullYear() : 0;
                return y;
            }
            case 'rank': {
                const r = member.rank || '';
                const order = rankOrder[r] ?? 999;
                return order;
            }
            case 'status': {
                return (member.role ?? '').toString().toLowerCase();
            }
            default: {
                const v = member[field];
                if (typeof v === 'string') return v.toLowerCase();
                if (v instanceof Date) return v.getTime();
                return v ?? '';
            }
        }
    }

    function sortMembers(field) {
        if (sortField === field) {
            sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
        } else {
            sortField = field;
            sortDirection = 'asc';
        }

        currentMembers.sort((a, b) => {
            const aVal = getComparableValue(a, sortField);
            const bVal = getComparableValue(b, sortField);
            if (aVal === bVal) return 0;
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
        document.querySelectorAll('.member-table thead th.sortable').forEach(header => {
            header.classList.remove('sort-asc', 'sort-desc', 'sorted');
            const icon = header.querySelector('i');
            if (icon) {
                icon.classList.remove('fa-sort-up', 'fa-sort-down');
                icon.classList.add('fa-sort');
            }
            if (header.dataset.sort === sortField) {
                header.classList.add('sorted');
                header.classList.add(sortDirection === 'asc' ? 'sort-asc' : 'sort-desc');
                if (icon) {
                    icon.classList.remove('fa-sort');
                    icon.classList.add(sortDirection === 'asc' ? 'fa-sort-up' : 'fa-sort-down');
                }
                // accessibility
                header.setAttribute('aria-sort', sortDirection === 'asc' ? 'ascending' : 'descending');
            } else {
                header.removeAttribute('aria-sort');
            }
        });
    }

    function showError(message) {
        console.error('Error:', message);
        alert('Hata: ' + message);
    }

    function showInfo(message) {
        alert(message);
    }

    // Helpers for Add Member form
    function s(val) { return val == null ? '' : String(val); }
    function getTrim(fd, name) { return s(fd.get(name)).trim(); }
    function getOptionalSelect(fd, name, def) { const v = s(fd.get(name)).trim(); return v || def; }
    function isEmailValid(email) { return /.+@.+\..+/.test(email); }
    function isDigits(x) { return /^\d+$/.test(x); }

    async function refreshMembersFromBackend() {
        const [countRes, listRes] = await Promise.all([
            window.backendAPI.get('users.php', { action: 'count' }),
            window.backendAPI.get('users.php', { action: 'list' })
        ]);
        backendTotalCount = (countRes?.success) ? Number(countRes.total || countRes.count || 0) : null;
        const items = (listRes?.success && Array.isArray(listRes.items)) ? listRes.items : [];
        allMembers = items.map(normalizeUserFromBackend);
        currentMembers = [...allMembers];
        updateStatistics();
        renderMemberTable();
        updateSortIndicators();
    }

    function collectAddMemberValues(fd) {
        const values = {
            name: getTrim(fd, 'name'),
            fullName: getTrim(fd, 'fullName'),
            email: getTrim(fd, 'email'),
            password: s(fd.get('password')),
            department: getTrim(fd, 'department'),
            faculty: getTrim(fd, 'faculty'),
            institution: getTrim(fd, 'institution'),
            phone: getTrim(fd, 'phone'),
            photo_url: getTrim(fd, 'photo_url'),
            role: getOptionalSelect(fd, 'role', 'user'),
            position: getTrim(fd, 'position'),
            status: getOptionalSelect(fd, 'status', 'active'),
            title_prefix: getTrim(fd, 'title_prefix'),
            rank_id_raw: s(fd.get('rank_id')).trim()
        };
        values.rank_id = values.rank_id_raw !== '' ? values.rank_id_raw : null;
        return values;
    }

    function validateAddMemberValues(v) {
        const missing = [];
        if (!v.name) missing.push('Ad (name)');
        if (!v.fullName) missing.push('Ad Soyad (fullName)');
        if (!v.email) missing.push('E-posta (email)');
        if (missing.length) return { ok: false, message: 'Zorunlu alanlar boş bırakılamaz: ' + missing.join(', ') };
        if (!isEmailValid(v.email)) return { ok: false, message: 'Geçerli bir e-posta adresi giriniz.' };
        if (v.password && v.password.length < 6) return { ok: false, message: 'Parola en az 6 karakter olmalıdır.' };
        if (v.rank_id !== null && !isDigits(v.rank_id)) return { ok: false, message: 'Rütbe ID (rank_id) sadece sayısal olmalıdır.' };
        return { ok: true };
    }

    // Map status to Turkish student labels for DB persistence
    function mapStatusForDB(statusVal) {
        const sv = (statusVal || '').toString().trim().toLowerCase();
        if (sv === 'active' || sv === 'aktif' || sv === 'aktif öğrenci' || sv === 'aktif ogrenci') return 'Aktif Öğrenci';
        if (sv === 'inactive' || sv === 'pasif' || sv === 'pasif öğrenci' || sv === 'pasif ogrenci') return 'Pasif Öğrenci';
        return statusVal; // leave other custom statuses as-is
    }

    // Normalize role to canonical codes in case dropdown values were localized
    function normalizeRoleForCreate(roleVal) {
        const rv = (roleVal || '').toString().trim().toLowerCase();
        if (rv === 'aktif öğrenci' || rv === 'aktif ogrenci' || rv === 'aktif' || rv === 'active') return 'active';
        if (rv === 'pasif öğrenci' || rv === 'pasif ogrenci' || rv === 'pasif' || rv === 'inactive') return 'inactive';
        if (rv === 'aktif mezun' || rv === 'active alumni' || rv === 'active_alumni') return 'active_alumni';
        if (rv === 'pasif mezun' || rv === 'passive alumni' || rv === 'passive_alumni') return 'passive_alumni';
        if (rv === 'fahri' || rv === 'honorary') return 'honorary';
        if (rv === 'yönetici' || rv === 'yonetici' || rv === 'admin') return 'admin';
        if (rv === 'kullanıcı' || rv === 'kullanici' || rv === 'user') return 'user';
        return roleVal; // unknown stays as provided
    }

    function buildCreatePayload(v) {
        return {
            action: 'create',
            name: v.name,
            fullName: v.fullName,
            email: v.email,
            ...(v.password ? { password: v.password } : {}),
            ...(v.department ? { department: v.department } : {}),
            ...(v.faculty ? { faculty: v.faculty } : {}),
            ...(v.institution ? { institution: v.institution } : {}),
            ...(v.phone ? { phone: v.phone } : {}),
            ...(v.photo_url ? { photo_url: v.photo_url } : {}),
            ...(v.role ? { role: normalizeRoleForCreate(v.role) } : {}),
            ...(v.position ? { position: v.position } : {}),
            ...(v.status ? { status: mapStatusForDB(v.status) } : {}),
            ...(v.title_prefix ? { title_prefix: v.title_prefix } : {}),
            ...(v.rank_id !== null ? { rank_id: v.rank_id } : {})
        };
    }

    function openAddMemberModal() {
        const modal = document.getElementById('addMemberModal');
        const form = document.getElementById('addMemberForm');
        if (form) form.reset();
        if (modal) {
            modal.style.display = 'flex';
            setTimeout(() => modal.classList.add('show'), 10);
        }
    }

    function closeAddMemberModal() {
        const modal = document.getElementById('addMemberModal');
        if (modal) {
            modal.classList.remove('show');
            setTimeout(() => { modal.style.display = 'none'; }, 150);
        }
    }

    async function submitAddMemberForm() {
        const form = document.getElementById('addMemberForm');
        if (!form) return;
        const fd = new FormData(form);
        const values = collectAddMemberValues(fd);
        const valid = validateAddMemberValues(values);
        if (!valid.ok) { showError(valid.message); return; }

        const payload = buildCreatePayload(values);
        try {
            if (!window.backendAPI) throw new Error('Backend API hazır değil');
            const res = await window.backendAPI.post('users.php?action=create', payload);
            if (!res?.success) throw new Error(res?.error || res?.message || 'Oluşturma başarısız');
            await refreshMembersFromBackend();
            closeAddMemberModal();
            showInfo(res.temporaryPassword ? ('Üye eklendi. Geçici parola: ' + res.temporaryPassword) : 'Üye eklendi.');
        } catch (err) {
            showError(err?.message || String(err));
        }
    }

    // Global fonksiyonlar
    window.viewMemberProfile = function(memberId) {
        const member = currentMembers.find(m => m.id === memberId);
        if (!member) return;

        const currentUserEmail = (localStorage.getItem('currentUserEmail') || '').toLowerCase();
        const memberEmail = (member.email || '').toLowerCase();
        const isSelf = memberEmail && currentUserEmail && memberEmail === currentUserEmail;

        // Kullanıcının admin olup olmadığını kontrol et
        const isAdminUser = ((localStorage.getItem('userRole') || '').toLowerCase() === 'admin');
        const isAdminModeActive = (localStorage.getItem('adminMode') === 'admin') && (localStorage.getItem('realAdminAccess') === 'true');

        // Kendi profiline git
        if (isSelf) {
            window.location.href = 'profile.html';
            return;
        }

        // Adminler diğer profilleri görebilir; admin modunda düzenleyebilir
        if (isAdminUser && member.email) {
            const base = 'profile.html?viewUser=' + encodeURIComponent(member.email);
            if (isAdminModeActive) {
                // Düzenlenebilir görünüm
                window.location.href = base + '&readOnly=false';
            } else {
                // Salt okunur görünüm
                window.location.href = base + '&readOnly=true';
            }
            return;
        }

        // Admin değilse kısıtla
        alert('Bu özelliği yalnızca admin kullanıcılar kullanabilir.');
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
        
        // Kopyala butonuna event listener ekle (daha az iç içe fonksiyonla)
        copyBtn.onclick = async function() {
            try {
                await navigator.clipboard.writeText(value);
                const originalIcon = copyBtn.innerHTML;
                copyBtn.innerHTML = '<i class="fas fa-check"></i>';
                copyBtn.style.background = '#4CAF50';
                setTimeout(() => {
                    copyBtn.innerHTML = originalIcon;
                    copyBtn.style.background = '';
                }, 1000);
            } catch (err) {
                console.error('Kopyalama hatası:', err);
            }
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
                backendTotalCount = (countRes?.success) ? Number(countRes.total || 0) : null;
                const items = (listRes?.success && Array.isArray(listRes.items)) ? listRes.items : [];
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
});

