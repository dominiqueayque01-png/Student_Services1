// ============================================
// Club Profile Script
// ============================================

// Sample profile data
let profileData = {
    clubName: 'ABC 123 Club',
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua',
    category: 'Business',
    contactEmail: 'abc@edu.ph',
    meetingSchedule: 'Monday, 6:00 pm',
    location: 'IK 604, Academic Building'
};

let isEditing = false;

document.addEventListener('DOMContentLoaded', function() {
    initializeProfile();
    initializeNavigation();
    initializeLogout();
    loadProfileData();
    renderProfile();
});

// ============================================
// Profile Functionality
// ============================================

function initializeProfile() {
    const editBtn = document.querySelector('.btn-edit-profile');
    const cancelEditBtn = document.querySelector('.btn-cancel-edit');
    const saveEditBtn = document.querySelector('.btn-save-profile');

    if (editBtn) {
        editBtn.addEventListener('click', enterEditMode);
    }

    if (cancelEditBtn) {
        cancelEditBtn.addEventListener('click', exitEditMode);
    }

    if (saveEditBtn) {
        saveEditBtn.addEventListener('click', saveProfileChanges);
    }
}

function loadProfileData() {
    const savedData = localStorage.getItem('clubProfile');
    if (savedData) {
        profileData = JSON.parse(savedData);
    } else {
        saveProfileData();
    }
}

function saveProfileData() {
    localStorage.setItem('clubProfile', JSON.stringify(profileData));
}

function renderProfile() {
    // Update display view
    document.getElementById('display-club-name').textContent = profileData.clubName;
    document.getElementById('display-description').textContent = profileData.description;
    document.getElementById('display-category').textContent = profileData.category;
    document.getElementById('display-email').textContent = profileData.contactEmail;
    document.getElementById('display-meeting').textContent = profileData.meetingSchedule;
    document.getElementById('display-location').textContent = profileData.location;

    // Fill form with current data
    document.getElementById('form-club-name').value = profileData.clubName;
    document.getElementById('form-description').value = profileData.description;
    document.getElementById('form-category').value = profileData.category;
    document.getElementById('form-email').value = profileData.contactEmail;
    document.getElementById('form-meeting').value = profileData.meetingSchedule;
    document.getElementById('form-location').value = profileData.location;
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

function saveProfileChanges(e) {
    e.preventDefault();

    const clubName = document.getElementById('form-club-name').value.trim();
    const description = document.getElementById('form-description').value.trim();
    const category = document.getElementById('form-category').value;
    const contactEmail = document.getElementById('form-email').value.trim();
    const meetingSchedule = document.getElementById('form-meeting').value.trim();
    const location = document.getElementById('form-location').value.trim();

    // Validate required fields
    if (!clubName) {
        showToast('Club Name is required', 'error');
        return;
    }
    if (!description) {
        showToast('Description is required', 'error');
        return;
    }
    if (!category) {
        showToast('Category is required', 'error');
        return;
    }
    if (!contactEmail) {
        showToast('Contact Email is required', 'error');
        return;
    }
    if (!meetingSchedule) {
        showToast('Meeting Schedule is required', 'error');
        return;
    }
    if (!location) {
        showToast('Location is required', 'error');
        return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(contactEmail)) {
        showToast('Please enter a valid email address', 'error');
        return;
    }

    // Update profile data
    profileData.clubName = clubName;
    profileData.description = description;
    profileData.category = category;
    profileData.contactEmail = contactEmail;
    profileData.meetingSchedule = meetingSchedule;
    profileData.location = location;

    // Save to localStorage
    saveProfileData();

    // Exit edit mode and show display
    isEditing = false;
    document.getElementById('club-info-display').style.display = 'block';
    document.getElementById('edit-mode-message').style.display = 'none';
    document.getElementById('club-info-edit').style.display = 'none';
    
    // Render updated data
    renderProfile();
    
    // Show success message
    showToast('Profile updated successfully!', 'success');
}

// ============================================
// Navigation
// ============================================

function initializeNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    
    navItems.forEach(item => {
        item.style.cursor = 'pointer';
        item.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            
            const page = this.getAttribute('data-page');
            
            if (page === 'overview') {
                window.location.href = 'index.html';
            } else if (page === 'profile') {
                window.location.href = 'profile.html';
            } else if (page === 'members') {
                window.location.href = 'members.html';
            } else if (page === 'applications') {
                window.location.href = 'applications.html';
            } else if (page === 'analytics') {
                window.location.href = 'analytics.html';
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

console.log('Club Profile initialized');