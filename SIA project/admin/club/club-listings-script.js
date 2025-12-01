// ============================================
// Club Listings Script - MONGODB INTEGRATION & FULL UI FUNCTIONALITY
// ============================================

// Global array (Will be populated by API fetch)
let clubsData = []; 
const clubsContainer = document.querySelector('.clubs-container');
const API_BASE_URL = 'http://localhost:3001/api/clubs'; // Verify this URL matches your Express route

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all UI components first
    initializeClubListings();
    initializeNavigation(); 
    initializeLogout();     
    initializeDeleteModal();
    
    // Start fetching data from MongoDB
    fetchAndRenderClubs(); 
});

// ============================================
// 1. API FETCHING (READ)
// ============================================

/**
 * Fetches all club data from the MongoDB API and renders it.
 */
async function fetchAndRenderClubs() {
    if (clubsContainer) {
        clubsContainer.innerHTML = '<div class="loading-state">Fetching club data from server...</div>';
    }

    try {
        const response = await fetch(API_BASE_URL);
        
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const fetchedClubs = await response.json();
        
        // Populate the global array with fetched data
        clubsData = fetchedClubs; 
        
        // Render the fetched data
        renderClubs();
        
    } catch (error) {
        console.error("Error fetching club listings from MongoDB:", error);
        if (clubsContainer) {
             clubsContainer.innerHTML = '<div class="empty-state"><p class="text-danger">Failed to load clubs. Check if the server is running on port 3001.</p></div>';
        }
    }
}


// ============================================
// 2. RENDERING & LOCAL UI LOGIC (Search/Filter/Event Setup)
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

function renderClubs() {
    const container = document.querySelector('.clubs-container');
    if (!container) return;

    container.innerHTML = ''; // Clear previous content

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
        // Ensure status handling for badge class
        const statusText = club.status || 'Inactive'; 
        const statusBadgeClass = statusText.toLowerCase(); 

        card.innerHTML = `
            <div class="club-header">
                <div class="club-title-section">
                    <h3 class="club-title">
                        ${club.name}
                        <span class="club-status-badge ${statusBadgeClass}">${statusText}</span>
                    </h3>
                    <p class="club-category">
                        <span>${club.category}</span> • 
                        <span>${club.members} members</span>
                    </p>
                </div>
                <div class="club-actions">
                    <!-- Use club._id for MongoDB reference -->
                    <button class="btn-edit" data-id="${club._id}">
                        <span class="simple-icon">✎</span>
                        <span>Edit</span>
                    </button>
                    ${statusBadgeClass === 'active' 
                        ? `<button class="btn-deactivate" data-id="${club._id}">Deactivate</button>` 
                        : `<button class="btn-activate" data-id="${club._id}">Activate</button>`
                    }
                    <button class="btn-delete" data-id="${club._id}">
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
                        <!-- FIXED: Use 'club.meetingTime' consistently -->
                        <p class="detail-value">${club.meetingTime || 'N/A'}</p> 
                    </div>
                </div>
                <div class="detail-item">
                    <div class="detail-icon">⊕</div>
                    <div class="detail-content">
                        <p class="detail-label">Location</p>
                        <p class="detail-value">${club.location || 'N/A'}</p>
                    </div>
                </div>
            </div>

            <div class="club-description">
                <p>${club.description}</p>
            </div>
        `;

        container.appendChild(card);
    });

    // Re-add event listeners pointing to API update functions
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
    const statusFilter = document.getElementById('filter-status')?.value.toLowerCase() || '';

    const filteredClubs = clubsData.filter(club => {
        const matchesSearch = (club.name?.toLowerCase().includes(searchTerm) ||
                              club.category?.toLowerCase().includes(searchTerm));
        
        const clubStatus = club.status ? club.status.toLowerCase() : '';
        const matchesStatus = !statusFilter || clubStatus === statusFilter; 

        return matchesSearch && matchesStatus;
    });

    // Temporarily replace data to render filtered results
    const originalData = clubsData;
    clubsData = filteredClubs;
    renderClubs();
    clubsData = originalData;
}


