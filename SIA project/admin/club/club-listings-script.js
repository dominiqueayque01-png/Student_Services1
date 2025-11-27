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
    initializeDeleteModal();
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
                        <span class="simple-icon">✎</span>
                        <span>Edit</span>
                    </button>
                    ${club.status === 'active' 
                        ? `<button class="btn-deactivate" data-id="${club.id}">Deactivated</button>` 
                        : `<button class="btn-activate" data-id="${club.id}">Activate</button>`
                    }
                    <button class="btn-delete" data-id="${club.id}">
                        <span class="simple-icon">✕</span>
                    </button>
                </div>
            </div>

            <div class="club-details">
                <div class="detail-item">
                    <div class="detail-icon">◎</div>
                    <div class="detail-content">
                        <p class="detail-label">Members</p>
                        <p class="detail-value">${club.members} members</p>
                    </div>
                </div>
                <div class="detail-item">
                    <div class="detail-icon">⊙</div>
                    <div class="detail-content">
                        <p class="detail-label">Meeting Time</p>
                        <p class="detail-value">${club.meetingDay}</p>
                    </div>
                </div>
                <div class="detail-item">
                    <div class="detail-icon">⊕</div>
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
    const club = clubsData.find(c => c.id == id);
    if (club) {
        // Show delete confirmation modal
        const modal = document.getElementById('delete-club-modal');
        const message = document.getElementById('delete-club-message');
        message.innerHTML = `Are you sure you want to delete <strong>${club.name}</strong>?`;
        
        modal.classList.add('show');
        
        // Store the club ID for confirmation
        const confirmBtn = document.getElementById('delete-club-confirm');
        
        // Remove previous listeners
        const newConfirmBtn = confirmBtn.cloneNode(true);
        confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);
        
        // Add new listener
        newConfirmBtn.addEventListener('click', function() {
            clubsData = clubsData.filter(c => c.id != id);
            saveClubsData();
            renderClubs();
            modal.classList.remove('show');
            showToast('Club deleted successfully!', 'success');
        });
    }
}

function editClub(id) {
    const club = clubsData.find(c => c.id == id);
    if (club) {
        showEditModal(club);
    }
}

function openCreateModal() {
    showCreateModal();
}

// ============================================
// Modal Functions
// ============================================

function showEditModal(club) {
    const modal = createFormModal('Edit Club', club, true);
    document.body.appendChild(modal);
    modal.classList.add('show');
}

function showCreateModal() {
    const newClub = {
        id: '',
        name: '',
        category: '',
        members: '',
        status: 'active',
        meetingDay: '',
        location: '',
        description: ''
    };
    const modal = createFormModal('Create New Club', newClub, false);
    document.body.appendChild(modal);
    modal.classList.add('show');
}

