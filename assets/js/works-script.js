// Works Management System
class WorksManager {
    constructor() {
        this.currentWorks = [];
        this.currentUsers = [];
        this.selectedAuthors = [];
        this.editingWorkId = null;
        this.currentPage = 1;
        this.totalPages = 1;
        this.itemsPerPage = 12;
        this.searchQuery = '';
    // viewed profile cache
    this.profileFullName = null;
    this.profileEmail = null;
    // authors modal state
    this.authorsAll = [];
    this._authorsSearchTimer = null;
    // async init will be called after DOMContentLoaded
    }

    async init() {
        this.bindEvents();
        await this.loadCurrentUser();
        this.checkAdminAccess();
        await this.loadWorks();
    }

    checkAdminAccess() {
        // Check if user has admin access and is in admin mode
        const urlParams = new URLSearchParams(window.location.search);
        const isReadOnly = urlParams.get('readOnly') === 'true';
        const adminMode = localStorage.getItem('adminMode');
        const hasRealAdminAccess = localStorage.getItem('realAdminAccess') === 'true';
        const isAdminMode = adminMode === 'admin' && hasRealAdminAccess;
        
        // Hide add buttons if in read-only mode and not admin
        if (isReadOnly && !isAdminMode) {
            const addWorkBtn = document.getElementById('addWorkBtn');
            
            if (addWorkBtn) addWorkBtn.style.display = 'none';
        }
        
        this.canEdit = !isReadOnly || isAdminMode;
    }