// ============================================
// 3. CRUD API FUNCTIONS
// ============================================

/**
 * Toggles club status via API call (UPDATE - PATCH).
 * @param {string} id - The MongoDB _id of the club.
 */
async function toggleClubStatus(id) {
    const club = clubsData.find(c => c._id == id); 
    if (!club) return;

    // Determine the new status
    const currentStatus = club.status?.toLowerCase() || 'inactive';
    const newStatus = currentStatus === 'active' ? 'Inactive' : 'Active';
    
    try {
        const response = await fetch(`${API_BASE_URL}/${id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ status: newStatus }),
        });

        if (!response.ok) {
             console.error('API Status Update Failed:', await response.text());
            throw new Error('Failed to update club status on the server.');
        }

        // On success, refresh local data and re-render
        await fetchAndRenderClubs();
        showToast(`Status set to ${newStatus} for ${club.name}`, 'success');

    } catch (error) {
        console.error("Error toggling club status:", error);
        showToast('Failed to change status. Server error.', 'error');
    }
}

/**
 * Initiates the delete process (DELETE).
 * @param {string} id - The MongoDB _id of the club.
 */
function deleteClub(id) {
    const club = clubsData.find(c => c._id == id);
    if (!club) return;
    
    // Show delete confirmation modal
    const modal = document.getElementById('delete-club-modal');
    const message = document.getElementById('delete-club-message');
    message.innerHTML = `Are you sure you want to delete <strong>${club.name}</strong>?`;
    modal.classList.add('show');
    
    const confirmBtn = document.getElementById('delete-club-confirm');
    
    // Replace listener
    const newConfirmBtn = confirmBtn.cloneNode(true);
    confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);
    
    newConfirmBtn.addEventListener('click', async function() {
        modal.classList.remove('show');
        
        try {
            const response = await fetch(`${API_BASE_URL}/${id}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                console.error('API Delete Failed:', await response.text());
                throw new Error('Failed to delete club on the server.');
            }

            // On success, refresh data
            await fetchAndRenderClubs();
            showToast('Club deleted successfully!', 'success');

        } catch (error) {
            console.error("Error deleting club:", error);
            showToast('Failed to delete club. Server error.', 'error');
        }
    });
}

function editClub(id) {
    const club = clubsData.find(c => c._id == id);
    if (club) {
        showEditModal(club); 
    }
}

function openCreateModal() {
    // Empty object for creation 
    const newClub = {
        _id: null, 
        name: '',
        category: '',
        members: '',
        // FIXED: Use 'meetingTime' consistently
        meetingTime: '', 
        location: '',
        description: ''
    };
    showCreateModal(newClub);
}

// ============================================
// 4. MODAL FUNCTIONS (API SUBMISSION)
// ============================================

function showEditModal(club) {
    const modal = createFormModal('Edit Club', club, true);
    document.body.appendChild(modal);
    modal.classList.add('show');
}

function showCreateModal(newClub) {
    const modal = createFormModal('Create New Club', newClub, false);
    document.body.appendChild(modal);
    modal.classList.add('show');
}

