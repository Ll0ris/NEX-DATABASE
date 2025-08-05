// Members Page Script

document.addEventListener('DOMContentLoaded', function() {
    // Sample member data (in real application, this would come from a database)
    const membersData = [
        { id: 1, name: "Prof. Dr. Oğuzhan Dedeoğlu", year: 2018, rank: "Kurucu", status: "active", email: "oguzhan@nex.com", phone: "+90 555 123 4567" },
        { id: 2, name: "Ahmet Yılmaz", year: 2019, rank: "Başkan", status: "active", email: "ahmet@nex.com", phone: "+90 555 234 5678" },
        { id: 3, name: "Ayşe Kaya", year: 2020, rank: "Başkan Yardımcısı", status: "active", email: "ayse@nex.com", phone: "+90 555 345 6789" },
        { id: 4, name: "Mehmet Demir", year: 2021, rank: "Genel Sekreter", status: "active", email: "mehmet@nex.com", phone: "+90 555 456 7890" },
        { id: 5, name: "Fatma Özkan", year: 2022, rank: "Mali İşler", status: "active", email: "fatma@nex.com", phone: "+90 555 567 8901" },
        { id: 6, name: "Ali Çelik", year: 2023, rank: "Proje Koordinatörü", status: "active", email: "ali@nex.com", phone: "+90 555 678 9012" },
        { id: 7, name: "Zeynep Şahin", year: 2024, rank: "Üye", status: "active", email: "zeynep@nex.com", phone: "+90 555 789 0123" },
        { id: 8, name: "Emre Koç", year: 2025, rank: "Üye", status: "active", email: "emre@nex.com", phone: "+90 555 890 1234" },
        { id: 9, name: "Selin Arslan", year: 2020, rank: "Eski Başkan", status: "alumni", email: "selin@alumni.com", phone: "+90 555 901 2345" },
        { id: 10, name: "Burak Taş", year: 2019, rank: "Eski Üye", status: "alumni", email: "burak@alumni.com", phone: "+90 555 012 3456" },
        { id: 11, name: "Deniz Kara", year: 2021, rank: "Üye", status: "inactive", email: "deniz@nex.com", phone: "+90 555 123 4567" },
        { id: 12, name: "Ceren Yurt", year: 2022, rank: "Üye", status: "inactive", email: "ceren@nex.com", phone: "+90 555 234 5678" },
        { id: 13, name: "Kemal Aydın", year: 2018, rank: "Kurucu Üye", status: "alumni", email: "kemal@alumni.com", phone: "+90 555 345 6789" },
        { id: 14, name: "Gül Erdoğan", year: 2023, rank: "Üye", status: "active", email: "gul@nex.com", phone: "+90 555 456 7890" },
        { id: 15, name: "Murat Konak", year: 2024, rank: "Üye", status: "active", email: "murat@nex.com", phone: "+90 555 567 8901" }
    ];

    let currentMembers = [...membersData];
    let sortField = 'name';
    let sortDirection = 'asc';

    // Initialize the page
    initializeMembersPage();

    function initializeMembersPage() {
        updateStatistics();
        renderMemberTable();
        initializeEventListeners();
    }

    function updateStatistics() {
        const totalMembers = membersData.length;
        const activeMembers = membersData.filter(member => member.status === 'active').length;
        const activeAlumni = membersData.filter(member => member.status === 'alumni').length;

        document.getElementById('totalMembers').textContent = totalMembers;
        document.getElementById('activeMembers').textContent = activeMembers;
        document.getElementById('activeAlumni').textContent = activeAlumni;
    }

    function renderMemberTable() {
        const tbody = document.getElementById('memberTableBody');
        tbody.innerHTML = '';

        currentMembers.forEach(member => {
            const row = createMemberRow(member);
            tbody.appendChild(row);
        });
    }

    function createMemberRow(member) {
        const row = document.createElement('tr');
        row.classList.add('member-row');
        
        // Add status class for styling
        row.classList.add(`status-${member.status}`);

        row.innerHTML = `
            <td class="member-name">
                <div class="member-info">
                    <div class="member-avatar">
                        <i class="fas fa-user-circle"></i>
                    </div>
                    <div class="member-details">
                        <div class="name">${member.name}</div>
                        <div class="member-id">ID: #${member.id.toString().padStart(3, '0')}</div>
                    </div>
                </div>
            </td>
            <td class="member-year">${member.year}</td>
            <td class="member-rank">
                <span class="rank-badge rank-${member.rank.toLowerCase().replace(/\s+/g, '-')}">${member.rank}</span>
            </td>
            <td class="member-status">
                <span class="status-badge status-${member.status}">
                    <i class="fas ${getStatusIcon(member.status)}"></i>
                    ${getStatusText(member.status)}
                </span>
            </td>
            <td class="member-contact">
                <div class="contact-buttons">
                    <a href="mailto:${member.email}" class="contact-btn email" title="E-posta">
                        <i class="fas fa-envelope"></i>
                    </a>
                    <a href="tel:${member.phone}" class="contact-btn phone" title="Telefon">
                        <i class="fas fa-phone"></i>
                    </a>
                </div>
            </td>
        `;

        return row;
    }

    function getStatusIcon(status) {
        switch(status) {
            case 'active': return 'fa-check-circle';
            case 'inactive': return 'fa-pause-circle';
            case 'alumni': return 'fa-graduation-cap';
            default: return 'fa-question-circle';
        }
    }

    function getStatusText(status) {
        switch(status) {
            case 'active': return 'Aktif';
            case 'inactive': return 'Pasif';
            case 'alumni': return 'Mezun';
            default: return 'Bilinmiyor';
        }
    }

    function initializeEventListeners() {
        // Search functionality
        const searchInput = document.getElementById('memberSearch');
        searchInput.addEventListener('input', handleSearch);

        // Filter functionality
        const statusFilter = document.getElementById('statusFilter');
        statusFilter.addEventListener('change', handleFilter);

        // Sort functionality
        const sortableHeaders = document.querySelectorAll('.sortable');
        sortableHeaders.forEach(header => {
            header.addEventListener('click', () => handleSort(header.dataset.sort));
        });
    }

    function handleSearch(event) {
        const searchTerm = event.target.value.toLowerCase();
        
        currentMembers = membersData.filter(member => 
            member.name.toLowerCase().includes(searchTerm) ||
            member.rank.toLowerCase().includes(searchTerm) ||
            member.email.toLowerCase().includes(searchTerm)
        );

        // Apply current filter
        const currentFilter = document.getElementById('statusFilter').value;
        if (currentFilter !== 'all') {
            currentMembers = currentMembers.filter(member => member.status === currentFilter);
        }

        sortMembers();
        renderMemberTable();
    }

    function handleFilter(event) {
        const filterValue = event.target.value;
        const searchTerm = document.getElementById('memberSearch').value.toLowerCase();

        // Start with search results
        if (searchTerm) {
            currentMembers = membersData.filter(member => 
                member.name.toLowerCase().includes(searchTerm) ||
                member.rank.toLowerCase().includes(searchTerm) ||
                member.email.toLowerCase().includes(searchTerm)
            );
        } else {
            currentMembers = [...membersData];
        }

        // Apply filter
        if (filterValue !== 'all') {
            currentMembers = currentMembers.filter(member => member.status === filterValue);
        }

        sortMembers();
        renderMemberTable();
    }

    function handleSort(field) {
        if (sortField === field) {
            sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
        } else {
            sortField = field;
            sortDirection = 'asc';
        }

        // Update sort icons
        updateSortIcons();
        
        sortMembers();
        renderMemberTable();
    }

    function sortMembers() {
        currentMembers.sort((a, b) => {
            let aValue = a[sortField];
            let bValue = b[sortField];

            // Handle different data types
            if (sortField === 'year') {
                aValue = parseInt(aValue);
                bValue = parseInt(bValue);
            } else if (typeof aValue === 'string') {
                aValue = aValue.toLowerCase();
                bValue = bValue.toLowerCase();
            }

            if (sortDirection === 'asc') {
                return aValue > bValue ? 1 : -1;
            } else {
                return aValue < bValue ? 1 : -1;
            }
        });
    }

    function updateSortIcons() {
        // Reset all sort icons
        document.querySelectorAll('.sortable i').forEach(icon => {
            icon.className = 'fas fa-sort';
        });

        // Update current sort icon
        const currentHeader = document.querySelector(`[data-sort="${sortField}"]`);
        if (currentHeader) {
            const icon = currentHeader.querySelector('i');
            icon.className = `fas fa-sort-${sortDirection === 'asc' ? 'up' : 'down'}`;
        }
    }
});