    bindEvents() {
        // Modal events
        const addWorkBtn = document.getElementById('addWorkBtn');
        const workModal = document.getElementById('workModal');
        const workModalClose = document.getElementById('workModalClose');
        const workModalCancel = document.getElementById('workModalCancel');
        const workForm = document.getElementById('workForm');
    // Authors modal controls
    this.openAuthorsBtn = document.getElementById('openAuthorsBtn');
    this.authorsModal = document.getElementById('authorsModal');
    this.authorsModalClose = document.getElementById('authorsModalClose');
    this.authorsModalCancel = document.getElementById('authorsModalCancel');
    this.authorsModalSave = document.getElementById('authorsModalSave');
    this.authorsModalSearch = document.getElementById('authorsModalSearch');
    this.authorsModalList = document.getElementById('authorsModalList');
    this.authorsModalSelected = document.getElementById('authorsModalSelected');
    this.authorsSummary = document.getElementById('authorsSummary');

        if (addWorkBtn) {
            addWorkBtn.addEventListener('click', () => this.openWorkModal());
        }

        if (workModalClose) {
            workModalClose.addEventListener('click', () => this.closeWorkModal());
        }

        if (workModalCancel) {
            workModalCancel.addEventListener('click', () => this.closeWorkModal());
        }

        if (workModal) {
            workModal.addEventListener('click', (e) => {
                if (e.target === workModal) {
                    this.closeWorkModal();
                }
            });
        }

        if (workForm) {
            workForm.addEventListener('submit', (e) => this.handleWorkSubmit(e));
        }

        // Search
        const searchInput = document.getElementById('worksSearchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchQuery = e.target.value.trim();
                this.currentPage = 1;
                this.loadWorks();
            });
        }

        // Authors modal open/close
        if (this.openAuthorsBtn) {
            this.openAuthorsBtn.addEventListener('click', () => this.openAuthorsModal());
        }
        if (this.authorsModalClose) {
            this.authorsModalClose.addEventListener('click', () => this.closeAuthorsModal());
        }
        if (this.authorsModalCancel) {
            this.authorsModalCancel.addEventListener('click', () => this.closeAuthorsModal());
        }
        if (this.authorsModal) {
            this.authorsModal.addEventListener('click', (e) => {
                if (e.target === this.authorsModal) this.closeAuthorsModal();
            });
        }
        if (this.authorsModalSave) {
            this.authorsModalSave.addEventListener('click', () => this.saveAuthorsSelection());
        }
        if (this.authorsModalSearch) {
            this.authorsModalSearch.addEventListener('input', () => this.searchAuthorsInModal());
            this.authorsModalSearch.addEventListener('focus', () => this.searchAuthorsInModal());
        }

        // Pagination
        const prevPageBtn = document.getElementById('prevPageBtn');
        const nextPageBtn = document.getElementById('nextPageBtn');

        if (prevPageBtn) {
            prevPageBtn.addEventListener('click', () => this.prevPage());
        }

        if (nextPageBtn) {
            nextPageBtn.addEventListener('click', () => this.nextPage());
        }

        // Keyboard events
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && workModal?.classList.contains('show')) {
                this.closeWorkModal();
            }
        });
    }

    openAuthorsModal() {
        if (!this.authorsModal) return;
        this.renderAuthorsModalSelected();
        if (this.authorsModalSearch) {
            this.authorsModalSearch.value = '';
        }
        this.searchAuthorsInModal();
        this.authorsModal.classList.add('show');
        document.body.style.overflow = 'hidden';
    }

    closeAuthorsModal() {
        if (!this.authorsModal) return;
        this.authorsModal.classList.remove('show');
        document.body.style.overflow = '';
    }

    renderAuthorsModalSelected() {
        if (!this.authorsModalSelected) return;
        this.authorsModalSelected.innerHTML = this.selectedAuthors.map(a => `
            <div class="selected-author">
                <span>${this.escapeHtml(a.name)}</span>
                <button type="button" class="remove-author" data-remove-id="${a.id}"><i class="fas fa-times"></i></button>
            </div>
        `).join('');
        this.authorsModalSelected.querySelectorAll('.remove-author').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = parseInt(btn.getAttribute('data-remove-id'));
                this.removeAuthor(id);
                this.renderAuthorsModalSelected();
                this.searchAuthorsInModal();
            });
        });
        this.updateAuthorsSummary();
    }

    updateAuthorsSummary() {
        if (this.authorsSummary) {
            this.authorsSummary.textContent = `${this.selectedAuthors.length} yazar seçildi`;
        }
    }

    async searchAuthorsInModal() {
        const query = this.authorsModalSearch?.value?.trim() || '';
        // debounce rapid typing
        if (this._authorsSearchTimer) clearTimeout(this._authorsSearchTimer);
        this._authorsSearchTimer = setTimeout(() => {
            this.loadAuthorsList(query);
        }, 250);
    }

    async loadAuthorsList(query) {
        try {
            const data = await window.backendAPI.get('users.php', {
                action: 'list',
                search: query || '',
                limit: 100
            });
            const items = (data.success ? (data.items || []) : [])
                .filter(u => !this.isSameId(u.id, this.currentUser?.id));
            this.authorsAll = items;
            const filtered = this.filterAuthorsLocal(items, query);
            this.renderAuthorsModalList(filtered);
        } catch (e) {
            console.error('Error loading authors list:', e);
            const filtered = this.filterAuthorsLocal(this.authorsAll || [], query);
            this.renderAuthorsModalList(filtered);
        }
    }

    filterAuthorsLocal(list, query) {
        if (!query) return list;
        const q = this.normalizeText(query);
        return list.filter(u => {
            const name = this.normalizeText(u.fullName || '');
            const inst = this.normalizeText(u.institution || '');
            return name.includes(q) || inst.includes(q);
        });
    }

    normalizeText(text) {
        const base = (text || '').toString().toLowerCase();
        if (typeof ''.normalize === 'function') {
            return base.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        }
        return base;
    }

    // ID helpers to avoid string/number mismatch issues
    isSameId(a, b) {
        if (a === undefined || a === null || b === undefined || b === null) return false;
        return String(a) === String(b);
    }

    normalizeName(name) {
        return this.normalizeText((name || '').toString().trim());
    }

    authorMatchesUser(author, user) {
        if (!author || !user) return false;
        if (this.isSameId(author.id, user.id)) return true;
        return this.normalizeName(author.name) === this.normalizeName(user.fullName || '');
    }

    findSelectedAuthorByUser(user) {
        return this.selectedAuthors.find(a => this.authorMatchesUser(a, user));
    }

    renderAuthorsModalList(users) {
        if (!this.authorsModalList) return;
        if (!users || users.length === 0) {
            this.authorsModalList.innerHTML = '<div class="authors-modal-item">Kullanıcı bulunamadı</div>';
            return;
        }
        this.authorsModalList.innerHTML = users.map(u => {
            const selected = !!this.findSelectedAuthorByUser(u);
            return `
                <div class="authors-modal-item">
                    <div class="authors-modal-info">
                        <div class="authors-modal-name">${this.escapeHtml(u.fullName)}</div>
                        <div class="authors-modal-institution">${this.escapeHtml(u.institution || 'Kurum belirtilmemiş')}</div>
                    </div>
                    <div class="authors-modal-action">
                        <button type="button" class="toggle-select ${selected ? 'active' : ''}" data-user-id="${u.id}" data-user-name="${this.escapeHtml(u.fullName)}">
                            ${selected ? 'Seçildi' : 'Seç'}
                        </button>
                    </div>
                </div>
            `;
        }).join('');

    this.authorsModalList.querySelectorAll('.toggle-select').forEach(btn => {
            btn.addEventListener('click', () => {
                const idRaw = btn.getAttribute('data-user-id');
                const id = idRaw ? parseInt(idRaw, 10) : null;
                const name = btn.getAttribute('data-user-name');
                const exists = !!this.selectedAuthors.find(a => this.isSameId(a.id, id) || this.normalizeName(a.name) === this.normalizeName(name));
                if (exists) this.removeAuthorByKey(id, name); else this.addAuthor(id, name);
                this.renderAuthorsModalSelected();
                this.searchAuthorsInModal();
            });
        });
    }

    saveAuthorsSelection() {
        // Just close modal; authors already reflected in selectedAuthors
        this.updateSelectedAuthors();
        this.updateAuthorsSummary();
        this.closeAuthorsModal();
    }

    async loadCurrentUser() {
        try {
            // Prefer session-based current user to avoid relying on localStorage
            const data = await window.backendAPI.get('users.php', { action: 'profile' });

            // Backend returns { success: true, item: { ...user } }
            // but support { user } as well for compatibility
            if (data?.success && (data.item || data.user)) {
                const user = data.item || data.user;
                const currentUserNameEl = document.getElementById('currentUserName');
                if (currentUserNameEl) {
                    currentUserNameEl.textContent = user.fullName || 'Mevcut Kullanıcı';
                }
                this.currentUser = user;
                // cache email for other parts of the app if needed
                if (user.email) {
                    try {
                        localStorage.setItem('currentUserEmail', user.email);
                    } catch (e) {
                        console.debug('Could not cache currentUserEmail:', e?.message || e);
                    }
                }
            } else {
                console.warn('Current user could not be determined from session');
                this.currentUser = null;
            }
        } catch (error) {
            console.error('Error loading current user:', error);
            this.currentUser = null;
        }
    }

    async loadWorks() {
        this.showLoading();
        
        try {
            // First get current user info if not already loaded
            if (!this.currentUser) {
                await this.loadCurrentUser();
            }

            console.log('Current User:', this.currentUser);
            
            // Prefer fullName-based query so co-authored works appear too
            const targetFullName = await this.getTargetFullName();
            if (targetFullName) {
                const ok = await this.loadWorksByFullName(targetFullName);
                if (ok) return; // rendered
                // fall back to user_id if fullName search failed
            }

            if (!this.currentUser?.id) {
                throw new Error('Unable to get user information');
            }
            await this.loadUserWorks(this.currentUser.id);
        } catch (error) {
            console.error('Error loading works:', error);
            this.showError('Çalışmalar yüklenirken hata oluştu: ' + error.message);
        } finally {
            this.hideLoading();
        }
    }

    async getTargetFullName() {
        try {
            // If we've already resolved it, reuse
            if (this.profileFullName && this.profileFullName.trim()) return this.profileFullName.trim();

            const urlParams = new URLSearchParams(window.location.search);
            const viewUserParam = urlParams.get('viewUser'); // email of viewed profile
            const isReadOnly = urlParams.get('readOnly') === 'true';

            // 1) If viewing someone (or read-only profile view), try DOM first
            if (viewUserParam || isReadOnly) {
                const nameFromDom = document.querySelector('.full-name')?.textContent?.trim();
                if (nameFromDom) {
                    this.profileFullName = nameFromDom;
                    this.profileEmail = viewUserParam || null;
                    return this.profileFullName;
                }

                // 2) Try backend profile endpoint to resolve full name
                if (viewUserParam) {
                    try {
                        const res = await window.backendAPI.get('profile.php', { action: 'get', viewUser: viewUserParam });
                        const user = res?.user;
                        const fn = user?.full_name || user?.fullName || user?.name;
                        if (fn) {
                            this.profileFullName = fn.toString().trim();
                            this.profileEmail = viewUserParam;
                            return this.profileFullName;
                        }
                    } catch (e) {
                        console.warn('Profile full name fetch failed:', e);
                    }
                }
            }

            // 3) Fallback to current user's full name if available
            const cuName = this.currentUser?.full_name || this.currentUser?.fullName || this.currentUser?.name;
            if (cuName && cuName.toString().trim()) {
                this.profileFullName = cuName.toString().trim();
                return this.profileFullName;
            }
        } catch (err) {
            console.warn('getTargetFullName error:', err);
        }
        return null;
    }

    async loadWorksByFullName(fullName) {
        try {
            const response = await window.backendAPI.get('works.php', {
                action: 'get',
                fullName: fullName
            });
            if (response?.success) {
                this.currentWorks = response.items || [];
                this.renderWorks();
                return true;
            }
        } catch (error) {
            console.warn('FullName works fetch failed, will try user_id:', error?.message || error);
        }
        return false;
    }

    async loadUserWorks(userId) {
        try {
            const response = await window.backendAPI.get('works.php', {
                action: 'get',
                user_id: userId
            });

            if (response.success) {
                this.currentWorks = response.items || [];
                this.renderWorks();
            } else {
                throw new Error(response.error || 'Unknown error');
            }
        } catch (error) {
            console.error('Error loading user works:', error);
            this.showError('Çalışmalar yüklenirken hata oluştu: ' + error.message);
        }
    }

    renderWorks() {
        const worksGrid = document.getElementById('worksGrid');
        const worksEmpty = document.getElementById('worksEmpty');

        if (!worksGrid || !worksEmpty) return;

        // Filter works based on search query
        let filteredWorks = this.currentWorks;
        if (this.searchQuery) {
            const query = this.searchQuery.toLowerCase();
            filteredWorks = this.currentWorks.filter(work => 
                work.name.toLowerCase().includes(query) ||
                work.subject.toLowerCase().includes(query) ||
                work.authors?.toLowerCase().includes(query)
            );
        }

        if (filteredWorks.length === 0) {
            worksGrid.style.display = 'none';
            worksEmpty.style.display = 'block';
            return;
        }

        worksEmpty.style.display = 'none';
        worksGrid.style.display = 'grid';

        worksGrid.innerHTML = filteredWorks.map(work => this.createWorkCard(work)).join('');

        // Bind action events
        this.bindWorkCardEvents();
    }

    createWorkCard(work) {
        const hasLink = work.link && work.link.trim() !== '';
        const authors = work.authors && work.authors.trim() !== '' ? work.authors : 'Tek yazar';

        // Show action buttons only if user can edit
        const actionButtons = this.canEdit ? `
            <div class="work-actions">
                <button class="work-action-btn edit-btn" data-action="edit" data-work-id="${work.id}" title="Düzenle">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="work-action-btn delete-btn" data-action="delete" data-work-id="${work.id}" title="Sil">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        ` : '';

        return `
            <div class="work-card" data-work-id="${work.id}">
                <div class="work-header">
                    <div class="work-info">
                        <h3 class="work-title">${this.escapeHtml(work.name)}</h3>
                        <p class="work-subject">${this.escapeHtml(work.subject)}</p>
                        <div class="work-year">
                            <i class="fas fa-calendar-alt"></i>
                            ${work.year}
                        </div>
                    </div>
                    ${actionButtons}
                </div>
                
                <div class="work-authors">
                    <div class="work-authors-label">
                        <i class="fas fa-users"></i>
                        Yazarlar
                    </div>
                    <div class="work-authors-list">${this.escapeHtml(authors)}</div>
                </div>
                
                ${hasLink ? `
                    <div class="work-link">
                        <a href="${this.escapeHtml(work.link)}" target="_blank" rel="noopener noreferrer">
                            <i class="fas fa-external-link-alt"></i>
                            Çalışmayı Görüntüle
                        </a>
                    </div>
                ` : ''}
            </div>
        `;
    }

    bindWorkCardEvents() {
        const actionBtns = document.querySelectorAll('.work-action-btn');
        
        actionBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const action = btn.dataset.action;
                const workId = parseInt(btn.dataset.workId);
                
                if (action === 'edit') {
                    this.editWork(workId);
                } else if (action === 'delete') {
                    this.deleteWork(workId);
                }
            });
        });
    }

    openWorkModal(work = null) {
        const modal = document.getElementById('workModal');
        const title = document.getElementById('workModalTitle');
        const form = document.getElementById('workForm');
        
        if (!modal || !title || !form) return;

        this.editingWorkId = work ? work.id : null;
        
        if (work) {
            title.innerHTML = '<i class="fas fa-edit"></i> Çalışmayı Düzenle';
            this.populateForm(work);
        } else {
            title.innerHTML = '<i class="fas fa-plus"></i> Yeni Çalışma Ekle';
            form.reset();
            this.selectedAuthors = [];
            this.updateSelectedAuthors();
        }

        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
        
        // Focus first input
        const firstInput = form.querySelector('input:not([type="hidden"])');
        if (firstInput) {
            setTimeout(() => firstInput.focus(), 100);
        }
    }

    closeWorkModal() {
        const modal = document.getElementById('workModal');
        if (!modal) return;

        modal.classList.remove('show');
        document.body.style.overflow = '';
        
        // Reset form and state
        const form = document.getElementById('workForm');
        if (form) {
            form.reset();
        }
        
        this.editingWorkId = null;
        this.selectedAuthors = [];
        this.updateSelectedAuthors();
        this.hideAuthorSuggestions();
    }

    populateForm(work) {
        document.getElementById('workName').value = work.name || '';
        document.getElementById('workSubject').value = work.subject || '';
        document.getElementById('workYear').value = work.year || '';
        document.getElementById('workLink').value = work.link || '';
        
        // Parse authors
        this.selectedAuthors = [];
        if (work.authors && work.authors.trim() !== '') {
            // authors saved as string: "Me, Author 1, Author 2"
            const names = work.authors.split(',').map(s => s.trim()).filter(Boolean);
            // Remove current user name if present (already implied as main author)
            const currentUserNameEl = document.getElementById('currentUserName');
            const me = currentUserNameEl ? currentUserNameEl.textContent.trim() : '';
            const filtered = names.filter(n => this.normalizeName(n) && this.normalizeName(n) !== this.normalizeName(me));
            // Seed selectedAuthors with name-only entries; IDs will be hydrated on modal open/list load
            this.selectedAuthors = filtered.map(n => ({ id: null, name: n }));
        }
        this.updateSelectedAuthors();
    }

    async handleWorkSubmit(e) {
        e.preventDefault();
        
        const form = e.target;
        const formData = new FormData(form);
        
        const workData = {
            name: formData.get('name').trim(),
            subject: formData.get('subject').trim(),
            year: parseInt(formData.get('year')),
            link: formData.get('link').trim(),
            authors: this.getAuthorsString()
        };

        // Validate
        if (!workData.name || !workData.subject || !workData.year) {
            this.showError('Lütfen tüm zorunlu alanları doldurun.');
            return;
        }

        if (workData.year < 1950 || workData.year > 2030) {
            this.showError('Yıl 1950-2030 arasında olmalıdır.');
            return;
        }

        if (workData.link && !this.isValidUrl(workData.link)) {
            this.showError('Geçerli bir URL girin.');
            return;
        }

        try {
            const saveBtn = document.getElementById('workModalSave');
            if (saveBtn) {
                saveBtn.disabled = true;
                saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Kaydediliyor...';
            }

            const action = this.editingWorkId ? 'update' : 'create';
            const payload = {
                action: action,
                ...workData
            };

            if (this.editingWorkId) {
                payload.id = this.editingWorkId;
            }

            const data = await window.backendAPI.post('works.php', payload);

            if (data.success) {
                this.showSuccess(this.editingWorkId ? 'Çalışma başarıyla güncellendi.' : 'Çalışma başarıyla eklendi.');
                this.closeWorkModal();
                this.loadWorks();
                
                // Auto-refresh page after successful work update
                setTimeout(() => {
                    console.log('🔄 Sayfa güncelleniyor...');
                    window.location.reload();
                }, 1500);
            } else {
                throw new Error(data.error || 'İşlem başarısız');
            }

        } catch (error) {
            console.error('Error saving work:', error);
            this.showError('Kaydetme sırasında hata oluştu: ' + error.message);
        } finally {
            const saveBtn = document.getElementById('workModalSave');
            if (saveBtn) {
                saveBtn.disabled = false;
                saveBtn.innerHTML = '<i class="fas fa-save"></i> Kaydet';
            }
        }
    }

    async editWork(workId) {
        const work = this.currentWorks.find(w => w.id === workId);
        if (work) {
            this.openWorkModal(work);
        }
    }

    async deleteWork(workId) {
        const work = this.currentWorks.find(w => w.id === workId);
        if (!work) return;

        // Show confirmation
        if (!confirm(`"${work.name}" adlı çalışmayı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`)) {
            return;
        }

        try {
            const data = await window.backendAPI.post('works.php', {
                action: 'delete',
                id: workId
            });

            if (data.success) {
                this.showSuccess('Çalışma başarıyla silindi.');
                this.loadWorks();
            } else {
                throw new Error(data.error || 'Silme işlemi başarısız');
            }

        } catch (error) {
            console.error('Error deleting work:', error);
            this.showError('Silme sırasında hata oluştu: ' + error.message);
        }
    }

    async handleAuthorSearch(e) {
        const query = e.target.value.trim();
        
        // If empty, show default suggestions
        if (query.length === 0) {
            this.loadDefaultAuthorSuggestions();
            return;
        }

        // Require at least 2 chars to search
        if (query.length < 2) {
            return; // keep current list visible
        }

        try {
            const data = await window.backendAPI.get('users.php', {
                action: 'list',
                search: query,
                limit: 10
            });

            if (data.success) {
                this.showAuthorSuggestions(data.items || []);
            }
        } catch (error) {
            console.error('Error searching authors:', error);
        }
    }

    async loadDefaultAuthorSuggestions() {
        try {
            const data = await window.backendAPI.get('users.php', {
                action: 'list',
                search: '',
                limit: 10
            });
            if (data.success) {
                this.showAuthorSuggestions(data.items || []);
            } else {
                this.showAuthorSuggestions([]);
            }
        } catch (error) {
            console.error('Error loading default author suggestions:', error);
            this.showAuthorSuggestions([]);
        }
    }

    showAuthorSuggestions(users = []) {
        const suggestions = document.getElementById('authorSuggestions');
        if (!suggestions) return;

        // filter out already-selected and current user
        const filtered = users
            .filter(user => !this.selectedAuthors.find(author => this.isSameId(author.id, user.id)))
            .filter(user => !this.isSameId(user.id, this.currentUser?.id));

        if (filtered.length === 0) {
            suggestions.innerHTML = '<div class="author-suggestion">Kullanıcı bulunamadı</div>';
        } else {
            suggestions.innerHTML = filtered
                .map(user => `
                    <div class="author-suggestion" data-user-id="${user.id}" data-user-name="${this.escapeHtml(user.fullName)}">
                        <div class="suggestion-name">${this.escapeHtml(user.fullName)}</div>
                        <div class="suggestion-info">${this.escapeHtml(user.institution || 'Kurum belirtilmemiş')}</div>
                    </div>
                `).join('');

            // Bind click events
            suggestions.querySelectorAll('.author-suggestion').forEach(suggestion => {
                suggestion.addEventListener('click', () => {
                    const userId = suggestion.dataset.userId;
                    const userName = suggestion.dataset.userName;
                    
                    if (userId && userName) {
                        this.addAuthor(parseInt(userId), userName);
                    }
                });
            });
        }

        suggestions.classList.add('show');
    }

    hideAuthorSuggestions() {
        const suggestions = document.getElementById('authorSuggestions');
        if (suggestions) {
            suggestions.classList.remove('show');
        }
    }

    addAuthor(userId, userName) {
        const normName = this.normalizeName(userName);
        const existing = this.selectedAuthors.find(a => this.isSameId(a.id, userId) || this.normalizeName(a.name) === normName);
        if (existing) {
            // hydrate id/name if missing
            if (existing.id == null && userId != null) existing.id = userId;
            if (!existing.name && userName) existing.name = userName;
        } else {
            this.selectedAuthors.push({ id: userId ?? null, name: userName });
        }
        this.updateSelectedAuthors();
        const searchInput = document.getElementById('authorSearchInput');
        if (searchInput) searchInput.value = '';
        this.hideAuthorSuggestions();
    }

    removeAuthor(userId) {
        this.removeAuthorByKey(userId, null);
    }

    removeAuthorByKey(userId, userName) {
        const normName = userName ? this.normalizeName(userName) : null;
        this.selectedAuthors = this.selectedAuthors.filter(author => {
            const idMatch = this.isSameId(author.id, userId);
            const nameMatch = normName ? this.normalizeName(author.name) === normName : false;
            return !(idMatch || nameMatch);
        });
        this.updateSelectedAuthors();
    }

    updateSelectedAuthors() {
        const container = document.getElementById('selectedAuthors');
        if (!container) return;

        container.innerHTML = this.selectedAuthors.map(author => `
            <div class="selected-author" data-id="${author.id ?? ''}" data-name="${this.escapeHtml(author.name)}">
                <span>${this.escapeHtml(author.name)}</span>
                <button type="button" class="remove-author" data-id="${author.id ?? ''}" data-name="${this.escapeHtml(author.name)}">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `).join('');

        // bind removal
        container.querySelectorAll('.remove-author').forEach(btn => {
            btn.addEventListener('click', () => {
                const idAttr = btn.getAttribute('data-id');
                const id = idAttr ? parseInt(idAttr, 10) : null;
                const name = btn.getAttribute('data-name');
                this.removeAuthorByKey(id, name);
            });
        });

        // Update hidden input
        const authorsInput = document.getElementById('authorsInput');
        if (authorsInput) {
            authorsInput.value = this.getAuthorsString();
        }
        // Update summary if present
        if (this.updateAuthorsSummary) {
            this.updateAuthorsSummary();
        }
    }

    getAuthorsString() {
        // Get current user name
        const currentUserNameEl = document.getElementById('currentUserName');
        const currentUserName = currentUserNameEl ? currentUserNameEl.textContent.trim() : 'Mevcut Kullanıcı';
        
        const authorNames = [currentUserName, ...this.selectedAuthors.map(author => author.name)];
        return authorNames.join(', ');
    }

    // Pagination methods
    prevPage() {
        if (this.currentPage > 1) {
            this.currentPage--;
            this.loadWorks();
        }
    }

    nextPage() {
        if (this.currentPage < this.totalPages) {
            this.currentPage++;
            this.loadWorks();
        }
    }

    // Utility methods
    showLoading() {
        const loading = document.getElementById('worksLoading');
        const grid = document.getElementById('worksGrid');
        const empty = document.getElementById('worksEmpty');
        
        if (loading) loading.style.display = 'flex';
        if (grid) grid.style.display = 'none';
        if (empty) empty.style.display = 'none';
    }

    hideLoading() {
        const loading = document.getElementById('worksLoading');
        if (loading) loading.style.display = 'none';
    }

    showSuccess(message) {
        this.displayToast('success', message);
    }

    showError(message) {
        this.displayToast('error', message);
    }

    displayToast(type, message) {
        // Works page uses its own toast namespace to avoid cross-page CSS conflicts

        // Ensure container exists (namespaced)
        let container = document.querySelector('.works-toast-container');
        if (!container) {
            container = document.createElement('div');
            container.className = 'works-toast-container';
            document.body.appendChild(container);
        }

        // Compute visuals
        let icon = 'ℹ️';
        let title = 'Bilgi';
        if (type === 'success') {
            icon = '✔️';
            title = 'Başarılı';
        } else if (type === 'error') {
            icon = '❌';
            title = 'Hata';
        }

        const toast = document.createElement('div');
        toast.className = `works-toast ${type}`; // .works-toast.success / .works-toast.error
        toast.innerHTML = `
            <div class="works-toast-icon">${icon}</div>
            <div class="works-toast-content">
                <div class="works-toast-title">${title}</div>
                <div class="works-toast-message">${this.escapeHtml(message)}</div>
            </div>
            <button class="works-toast-close" aria-label="Kapat">×</button>
        `;
        container.appendChild(toast);

        // animate in
        requestAnimationFrame(() => toast.classList.add('show'));

        const removeToast = () => {
            toast.classList.remove('show');
            toast.classList.add('hide');
            setTimeout(() => toast.remove(), 300);
        };
        const closeBtn = toast.querySelector('.works-toast-close');
        if (closeBtn) closeBtn.addEventListener('click', removeToast);
        setTimeout(removeToast, 3000);
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    };

    isValidUrl(string) {
        try {
            new URL(string);
            return true;
        } catch (error) {
            console.debug('Invalid URL:', string, error.message);
            return false;
        }
    }
}

// Initialize works manager when DOM is loaded
let worksManager;

document.addEventListener('DOMContentLoaded', async function() {
    // Only initialize if we're on a page with works content
    if (document.getElementById('worksContent')) {
        worksManager = new WorksManager();
        await worksManager.init();
        // expose after init so onclicks can see it
        window.worksManager = worksManager;
    }
});
