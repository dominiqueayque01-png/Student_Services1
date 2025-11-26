// ============================================
// Club Listings Script
// ============================================

// Sample club data
let clubsData = [
    {
        id: 1,
        name: 'Tech Innovation Club',
        category: 'Technology',
        members: 142,
        status: 'active',
        meetingDay: 'Tuesdays 6:00 pm',
        location: 'IK 306',
        description: 'A community of tech enthusiasts building the future through coding, hackathons, and innovative projects.'
    },
    {
        id: 2,
        name: 'Marketing Society',
        category: 'Business',
        members: 98,
        status: 'active',
        meetingDay: 'Thursday 6:00 pm',
        location: 'IL 507',
        description: 'Develop marketing skills and business acumen through real-world projects, case competitions, and industry connections.'
    }
];

document.addEventListener('DOMContentLoaded', function() {
    initializeClubListings();
    initializeNavigation();
    initializeLogout();
    loadClubsData();
    renderClubs();
});

// ============================================
// Club Listings Functionality
// ============================================

function initializeClubListings() {
    // Setup search functionality
    const searchBox = document.getElementById('search-club');
    if (searchBox) {
        searchBox.addEventListener('input', filterClubs);
    }

    // Setup filter dropdown
    const filterDropdown = document.getElementById('filter-status');
    if (filterDropdown) {
        filterDropdown.addEventListener('change', filterClubs);
    }

    // Setup create club button
    const createBtn = document.querySelector('.btn-create');
    if (createBtn) {
        createBtn.addEventListener('click', openCreateModal);
    }
}

function loadClubsData() {
    // Try to load from localStorage, fallback to sample data
    const savedClubs = localStorage.getItem('clubsData');
    if (savedClubs) {
        clubsData = JSON.parse(savedClubs);
    } else {
        saveClubsData();
    }
}

function saveClubsData() {
    localStorage.setItem('clubsData', JSON.stringify(clubsData));
}

function renderClubs() {
    const container = document.querySelector('.clubs-container');
    if (!container) return;

    container.innerHTML = '';

    if (clubsData.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <p>No clubs found</p>
                <p>Create a new club to get started</p>
            </div>
        `;
        return;
    }

    clubsData.forEach(club => {
        const card = document.createElement('div');
        card.className = 'club-card';
        card.innerHTML = `
            <div class="club-header">
                <div class="club-title-section">
                    <h3 class="club-title">
                        ${club.name}
                        <span class="club-status-badge ${club.status}">${club.status}</span>
                    </h3>
                    <p class="club-category">
                        <span>${club.category}</span> • 
                        <span>${club.members} members</span>
                    </p>
                </div>
                <div class="club-actions">
                    <button class="btn-edit" data-id="${club.id}">
                        <span>✏️</span>
                        <span>Edit</span>
                    </button>
                    ${club.status === 'active' 
                        ? `<button class="btn-deactivate" data-id="${club.id}">Deactivated</button>` 
                        : `<button class="btn-activate" data-id="${club.id}">Activate</button>`
                    }
                    <button class="btn-delete" data-id="${club.id}">
                        <span>🗑️</span>
                    </button>
                </div>
            </div>

            <div class="club-details">
                <div class="detail-item">
                    <div class="detail-icon">👥</div>
                    <div class="detail-content">
                        <p class="detail-label">Members</p>
                        <p class="detail-value">${club.members} members</p>
                    </div>
                </div>
                <div class="detail-item">
                    <div class="detail-icon">🕐</div>
                    <div class="detail-content">
                        <p class="detail-label">Meeting Time</p>
                        <p class="detail-value">${club.meetingDay}</p>
                    </div>
                </div>
                <div class="detail-item">
                    <div class="detail-icon">📍</div>
                    <div class="detail-content">
                        <p class="detail-label">Location</p>
                        <p class="detail-value">${club.location}</p>
                    </div>
                </div>
            </div>

            <div class="club-description">
                <p>${club.description}</p>
            </div>
        `;

        container.appendChild(card);
    });

    // Add event listeners to buttons
    document.querySelectorAll('.btn-edit').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const id = this.getAttribute('data-id');
            editClub(id);
        });
    });

    document.querySelectorAll('.btn-activate, .btn-deactivate').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const id = this.getAttribute('data-id');
            toggleClubStatus(id);
        });
    });

    document.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const id = this.getAttribute('data-id');
            deleteClub(id);
        });
    });
}

function filterClubs() {
    const searchTerm = document.getElementById('search-club')?.value.toLowerCase() || '';
    const statusFilter = document.getElementById('filter-status')?.value || '';

    const filteredClubs = clubsData.filter(club => {
        const matchesSearch = club.name.toLowerCase().includes(searchTerm) ||
                            club.category.toLowerCase().includes(searchTerm);
        const matchesStatus = !statusFilter || club.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    // Temporarily replace data to render filtered results
    const originalData = clubsData;
    clubsData = filteredClubs;
    renderClubs();
    clubsData = originalData;
}

function toggleClubStatus(id) {
    const club = clubsData.find(c => c.id == id);
    if (club) {
        club.status = club.status === 'active' ? 'inactive' : 'active';
        saveClubsData();
        renderClubs();
    }
}

function deleteClub(id) {
    if (confirm('Are you sure you want to delete this club?')) {
        clubsData = clubsData.filter(c => c.id != id);
        saveClubsData();
        renderClubs();
    }
}

function editClub(id) {
    const club = clubsData.find(c => c.id == id);
    if (club) {
        // For now, show confirmation modal
        alert(`Edit club: ${club.name}\n\nFull edit functionality coming soon!`);
    }
}

function openCreateModal() {
    alert('Create new club\n\nForm modal coming soon!');
}

// ============================================
// Navigation
// ============================================

function initializeNavigation() {
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', function() {
            document.querySelectorAll('.nav-item').forEach(i => {
                i.classList.remove('active');
            });

            this.classList.add('active');

            const page = this.getAttribute('data-page');

            if (page === 'overview') {
                window.location.href = 'index.html';
            } else if (page === 'listings') {
                window.location.href = 'club-listings.html';
            } else if (page === 'analytics') {
                window.location.href = 'analytics.html';
            } else if (page === 'accounts') {
                window.location.href = 'accounts.html';
            }
        });
    });
}

// ============================================
// Logout
// ============================================

function initializeLogout() {
    const logoutBtn = document.querySelector('.logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', showLogoutModal);
    }
}

function showLogoutModal() {
    const modal = document.getElementById('logout-modal');
    if (modal) {
        modal.classList.add('show');
    }
}

function hideLogoutModal() {
    const modal = document.getElementById('logout-modal');
    if (modal) {
        modal.classList.remove('show');
    }
}

function confirmLogout() {
    sessionStorage.clear();
    window.location.href = '../../login admin/index.html';
}

// Logout modal event listeners
const logoutModal = document.getElementById('logout-modal');
if (logoutModal) {
    logoutModal.addEventListener('click', function(e) {
        if (e.target === this) {
            hideLogoutModal();
        }
    });
}

const logoutCloseBtn = document.querySelector('.logout-modal-close');
if (logoutCloseBtn) {
    logoutCloseBtn.addEventListener('click', hideLogoutModal);
}

const logoutCancelBtn = document.querySelector('.logout-modal-cancel');
if (logoutCancelBtn) {
    logoutCancelBtn.addEventListener('click', hideLogoutModal);
}

const logoutConfirmBtn = document.querySelector('.logout-modal-confirm');
if (logoutConfirmBtn) {
    logoutConfirmBtn.addEventListener('click', confirmLogout);
}

console.log('Club Listings initialized');
