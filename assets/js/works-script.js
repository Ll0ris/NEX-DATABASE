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
        
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadCurrentUser();
        this.checkAdminAccess();
        this.loadWorks();
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
            const emptyStateBtn = document.querySelector('.works-empty .add-work-btn');
            
            if (addWorkBtn) addWorkBtn.style.display = 'none';
            if (emptyStateBtn) emptyStateBtn.style.display = 'none';
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

        // Author search
        const authorSearchInput = document.getElementById('authorSearchInput');
        if (authorSearchInput) {
            authorSearchInput.addEventListener('input', (e) => this.handleAuthorSearch(e));
            authorSearchInput.addEventListener('focus', () => this.showAuthorSuggestions());
            authorSearchInput.addEventListener('blur', () => {
                // Delay hiding to allow clicking on suggestions
                setTimeout(() => this.hideAuthorSuggestions(), 200);
            });
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

    async loadCurrentUser() {
        try {
            // URL parametrelerini kontrol et - hangi kullanıcının profilini görüntülediğimizi belirle
            const urlParams = new URLSearchParams(window.location.search);
            const viewUserParam = urlParams.get('viewUser');
            const targetUser = viewUserParam || localStorage.getItem('currentUserEmail');
            
            if (!targetUser) {
                console.warn('Target user not found');
                return;
            }

            const response = await window.backendAPI.get('profile.php', { 
                action: 'get', 
                viewUser: targetUser 
            });

            if (response.success && response.profile) {
                const currentUserNameEl = document.getElementById('currentUserName');
                if (currentUserNameEl) {
                    currentUserNameEl.textContent = response.profile.fullName || 'Mevcut Kullanıcı';
                }
                
                // Store user info for later use
                this.currentUser = response.profile;
            }
        } catch (error) {
            console.error('Error loading current user:', error);
        }
    }

    async loadWorks() {
        this.showLoading();
        
        try {
            // First get current user info if not already loaded
            if (!this.currentUser) {
                await this.loadCurrentUser();
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
            // For now, just show as text since we need to implement user lookup
            // In the future, we would parse this and match to user IDs
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
        
        if (query.length < 2) {
            this.hideAuthorSuggestions();
            return;
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

    showAuthorSuggestions(users = []) {
        const suggestions = document.getElementById('authorSuggestions');
        if (!suggestions) return;

        if (users.length === 0) {
            suggestions.innerHTML = '<div class="author-suggestion">Kullanıcı bulunamadı</div>';
        } else {
            suggestions.innerHTML = users
                .filter(user => !this.selectedAuthors.find(author => author.id === user.id))
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
        if (this.selectedAuthors.find(author => author.id === userId)) {
            return; // Already added
        }

        this.selectedAuthors.push({ id: userId, name: userName });
        this.updateSelectedAuthors();
        
        // Clear search
        const searchInput = document.getElementById('authorSearchInput');
        if (searchInput) {
            searchInput.value = '';
        }
        this.hideAuthorSuggestions();
    }

    removeAuthor(userId) {
        this.selectedAuthors = this.selectedAuthors.filter(author => author.id !== userId);
        this.updateSelectedAuthors();
    }

    updateSelectedAuthors() {
        const container = document.getElementById('selectedAuthors');
        if (!container) return;

        container.innerHTML = this.selectedAuthors.map(author => `
            <div class="selected-author">
                <span>${this.escapeHtml(author.name)}</span>
                <button type="button" class="remove-author" onclick="worksManager.removeAuthor(${author.id})">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `).join('');

        // Update hidden input
        const authorsInput = document.getElementById('authorsInput');
        if (authorsInput) {
            authorsInput.value = this.getAuthorsString();
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
        // Use existing toast system if available
        if (typeof showToast === 'function') {
            showToast(message, 'success');
        } else {
            alert(message);
        }
    }

    showError(message) {
        // Use existing toast system if available
        if (typeof showToast === 'function') {
            showToast(message, 'error');
        } else {
            alert('Hata: ' + message);
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

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

document.addEventListener('DOMContentLoaded', function() {
    // Only initialize if we're on a page with works content
    if (document.getElementById('worksContent')) {
        worksManager = new WorksManager();
    }
});

// Make it global for onclick handlers
window.worksManager = worksManager;