function createFormModal(title, club, isEdit) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    
    // The HTML structure is assumed from your previous script
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
                        <input type="text" id="form-club-name" placeholder="Enter club name" value="${club.name || ''}" required>
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
                        <input type="number" id="form-club-members" placeholder="Number of members" value="${club.members || ''}" min="0" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="form-club-meeting">Meeting Time <span class="required">*</span></label>
                        <!-- ID remains generic, but input value uses consistent name -->
                        <input type="text" id="form-club-meeting" placeholder="e.g., Tuesdays 6:00 pm" value="${club.meetingTime || ''}" required> 
                    </div>
                    
                    <div class="form-group">
                        <label for="form-club-location">Location <span class="required">*</span></label>
                        <input type="text" id="form-club-location" placeholder="e.g., IK 306" value="${club.location || ''}" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="form-club-description">Description <span class="required">*</span></label>
                        <textarea id="form-club-description" placeholder="Enter club description" rows="4" required>${club.description || ''}</textarea>
                    </div>
                </form>
            </div>
            
            <div class="modal-footer">
                <button class="btn-cancel">Cancel</button>
                <button class="btn-submit">${isEdit ? 'Update Club' : 'Create Club'}</button>
            </div>
        </div>
    `;

    // Close and Cancel listeners
    modal.querySelector('.modal-close').addEventListener('click', function() {
        modal.classList.remove('show');
        setTimeout(() => modal.remove(), 300);
    });
    
    modal.querySelector('.btn-cancel').addEventListener('click', function() {
        modal.classList.remove('show');
        setTimeout(() => modal.remove(), 300);
    });
    
    // --- SUBMIT LISTENER FOR API ---
    modal.querySelector('.btn-submit').addEventListener('click', async function() {
        const name = document.getElementById('form-club-name').value;
        const category = document.getElementById('form-club-category').value;
        const members = parseInt(document.getElementById('form-club-members').value); 
        
        // FIXED: Use 'meetingTime' consistently
        const meetingTime = document.getElementById('form-club-meeting').value; 
        
        const location = document.getElementById('form-club-location').value;
        const description = document.getElementById('form-club-description').value;
        
        // Validation check
        if (!name || !category || isNaN(members) || !meetingTime || !location || !description) {
            showToast('Please fill in all required fields', 'error');
            return;
        }

        const clubPayload = {
            name,
            category,
            members, 
            meetingTime, // FIXED: Use 'meetingTime' in the payload
            location,
            description
        };

        if (isEdit) {
            // EDIT/UPDATE (PUT API call)
            try {
                const response = await fetch(`${API_BASE_URL}/${club._id}`, {
                    method: 'PUT', 
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(clubPayload), 
                });

                if (!response.ok) {
                    // CRITICAL: Log server response body for debugging Mongoose errors
                    console.error('API Update Failed:', response.status, await response.text()); 
                    throw new Error('Failed to update club.');
                }
                await fetchAndRenderClubs(); 
                showToast('Club updated successfully!', 'success');

            } catch (error) {
                console.error("Error updating club:", error);
                showToast('Failed to update club. Check console for server error details.', 'error');
            }
        } else {
            // CREATE (POST API call)
            clubPayload.status = 'Active'; 
            try {
                const response = await fetch(API_BASE_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(clubPayload),
                });

                if (!response.ok) {
                     // CRITICAL: Log server response body for debugging Mongoose errors
                    console.error('API Create Failed:', response.status, await response.text());
                    throw new Error('Failed to create club.');
                }

                await fetchAndRenderClubs(); 
                showToast('Club created successfully!', 'success');

            } catch (error) {
                console.error("Error creating club:", error);
                showToast('Failed to create club. Check console for server error details.', 'error');
            }
        }
        
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
// 5. NAVIGATION AND UTILITY FUNCTIONS
// ============================================

function initializeNavigation() {
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', function() {
            document.querySelectorAll('.nav-item').forEach(i => {
                i.classList.remove('active');
            });

            this.classList.add('active');

            const page = this.getAttribute('data-page');

            // Simplified for immediate navigation within the admin panel structure
            if (page === 'overview') {
                // Assuming index.html is the overview page
                window.location.href = 'index.html'; 
            } else if (page === 'listings') {
                // Assuming club-listings.html is the current page
                window.location.href = 'club-listings.html';
            } else if (page === 'analytics') {
                window.location.href = 'analytics.html';
            } else if (page === 'accounts') {
                window.location.href = 'accounts.html';
            }
        });
    });
}

function initializeLogout() {
    const logoutBtn = document.querySelector('.logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', showLogoutModal);
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
    // Navigate to the login page after confirmation
    window.location.href = '../../login admin/index.html';
}

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

function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <div class="toast-content">
            <span class="toast-icon">${getToastIcon(type)}</span>
            <span class="toast-message">${message}</span>
        </div>
        <button class="toast-close">&times;</button>
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => toast.classList.add('show'), 10);
    
    toast.querySelector('.toast-close').addEventListener('click', function() {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    });
    
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