function createFormModal(title, club, isEdit) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>${title}</h2>
                <button class="modal-close">&times;</button>
            </div>
            
            <div class="modal-body">
                <form class="club-form">
                    <div class="form-group">
                        <label for="form-club-name">Club Name <span class="required">*</span></label>
                        <input type="text" id="form-club-name" placeholder="Enter club name" value="${club.name}" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="form-club-category">Category <span class="required">*</span></label>
                        <select id="form-club-category" required>
                            <option value="">Select category</option>
                            <option value="Technology" ${club.category === 'Technology' ? 'selected' : ''}>Technology</option>
                            <option value="Business" ${club.category === 'Business' ? 'selected' : ''}>Business</option>
                            <option value="Sports" ${club.category === 'Sports' ? 'selected' : ''}>Sports</option>
                            <option value="Arts" ${club.category === 'Arts' ? 'selected' : ''}>Arts</option>
                            <option value="Science" ${club.category === 'Science' ? 'selected' : ''}>Science</option>
                            <option value="Culture" ${club.category === 'Culture' ? 'selected' : ''}>Culture</option>
                            <option value="Service" ${club.category === 'Service' ? 'selected' : ''}>Service</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label for="form-club-members">Members <span class="required">*</span></label>
                        <input type="number" id="form-club-members" placeholder="Number of members" value="${club.members}" min="0" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="form-club-meeting">Meeting Day <span class="required">*</span></label>
                        <input type="text" id="form-club-meeting" placeholder="e.g., Tuesdays 6:00 pm" value="${club.meetingDay}" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="form-club-location">Location <span class="required">*</span></label>
                        <input type="text" id="form-club-location" placeholder="e.g., IK 306" value="${club.location}" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="form-club-description">Description <span class="required">*</span></label>
                        <textarea id="form-club-description" placeholder="Enter club description" rows="4" required>${club.description}</textarea>
                    </div>
                </form>
            </div>
            
            <div class="modal-footer">
                <button class="btn-cancel">Cancel</button>
                <button class="btn-submit">${isEdit ? 'Update Club' : 'Create Club'}</button>
            </div>
        </div>
    `;
    
    // Close button
    modal.querySelector('.modal-close').addEventListener('click', function() {
        modal.classList.remove('show');
        setTimeout(() => modal.remove(), 300);
    });
    
    // Cancel button
    modal.querySelector('.btn-cancel').addEventListener('click', function() {
        modal.classList.remove('show');
        setTimeout(() => modal.remove(), 300);
    });
    
    // Submit button
    modal.querySelector('.btn-submit').addEventListener('click', function() {
        const name = document.getElementById('form-club-name').value;
        const category = document.getElementById('form-club-category').value;
        const members = parseInt(document.getElementById('form-club-members').value);
        const meetingDay = document.getElementById('form-club-meeting').value;
        const location = document.getElementById('form-club-location').value;
        const description = document.getElementById('form-club-description').value;
        
        // Validate
        if (!name || !category || !members || !meetingDay || !location || !description) {
            showToast('Please fill in all required fields', 'error');
            return;
        }
        
        if (isEdit) {
            // Update existing club
            const clubIndex = clubsData.findIndex(c => c.id == club.id);
            if (clubIndex !== -1) {
                clubsData[clubIndex] = {
                    ...clubsData[clubIndex],
                    name,
                    category,
                    members,
                    meetingDay,
                    location,
                    description
                };
                showToast('Club updated successfully!', 'success');
            }
        } else {
            // Create new club
            const newClub = {
                id: Math.max(...clubsData.map(c => c.id), 0) + 1,
                name,
                category,
                members,
                status: 'active',
                meetingDay,
                location,
                description
            };
            clubsData.push(newClub);
            showToast('Club created successfully!', 'success');
        }
        
        saveClubsData();
        renderClubs();
        modal.classList.remove('show');
        setTimeout(() => modal.remove(), 300);
    });
    
    // Close on overlay click
    modal.addEventListener('click', function(e) {
        if (e.target === this) {
            modal.classList.remove('show');
            setTimeout(() => modal.remove(), 300);
        }
    });
    
    return modal;
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

// ============================================
// Delete Modal
// ============================================

function initializeDeleteModal() {
    const modal = document.getElementById('delete-club-modal');
    const closeBtn = document.getElementById('delete-club-close');
    const cancelBtn = document.getElementById('delete-club-cancel');
    
    if (closeBtn) {
        closeBtn.addEventListener('click', function() {
            modal.classList.remove('show');
        });
    }
    
    if (cancelBtn) {
        cancelBtn.addEventListener('click', function() {
            modal.classList.remove('show');
        });
    }
    
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                modal.classList.remove('show');
            }
        });
    }
}
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

// ============================================
// Toast Notification
// ============================================

function showToast(message, type = 'info') {
    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <div class="toast-content">
            <span class="toast-icon">${getToastIcon(type)}</span>
            <span class="toast-message">${message}</span>
        </div>
        <button class="toast-close">&times;</button>
    `;
    
    // Add to DOM
    document.body.appendChild(toast);
    
    // Trigger animation
    setTimeout(() => toast.classList.add('show'), 10);
    
    // Close button listener
    toast.querySelector('.toast-close').addEventListener('click', function() {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    });
    
    // Auto-remove after 4 seconds
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

function getToastIcon(type) {
    switch(type) {
        case 'success':
            return '✓';
        case 'error':
            return '✕';
        case 'warning':
            return '!';
        default:
            return 'ℹ';
    }
}
