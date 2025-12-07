// ============================================
// Club Profile Script (Backend-Connected)
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    // Check if we are on profile.html by looking for a unique element
    if (!document.getElementById('display-club-name')) return;

    let profileData = {};
    let isEditing = false;
    const CLUB_ID = "692c1bcb1d24903d53f74865"; // replace with actual club _id
    // 692c1bcb1d24903d53f74865 - Kupunan nila Eugene (Temporary)
    initializeProfile();
    initializeNavigation();
    initializeLogout();
    loadProfileData();

    // ============================================
    // Profile Functionality
    // ============================================

    function initializeProfile() {
        const editBtn = document.querySelector('.btn-edit-profile');
        const cancelEditBtn = document.querySelector('.btn-cancel-edit');
        const saveEditBtn = document.querySelector('.btn-save-profile');

        if (editBtn) editBtn.addEventListener('click', enterEditMode);
        if (cancelEditBtn) cancelEditBtn.addEventListener('click', exitEditMode);
        if (saveEditBtn) saveEditBtn.addEventListener('click', saveProfileChanges);
    }

    async function loadProfileData() {
        try {
            const res = await fetch(`http://localhost:3001/api/club-profile/${CLUB_ID}`);
            if (!res.ok) throw new Error('Failed to fetch club profile');
            profileData = await res.json();
            renderProfile();
        } catch (err) {
            console.error('Error loading profile:', err);
            showToast('Failed to load club profile', 'error');
        }
    }

    function renderProfile() {
        if (!profileData) return;

        document.getElementById('display-club-name').textContent = profileData.name || '';
        document.getElementById('display-description').textContent = profileData.description || '';
        document.getElementById('display-category').textContent = profileData.category || '';
        document.getElementById('display-email').textContent = profileData.contactEmail || '';
        document.getElementById('display-meeting').textContent = profileData.meetingTime || '';
        document.getElementById('display-location').textContent = profileData.location || '';

        document.getElementById('form-club-name').value = profileData.name || '';
        document.getElementById('form-description').value = profileData.description || '';
        document.getElementById('form-category').value = profileData.category || '';
        document.getElementById('form-email').value = profileData.contactEmail || '';
        document.getElementById('form-meeting').value = profileData.meetingTime || '';
        document.getElementById('form-location').value = profileData.location || '';
    }

    function enterEditMode() {
        isEditing = true;
        document.getElementById('club-info-display').style.display = 'none';
        document.getElementById('edit-mode-message').style.display = 'block';
        document.getElementById('club-info-edit').style.display = 'block';
    }

    function exitEditMode() {
        isEditing = false;
        document.getElementById('club-info-display').style.display = 'block';
        document.getElementById('edit-mode-message').style.display = 'none';
        document.getElementById('club-info-edit').style.display = 'none';
        renderProfile();
        showToast('Edit mode cancelled', 'info');
    }

    async function saveProfileChanges(e) {
        e.preventDefault();

        const updatedData = {
            name: document.getElementById('form-club-name').value.trim(),
            description: document.getElementById('form-description').value.trim(),
            category: document.getElementById('form-category').value,
            contactEmail: document.getElementById('form-email').value.trim(),
            meetingTime: document.getElementById('form-meeting').value.trim(),
            location: document.getElementById('form-location').value.trim()
        };

        // Basic validation
        for (const [key, value] of Object.entries(updatedData)) {
            if (!value) {
                showToast(`${key.replace(/([A-Z])/g, ' $1')} is required`, 'error');
                return;
            }
        }

        // Validate email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(updatedData.contactEmail)) {
            showToast('Please enter a valid email address', 'error');
            return;
        }

        try {
            const res = await fetch(`http://localhost:3001/api/club-profile/${CLUB_ID}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedData)
            });

            if (!res.ok) throw new Error('Failed to save profile');

            profileData = await res.json();
            renderProfile();
            exitEditMode();
            showToast('Profile updated successfully!', 'success');
        } catch (err) {
            console.error('Error saving profile:', err);
            showToast('Failed to save profile', 'error');
        }
    }

    // ============================================
    // Navigation & Logout
    // ============================================

    function initializeNavigation() {
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.style.cursor = 'pointer';
            item.addEventListener('click', e => {
                e.preventDefault();
                const page = item.getAttribute('data-page');

                // Map pages to the correct HTML files
                switch (page) {
                    case 'overview':
                        window.location.href = 'index.html'; // fixed mapping
                        break;
                    case 'profile':
                        window.location.href = 'profile.html';
                        break;
                    case 'members':
                        window.location.href = 'members.html';
                        break;
                    case 'applications':
                        window.location.href = 'applications.html';
                        break;
                    case 'analytics':
                        window.location.href = 'analytics.html';
                        break;
                    default:
                        console.warn('Unknown page:', page);
                }
            });
        });
    }

    function initializeLogout() {
        const logoutBtn = document.querySelector('.logout-btn');
        if (logoutBtn) logoutBtn.addEventListener('click', showLogoutModal);
    }

    function showLogoutModal() {
        const modal = document.getElementById('logout-modal');
        if (modal) modal.classList.add('show');
    }

    function hideLogoutModal() {
        const modal = document.getElementById('logout-modal');
        if (modal) modal.classList.remove('show');
    }

    function confirmLogout() {
        sessionStorage.clear();
        window.location.href = '../../login admin/index.html';
    }

    const logoutModal = document.getElementById('logout-modal');
    if (logoutModal) logoutModal.addEventListener('click', e => {
        if (e.target === logoutModal) hideLogoutModal();
    });
    const logoutCloseBtn = document.querySelector('.logout-modal-close');
    if (logoutCloseBtn) logoutCloseBtn.addEventListener('click', hideLogoutModal);
    const logoutCancelBtn = document.querySelector('.logout-modal-cancel');
    if (logoutCancelBtn) logoutCancelBtn.addEventListener('click', hideLogoutModal);
    const logoutConfirmBtn = document.querySelector('.logout-modal-confirm');
    if (logoutConfirmBtn) logoutConfirmBtn.addEventListener('click', confirmLogout);

    // ============================================
    // Toast Notification
    // ============================================

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
        toast.querySelector('.toast-close').addEventListener('click', () => {
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
            case 'success': return '✓';
            case 'error': return '✕';
            case 'warning': return '!';
            default: return 'ℹ';
        }
    }
// ============================================
// Sidebar Dropdown Functionality
// ============================================
document.querySelectorAll('.dropdown-btn').forEach(button => {
    button.addEventListener('click', () => {
        const container = button.nextElementSibling;

        if (container.style.maxHeight && container.style.maxHeight !== '0px') {
            // Close smoothly
            container.style.maxHeight = container.scrollHeight + 'px';
            requestAnimationFrame(() => {
                container.style.maxHeight = '0';
            });
            container.addEventListener('transitionend', () => {
                container.classList.remove('open');
            }, { once: true });
            button.classList.remove('active');
        } else {
            // Open smoothly
            container.classList.add('open');
            container.style.maxHeight = container.scrollHeight + 'px';
            button.classList.add('active');
        }
    });
});

    console.log('Club Profile initialized');
});
