// Management Hierarchy Page Script
(function(){
  const POSITIONS_ORDERED = [
    'Ekip Üyesi',
    'İcra Kurulu Üyesi',
    'Workshop Sorumlusu',
    'Organizasyon Sorumlusu',
    'Sosyal Medya Sorumlusu',
    'Dergi Sorumlusu',
    'Senato Üyesi',
    'Ekip Başkan Yardımcısı',
    'Yönetim Başkan Yardımcısı',
    'Denetim Kurulu Üyesi',
    'Ekip Başkanı'
  ];

  // Tiers: group positions to emphasize hierarchy visually
  const TIERS = [
    { title: 'Ekip Başkanı', roles: ['Ekip Başkanı'], uniqueMax: 1 },
    { title: 'Başkan Yardımcıları', roles: ['Ekip Başkan Yardımcısı','Yönetim Başkan Yardımcısı'] },
    { title: 'Kurullar', roles: ['İcra Kurulu Üyesi','Denetim Kurulu Üyesi','Senato Üyesi'] },
    { title: 'Sorumlular', roles: ['Workshop Sorumlusu','Organizasyon Sorumlusu','Sosyal Medya Sorumlusu','Dergi Sorumlusu'] },
    { title: 'Ekip Üyeleri', roles: ['Ekip Üyesi'] }
  ];

  document.addEventListener('DOMContentLoaded', init);

  async function init(){
    // Admin-only assign button visibility
    const isAdmin = (localStorage.getItem('userRole')||'').toLowerCase()==='admin';
    const isAdminMode = localStorage.getItem('adminMode')==='admin' && localStorage.getItem('realAdminAccess')==='true';
    const openAssignBtn = document.getElementById('openAssignModal');
    if (openAssignBtn) openAssignBtn.style.display = (isAdmin && isAdminMode) ? 'inline-flex' : 'none';

    // Load users
    const users = await fetchAllUsersSafe();
    renderHierarchy(users);

    // Assign modal wiring
    setupAssignModal(users);

    // React to admin mode switches
    document.addEventListener('adminModeChanged', ()=>{
      const isAdmin = (localStorage.getItem('userRole')||'').toLowerCase()==='admin';
      const isAdminMode = localStorage.getItem('adminMode')==='admin' && localStorage.getItem('realAdminAccess')==='true';
      if (openAssignBtn) openAssignBtn.style.display = (isAdmin && isAdminMode) ? 'inline-flex' : 'none';
    });
  }

  async function fetchAllUsersSafe(){
    try {
      const res = await window.backendAPI.get('users.php', { action: 'list' });
      // Accept alternative response shapes to be robust against backend variations
      let items = [];
      if (Array.isArray(res)) {
        items = res;
      } else if (Array.isArray(res?.items)) {
        items = res.items;
      } else if (Array.isArray(res?.data)) {
        items = res.data;
      } else if (Array.isArray(res?.users)) {
        items = res.users;
      } else if (Array.isArray(res?.records)) {
        items = res.records;
      } else if (res?.success === true && typeof res?.total === 'number' && Array.isArray(res?.list)) {
        // Some APIs: { success:true, total:n, list:[...] }
        items = res.list;
      }
      return items.map(normalizeUser);
    } catch (e) {
      console.error('Kullanıcılar getirilemedi', e);
      return [];
    }
  }

  function normalizeUser(row){
    // Normalize to align with members-script.js
    let positions = row.positions || row.position || [];
    if (typeof positions === 'string') positions = positions.split(',').map(s=>s.trim()).filter(Boolean);
    // Map incoming roles to canonical forms (accent-insensitive, common variants)
    positions = positions.map(p => canonicalizePosition(p)).filter(Boolean);
    const photoUrl = row.photo_url || row.photoUrl || '';
    return {
      id: row.id ?? row.user_id ?? row.uid ?? null,
      fullName: row.fullName || row.name || [row.first_name, row.last_name].filter(Boolean).join(' ') || '',
      email: row.email || '',
      institution: row.institution || '',
      positions: positions,
      photoUrl
    };
  }

  function renderHierarchy(users){
    const root = document.getElementById('managementHierarchy');
    if (!root) return;
    root.innerHTML = '';

    // Map role -> users
    const byRole = new Map();
    POSITIONS_ORDERED.forEach(r => byRole.set(r, []));
    users.forEach(u => {
      const ps = Array.isArray(u.positions) ? u.positions : [];
      if (ps.length===0) {
        // treat as Ekip Üyesi fallback
        byRole.get('Ekip Üyesi').push(u);
      } else {
        ps.forEach(p => { if (byRole.has(p)) byRole.get(p).push(u); });
      }
    });

    // Render tiers
    TIERS.forEach(tier => {
      const tierUsers = tier.roles.flatMap(r => byRole.get(r) || []);
      const tierEl = document.createElement('div');
      tierEl.className = 'tier';
      tierEl.innerHTML = `
        <div class="tier-header">
          <div class="tier-title">${tier.title}</div>
          <div class="tier-count">${tierUsers.length} kişi</div>
        </div>
      `;

      // For Sorumlular and Kurullar, branch into subgroups per role
      if (tier.title === 'Sorumlular' || tier.title === 'Kurullar') {
        const subWrap = document.createElement('div');
        subWrap.className = 'tier-subgroups';

        tier.roles.forEach(roleName => {
          const usersForRole = byRole.get(roleName) || [];
          const subgroup = document.createElement('div');
          subgroup.className = 'subgroup';
          subgroup.innerHTML = `
            <div class="subgroup-header">
              <div class="subgroup-title">${roleName}</div>
              <div class="subgroup-count">${usersForRole.length} kişi</div>
            </div>
            <div class="subgroup-grid"></div>
          `;
          const sgGrid = subgroup.querySelector('.subgroup-grid');
          if (usersForRole.length === 0) {
            const empty = document.createElement('div');
            empty.style.cssText = 'color: var(--text-secondary); padding: 8px;';
            empty.textContent = 'Henüz atama yapılmamış';
            sgGrid.appendChild(empty);
          } else {
            usersForRole.forEach(u => sgGrid.appendChild(renderMemberCard(u)));
          }
          subWrap.appendChild(subgroup);
        });

        tierEl.appendChild(subWrap);
      } else {
        const grid = document.createElement('div');
        grid.className = 'member-grid';
        if (tierUsers.length === 0) {
          const empty = document.createElement('div');
          empty.style.cssText = 'color: var(--text-secondary); padding: 8px;';
          empty.textContent = 'Henüz atama yapılmamış';
          grid.appendChild(empty);
        } else {
          tierUsers.forEach(u => grid.appendChild(renderMemberCard(u)));
        }
        tierEl.appendChild(grid);
      }

      root.appendChild(tierEl);
    });

    // If absolutely no one found in any role, show a friendly hint
    const totalUsers = Array.from(byRole.values()).reduce((acc, arr)=> acc + (arr?.length||0), 0);
    if (totalUsers === 0) {
      const hint = document.createElement('div');
      hint.style.cssText = 'margin-top: 8px; color: var(--text-secondary);';
      hint.textContent = 'Hiç üye görüntülenemedi. Lütfen bağlantınızı ve yetkilerinizi kontrol edin.';
      root.prepend(hint);
    }
  }

  function renderMemberCard(user){
    const el = document.createElement('div');
    el.className = 'member-card';
    el.innerHTML = `
      <div class="member-avatar">
        ${user.photoUrl ? `<img src="${user.photoUrl}" alt="${escapeHtml(user.fullName)}">` : `<i class="fas fa-user"></i>`}
      </div>
      <div class="member-info">
        <div class="member-name">${escapeHtml(user.fullName)}</div>
        <div class="member-institution">${escapeHtml(user.institution || 'Kurum bilgisi yok')}</div>
      </div>
    `;
    el.addEventListener('click', () => {
      if (user.id) {
        // Navigate to profile with viewUser parameter (readOnly true)
        window.location.href = `profile.html?viewUser=${encodeURIComponent(user.email)}&readOnly=true`;
      }
    });
    return el;
  }

  function setupAssignModal(allUsers){
    const openBtn = document.getElementById('openAssignModal');
    const modal = document.getElementById('managementAssignModal');
    const closeBtn = document.getElementById('closeAssignModal');
    const cancelBtn = document.getElementById('cancelAssign');
    const saveBtn = document.getElementById('saveAssign');
    const roleSelect = document.getElementById('assignRoleSelect');
    const searchInput = document.getElementById('assignUserSearch');
    const listEl = document.getElementById('assignUserList');
    const noteEl = document.getElementById('assignRoleNote');

    // Populate roles
    roleSelect.innerHTML = '';
    POSITIONS_ORDERED.forEach(r => {
      const opt = document.createElement('option');
      opt.value = r; opt.textContent = r;
      roleSelect.appendChild(opt);
    });

    function open(){
      if (!modal) return;
      // Use global modal pattern: add 'show' and ensure flex display for centering
      modal.classList.add('show');
      modal.style.display = 'flex';
      refreshList();
      updateNote();
    }
    function close(){
      if (!modal) return;
      modal.classList.remove('show');
      modal.style.display = 'none';
      selectedUserId = null;
    }

    if (openBtn) openBtn.addEventListener('click', open);
    if (closeBtn) closeBtn.addEventListener('click', close);
    if (cancelBtn) cancelBtn.addEventListener('click', close);
    if (modal) modal.addEventListener('click', (e)=>{ if(e.target===modal) close(); });

    roleSelect.addEventListener('change', ()=>{ refreshList(); updateNote(); });
    searchInput.addEventListener('input', refreshList);

    let selectedUserId = null;

    function refreshList(){
      const q = (searchInput.value||'').toLowerCase();
      const role = roleSelect.value;
      const filtered = allUsers.filter(u =>
        u.fullName.toLowerCase().includes(q) ||
        (u.institution||'').toLowerCase().includes(q) ||
        (u.email||'').toLowerCase().includes(q)
      );

      listEl.innerHTML = '';
      filtered.forEach(u => {
        const item = document.createElement('div');
        item.className = 'assign-item';
        item.innerHTML = `
          <div class="member-avatar">${u.photoUrl ? `<img src="${u.photoUrl}" alt="${escapeHtml(u.fullName)}">` : `<i class=\"fas fa-user\"></i>`}</div>
          <div class="member-info" style="flex:1; min-width:0;">
            <div class="member-name">${escapeHtml(u.fullName)}</div>
            <div class="member-institution">${escapeHtml(u.institution || '')}</div>
          </div>
          <input type="radio" name="assignUser" class="assign-select" value="${u.id}">
        `;
        const radio = item.querySelector('.assign-select');
        item.addEventListener('click', (e)=>{
          if (e.target!==radio) radio.checked = true;
          selectedUserId = u.id;
        });
        radio.addEventListener('change', ()=>{ selectedUserId = u.id; });
        listEl.appendChild(item);
      });
    }

    function updateNote(){
      const role = roleSelect.value;
      if (role === 'Ekip Başkanı') {
        noteEl.style.display = '';
        noteEl.textContent = 'Not: Ekip Başkanı sadece bir kişi olabilir. Yeni atama önceki başkanı bu rolden kaldırır.';
      } else {
        noteEl.style.display = 'none';
        noteEl.textContent = '';
      }
    }

    saveBtn.addEventListener('click', async ()=>{
      if (!selectedUserId) { alert('Lütfen bir üye seçin.'); return; }
      const role = roleSelect.value;
      try {
        await assignRoleBackend(selectedUserId, role);
        // Reload users and rerender
        const users = await fetchAllUsersSafe();
        renderHierarchy(users);
        close();
      } catch (e) {
        console.error('Atama hatası', e);
        alert('Atama sırasında bir hata oluştu.');
      }
    });
  }

  async function assignRoleBackend(userId, role){
    // For unique role Ekip Başkanı: backend expected to enforce uniqueness.
    // Here, we call users.php update; using a dedicated action if available;
    // fallback to generic update with positions merge.
    const payload = {
      action: 'update',
      userId,
      update: { addPosition: role }
    };
    const res = await window.backendAPI.post('users.php?action=update', payload);
    if (!res || res.success !== true) {
      throw new Error(res?.error || 'Backend error');
    }
    return res;
  }

  // Helpers
  function canonicalizePosition(input){
    if (!input) return null;
    const s = String(input).trim();
    // Keep exact match if already canonical
    if (POSITIONS_ORDERED.includes(s)) return s;
    // Accent-insensitive, lowercase comparison
    const key = stripDiacritics(s).toLowerCase();
    const map = {
      'ekip baskani': 'Ekip Başkanı',
      'ekip başkanı': 'Ekip Başkanı',
      'ekip bsk': 'Ekip Başkanı',
      'ekip bşk': 'Ekip Başkanı',
      'ekip baskan yardimcisi': 'Ekip Başkan Yardımcısı',
      'ekip başkan yardımcısı': 'Ekip Başkan Yardımcısı',
      'yonetim baskan yardimcisi': 'Yönetim Başkan Yardımcısı',
      'yönetim başkan yardımcısı': 'Yönetim Başkan Yardımcısı',
      'icra kurulu uyesi': 'İcra Kurulu Üyesi',
      'icra kurulu üyesi': 'İcra Kurulu Üyesi',
      'denetim kurulu uyesi': 'Denetim Kurulu Üyesi',
      'denetim kurulu üyesi': 'Denetim Kurulu Üyesi',
      'senato uyesi': 'Senato Üyesi',
      'senato üyesi': 'Senato Üyesi',
      'workshop sorumlusu': 'Workshop Sorumlusu',
      'organizasyon sorumlusu': 'Organizasyon Sorumlusu',
      'sosyal medya sorumlusu': 'Sosyal Medya Sorumlusu',
      'dergi sorumlusu': 'Dergi Sorumlusu',
      'ekip uyesi': 'Ekip Üyesi',
      'ekip üyesi': 'Ekip Üyesi'
    };
    return map[key] || null;
  }

  function stripDiacritics(str){
    return String(str)
      .replace(/ı/g,'i').replace(/İ/g,'i')
      .replace(/ş/g,'s').replace(/Ş/g,'s')
      .replace(/ğ/g,'g').replace(/Ğ/g,'g')
      .replace(/ü/g,'u').replace(/Ü/g,'u')
      .replace(/ö/g,'o').replace(/Ö/g,'o')
      .replace(/ç/g,'c').replace(/Ç/g,'c')
      .normalize('NFD').replace(/[\u0300-\u036f]/g,'');
  }

  function escapeHtml(s){
    return String(s||'')
      .replaceAll('&','&amp;')
      .replaceAll('<','&lt;')
      .replaceAll('>','&gt;')
      .replaceAll('"','&quot;')
      .replaceAll("'",'&#039;');
  }
})();
