// Sample members data
let membersData = [
    {
        id: 1,
        name: 'Maria Santos',
        email: 'maria.santos@edu.ph',
        major: 'Computer Science',
        joinedDate: '2025-08-15',
        status: 'active'
    },
    {
        id: 2,
        name: 'Juan Cruz',
        email: 'juan.cruz@edu.ph',
        major: 'Information Technology',
        joinedDate: '2025-09-02',
        status: 'active'
    },
    {
        id: 3,
        name: 'Rosa Garcia',
        email: 'rosa.garcia@edu.ph',
        major: 'Business Administration',
        joinedDate: '2025-08-20',
        status: 'active'
    },
    {
        id: 4,
        name: 'Carlos Reyes',
        email: 'carlos.reyes@edu.ph',
        major: 'Engineering',
        joinedDate: '2025-09-10',
        status: 'active'
    },
    {
        id: 5,
        name: 'Ana Lopez',
        email: 'ana.lopez@edu.ph',
        major: 'Computer Science',
        joinedDate: '2025-07-25',
        status: 'inactive'
    },
    {
        id: 6,
        name: 'Pedro Gonzalez',
        email: 'pedro.gonzalez@edu.ph',
        major: 'Business Administration',
        joinedDate: '2025-08-30',
        status: 'active'
    }
];

// Load members data from localStorage
function loadMembersData() {
    const saved = localStorage.getItem('clubMembers');
    if (saved) {
        membersData = JSON.parse(saved);
    }
}

// Save members data to localStorage
function saveMembersData() {
    localStorage.setItem('clubMembers', JSON.stringify(membersData));
}

// Format date to readable format
function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

// Render members table
function renderMembers(membersToDisplay = membersData) {
    const tableBody = document.getElementById('members-table-body');
    
    if (membersToDisplay.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 40px;">No members found</td></tr>';
        return;
    }

    tableBody.innerHTML = membersToDisplay.map(member => `
        <tr>
            <td class="table-name">${member.name}</td>
            <td class="table-email">${member.email}</td>
            <td class="table-major">${member.major}</td>
            <td class="table-joined">${formatDate(member.joinedDate)}</td>
            <td>
                <span class="table-status ${member.status}">
                    ${member.status}
                </span>
            </td>
            <td class="table-actions">
                <button class="btn-action btn-edit" onclick="editMember(${member.id})" title="Edit">✎</button>
                <button class="btn-action btn-remove" onclick="removeMember(${member.id})" title="Remove">✕</button>
            </td>
        </tr>
    `).join('');
}

// Edit member with modal
function editMember(memberId) {
    const member = membersData.find(m => m.id === memberId);
    if (!member) return;

    // Create edit modal
    const modal = document.createElement('div');
    modal.className = 'edit-member-modal modal-overlay';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>Edit Member</h2>
                <button class="modal-close" type="button">&times;</button>
            </div>
            <div class="modal-body">
                <div class="form-group">
                    <label for="edit-member-name">Name <span class="required">*</span></label>
                    <input type="text" id="edit-member-name" value="${member.name}" placeholder="Enter member name">
                </div>
                <div class="form-group">
                    <label for="edit-member-email">Email <span class="required">*</span></label>
                    <input type="email" id="edit-member-email" value="${member.email}" placeholder="Enter member email">
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn-cancel" type="button">Cancel</button>
                <button class="btn-submit" type="button">Save Changes</button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    modal.classList.add('show');

    // Close button
    modal.querySelector('.modal-close').addEventListener('click', () => {
        modal.classList.remove('show');
        setTimeout(() => modal.remove(), 300);
    });

    // Cancel button
    modal.querySelector('.btn-cancel').addEventListener('click', () => {
        modal.classList.remove('show');
        setTimeout(() => modal.remove(), 300);
    });

    // Submit button
    modal.querySelector('.btn-submit').addEventListener('click', () => {
        const newName = document.getElementById('edit-member-name').value.trim();
        const newEmail = document.getElementById('edit-member-email').value.trim();

        if (!newName || !newEmail) {
            showMemberToast('error', 'Please fill in all required fields');
            return;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) {
            showMemberToast('error', 'Please enter a valid email address');
            return;
        }

        member.name = newName;
        member.email = newEmail;

        saveMembersData();
        renderMembers(filterMembers());
        modal.classList.remove('show');
        setTimeout(() => modal.remove(), 300);
        showMemberToast('success', 'Member updated successfully!');
    });

    // Close on overlay click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('show');
            setTimeout(() => modal.remove(), 300);
        }
    });
}

