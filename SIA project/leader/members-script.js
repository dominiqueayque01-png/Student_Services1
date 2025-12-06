// ============================================
// Club Members Script (Backend-Connected)
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    let membersData = [];
    const CLUB_ID = "692c1bcb1d24903d53f74865"; // Replace with actual club _id

    // ============================================
    // Fetch Members Data from Backend
    // ============================================
    async function loadMembersData() {
        try {
            // Updated endpoint to fetch approved members
            const res = await fetch(`http://localhost:3001/api/club-profile/${CLUB_ID}/members`);
            if (!res.ok) throw new Error('Failed to fetch members');
            membersData = await res.json();
            renderMembers();
        } catch (err) {
            console.error('Error loading members:', err);
            document.getElementById('members-table-body').innerHTML =
                '<tr><td colspan="6" style="text-align:center; padding:40px;">Failed to load members</td></tr>';
        }
    }

    // ============================================
    // Format date
    // ============================================
    function formatDate(dateString) {
        const date = new Date(dateString);
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return date.toLocaleDateString('en-US', options);
    }

    // ============================================
    // Render members table
    // ============================================
    function renderMembers(membersToDisplay = membersData) {
        const tableBody = document.getElementById('members-table-body');

        if (membersToDisplay.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:40px;">No members found</td></tr>';
            return;
        }

        tableBody.innerHTML = membersToDisplay.map(member => `
            <tr>
                <td class="table-name">${member.name}</td>
                <td class="table-email">${member.email}</td>
                <td class="table-major">${member.major}</td>
                <td class="table-joined">${formatDate(member.joinedDate)}</td>
                <td>
                    <span class="table-status ${member.status.toLowerCase()}">
                        ${member.status}
                    </span>
                </td>
                <td class="table-actions">
                    <button class="btn-action btn-edit" onclick="editMember('${member._id}')" title="Edit">✎</button>
                    <button class="btn-action btn-remove" onclick="removeMember('${member._id}')" title="Remove">✕</button>
                </td>
            </tr>
        `).join('');
    }

    // ============================================
    // Filter members
    // ============================================
    function filterMembers() {
        const searchTerm = document.getElementById('search-input').value.toLowerCase();
        const selectedStatus = document.getElementById('status-filter').value;

        return membersData.filter(member => {
            const matchesSearch = member.name.toLowerCase().includes(searchTerm) ||
                                  member.email.toLowerCase().includes(searchTerm) ||
                                  member.major.toLowerCase().includes(searchTerm);
            const matchesStatus = selectedStatus === 'all' || member.status.toLowerCase() === selectedStatus.toLowerCase();
            return matchesSearch && matchesStatus;
        });
    }

    // ============================================
    // Edit Member
    // ============================================
    window.editMember = function(memberId) {
        const member = membersData.find(m => m._id === memberId);
        if (!member) return;

        const modal = document.createElement('div');
        modal.className = 'edit-member-modal modal-overlay';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Edit Member</h2>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label for="edit-member-name">Name <span class="required">*</span></label>
                        <input type="text" id="edit-member-name" value="${member.name}">
                    </div>
                    <div class="form-group">
                        <label for="edit-member-email">Email <span class="required">*</span></label>
                        <input type="email" id="edit-member-email" value="${member.email}">
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn-cancel">Cancel</button>
                    <button class="btn-submit">Save Changes</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        modal.classList.add('show');

        // Close modal
        modal.querySelector('.modal-close').addEventListener('click', () => closeModal(modal));
        modal.querySelector('.btn-cancel').addEventListener('click', () => closeModal(modal));

        // Save changes
        modal.querySelector('.btn-submit').addEventListener('click', async () => {
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

            try {
                const res = await fetch(`http://localhost:3001/api/club-members/${memberId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name: newName, email: newEmail })
                });
                if (!res.ok) throw new Error('Failed to update member');

                const updatedMember = await res.json();
                membersData = membersData.map(m => m._id === memberId ? updatedMember : m);
                renderMembers(filterMembers());
                closeModal(modal);
                showMemberToast('success', 'Member updated successfully!');
            } catch (err) {
                console.error(err);
                showMemberToast('error', 'Failed to update member');
            }
        });

        modal.addEventListener('click', e => {
            if (e.target === modal) closeModal(modal);
        });
    };

    // ============================================
    // Remove Member
    // ============================================
    window.removeMember = function(memberId) {
        const member = membersData.find(m => m._id === memberId);
        if (!member) return;

        const modal = document.createElement('div');
        modal.className = 'remove-member-modal modal-overlay';
        modal.innerHTML = `
            <div class="modal-content modal-confirm">
                <div class="modal-header">
                    <h2>Remove Member?</h2>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <p>Are you sure you want to remove <strong>${member.name}</strong> from the club?</p>
                </div>
                <div class="modal-footer">
                    <button class="btn-cancel">Cancel</button>
                    <button class="btn-delete">Remove</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        modal.classList.add('show');

        modal.querySelector('.modal-close').addEventListener('click', () => closeModal(modal));
        modal.querySelector('.btn-cancel').addEventListener('click', () => closeModal(modal));

        modal.querySelector('.btn-delete').addEventListener('click', async () => {
            try {
                const res = await fetch(`http://localhost:3001/api/club-members/${memberId}`, { method: 'DELETE' });
                if (!res.ok) throw new Error('Failed to delete member');

                membersData = membersData.filter(m => m._id !== memberId);
                renderMembers(filterMembers());
                closeModal(modal);
                showMemberToast('success', `${member.name} removed successfully!`);
            } catch (err) {
                console.error(err);
                showMemberToast('error', 'Failed to remove member');
            }
        });

        modal.addEventListener('click', e => {
            if (e.target === modal) closeModal(modal);
        });
    };

    function closeModal(modal) {
        modal.classList.remove('show');
        setTimeout(() => modal.remove(), 300);
    }

    // ============================================
    // Toast Notification
    // ============================================
    function showMemberToast(type, message) {
        const existingToast = document.querySelector('.member-toast');
        if (existingToast) existingToast.remove();

        const toast = document.createElement('div');
        toast.className = `member-toast ${type}`;
        const icon = type === 'success' ? '✓' : '!';
        toast.innerHTML = `<span class="toast-icon">${icon}</span><span class="toast-message">${message}</span>`;
        document.body.appendChild(toast);
        setTimeout(() => toast.classList.add('show'), 10);
        setTimeout(() => { toast.classList.remove('show'); setTimeout(() => toast.remove(), 300); }, 4000);
    }

    // ============================================
    // Initialize Page
    // ============================================
    loadMembersData();

    // Search & Filter
    document.getElementById('search-input').addEventListener('input', () => renderMembers(filterMembers()));
    document.getElementById('status-filter').addEventListener('change', () => renderMembers(filterMembers()));

    // Navigation & Logout
    initializeNavigationAndLogout();

    function initializeNavigationAndLogout() {
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.style.cursor = 'pointer';
            item.addEventListener('click', e => {
                e.preventDefault();
                const page = item.getAttribute('data-page');
                switch(page) {
                    case 'overview': window.location.href='index.html'; break;
                    case 'profile': window.location.href='profile.html'; break;
                    case 'members': window.location.href='members.html'; break;
                    case 'applications': window.location.href='applications.html'; break;
                    case 'analytics': window.location.href='analytics.html'; break;
                }
            });
        });

        const logoutBtn = document.querySelector('.logout-btn');
        const logoutModal = document.getElementById('logout-modal');
        const logoutConfirmBtn = document.querySelector('.logout-modal-confirm');
        const logoutCancelBtn = document.querySelector('.logout-modal-cancel');
        const logoutCloseBtn = document.querySelector('.logout-modal-close');

        if (logoutBtn) logoutBtn.addEventListener('click', () => logoutModal.classList.add('show'));
        if (logoutCancelBtn) logoutCancelBtn.addEventListener('click', () => logoutModal.classList.remove('show'));
        if (logoutCloseBtn) logoutCloseBtn.addEventListener('click', () => logoutModal.classList.remove('show'));
        if (logoutConfirmBtn) logoutConfirmBtn.addEventListener('click', () => {
            sessionStorage.clear();
            window.location.href='../../login admin/index.html';
        });

        logoutModal.addEventListener('click', e => {
            if (e.target === logoutModal) logoutModal.classList.remove('show');
        });
    }
});