// Remove member from club
function removeMember(memberId) {
    const member = membersData.find(m => m.id === memberId);
    if (!member) return;

    // Create confirmation modal
    const modal = document.createElement('div');
    modal.className = 'remove-member-modal modal-overlay';
    modal.innerHTML = `
        <div class="modal-content modal-confirm">
            <div class="modal-header">
                <h2>Remove Member?</h2>
                <button class="modal-close" type="button">&times;</button>
            </div>
            <div class="modal-body">
                <p>Are you sure you want to remove <strong>${member.name}</strong> from the club? This action cannot be undone.</p>
            </div>
            <div class="modal-footer">
                <button class="btn-cancel" type="button">Cancel</button>
                <button class="btn-delete" type="button">Remove</button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    modal.classList.add('show');

    // Close button
    modal.querySelector('.modal-close').addEventListener('click', () => {
        modal.classList.remove('show');
        setTimeout(() => modal.remove(), 300);
    });

    // Cancel button
    modal.querySelector('.btn-cancel').addEventListener('click', () => {
        modal.classList.remove('show');
        setTimeout(() => modal.remove(), 300);
    });

    // Delete button
    modal.querySelector('.btn-delete').addEventListener('click', () => {
        membersData = membersData.filter(m => m.id !== memberId);
        saveMembersData();
        renderMembers(filterMembers());
        modal.classList.remove('show');
        setTimeout(() => modal.remove(), 300);
        showMemberToast('success', `${member.name} removed successfully!`);
    });

    // Close on overlay click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('show');
            setTimeout(() => modal.remove(), 300);
        }
    });
}

// Toggle member status
function toggleMemberStatus(memberId) {
    const member = membersData.find(m => m.id === memberId);
    if (member) {
        member.status = member.status === 'active' ? 'inactive' : 'active';
        saveMembersData();
        renderMembers(filterMembers());
    }
}

// Filter and search members
function filterMembers() {
    const searchInput = document.getElementById('search-input');
    const statusFilter = document.getElementById('status-filter');

    const searchTerm = searchInput.value.toLowerCase();
    const selectedStatus = statusFilter.value;

    return membersData.filter(member => {
        const matchesSearch = member.name.toLowerCase().includes(searchTerm) ||
                            member.email.toLowerCase().includes(searchTerm) ||
                            member.major.toLowerCase().includes(searchTerm);
        
        const matchesStatus = selectedStatus === 'all' || member.status === selectedStatus;

        return matchesSearch && matchesStatus;
    });
}

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    loadMembersData();
    renderMembers();

    // Setup search and filter listeners
    const searchInput = document.getElementById('search-input');
    const statusFilter = document.getElementById('status-filter');

    searchInput.addEventListener('input', () => {
        renderMembers(filterMembers());
    });

    statusFilter.addEventListener('change', () => {
        renderMembers(filterMembers());
    });

    // Navigation
    const navItems = document.querySelectorAll('.nav-item');
    
    navItems.forEach(item => {
        item.style.cursor = 'pointer';
        item.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            
            const page = this.getAttribute('data-page');
            console.log('Navigating to:', page);
            
            if (page === 'overview') {
                window.location.href = 'index.html';
                return false;
            } else if (page === 'profile') {
                window.location.href = 'profile.html';
                return false;
            } else if (page === 'members') {
                window.location.href = 'members.html';
                return false;
            } else if (page === 'applications') {
                window.location.href = 'applications.html';
                return false;
            } else if (page === 'analytics') {
                window.location.href = 'analytics.html';
                return false;
            }
        });
    });

    // Logout functionality
    const logoutBtn = document.querySelector('.logout-btn');
    const logoutModal = document.getElementById('logout-modal');
    const logoutConfirmBtn = document.querySelector('.logout-modal-confirm');
    const logoutCancelBtn = document.querySelector('.logout-modal-cancel');
    const logoutCloseBtn = document.querySelector('.logout-modal-close');

    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            logoutModal.classList.add('show');
        });
    }

    if (logoutCancelBtn) {
        logoutCancelBtn.addEventListener('click', function() {
            logoutModal.classList.remove('show');
        });
    }

    if (logoutCloseBtn) {
        logoutCloseBtn.addEventListener('click', function() {
            logoutModal.classList.remove('show');
        });
    }

    if (logoutConfirmBtn) {
        logoutConfirmBtn.addEventListener('click', function() {
            alert('You have been logged out successfully!');
            window.location.href = '../../login admin/index.html';
        });
    }

    // Close modal when clicking outside
    logoutModal.addEventListener('click', function(e) {
        if (e.target === logoutModal) {
            logoutModal.classList.remove('show');
        }
    });
});

// ============================================
// Toast Notification
// ============================================
function showMemberToast(type, message) {
    // Remove existing toast if present
    const existingToast = document.querySelector('.member-toast');
    if (existingToast) {
        existingToast.remove();
    }

    // Create toast element
    const toast = document.createElement('div');
    toast.className = `member-toast ${type}`;
    
    // Add icon based on type
    const icon = type === 'success' ? '✓' : '!';
    toast.innerHTML = `
        <span class="toast-icon">${icon}</span>
        <span class="toast-message">${message}</span>
    `;
    
    document.body.appendChild(toast);
    
    // Trigger animation
    setTimeout(() => {
        toast.classList.add('show');
    }, 10);
    
    // Auto-remove after 4 seconds
    setTimeout(function() {
        toast.classList.remove('show');
        setTimeout(function() {
            toast.remove();
        }, 300);
    }, 4000);
}