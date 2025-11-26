// ============================================
// Club Profile Script
// ============================================

// Sample profile data
let profileData = {
    clubName: 'ABC 123 Club',
    description: 'Lorem ipsium dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua',
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
    const saveBtn = document.querySelector('.btn-save');
    const cancelBtn = document.querySelector('.btn-cancel');

    if (saveBtn) {
        saveBtn.addEventListener('click', saveProfileChanges);
    }

    if (cancelBtn) {
        cancelBtn.addEventListener('click', cancelEditing);
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
    // Fill form with current data
    const clubNameInput = document.getElementById('club-name');
    const descriptionInput = document.getElementById('description');
    const categorySelect = document.getElementById('category');
    const emailInput = document.getElementById('contact-email');
    const scheduleInput = document.getElementById('meeting-schedule');
    const locationInput = document.getElementById('location');

    if (clubNameInput) clubNameInput.value = profileData.clubName;
    if (descriptionInput) descriptionInput.value = profileData.description;
    if (categorySelect) categorySelect.value = profileData.category;
    if (emailInput) emailInput.value = profileData.contactEmail;
    if (scheduleInput) scheduleInput.value = profileData.meetingSchedule;
    if (locationInput) locationInput.value = profileData.location;
}

function saveProfileChanges() {
    const clubNameInput = document.getElementById('club-name');
    const descriptionInput = document.getElementById('description');
    const categorySelect = document.getElementById('category');
    const emailInput = document.getElementById('contact-email');
    const scheduleInput = document.getElementById('meeting-schedule');
    const locationInput = document.getElementById('location');

    // Validate required fields
    if (!clubNameInput.value.trim()) {
        alert('Club Name is required');
        return;
    }
    if (!descriptionInput.value.trim()) {
        alert('Description is required');
        return;
    }
    if (!emailInput.value.trim()) {
        alert('Contact Email is required');
        return;
    }
    if (!scheduleInput.value.trim()) {
        alert('Meeting Schedule is required');
        return;
    }
    if (!locationInput.value.trim()) {
        alert('Location is required');
        return;
    }

    // Update profile data
    profileData.clubName = clubNameInput.value.trim();
    profileData.description = descriptionInput.value.trim();
    profileData.category = categorySelect.value;
    profileData.contactEmail = emailInput.value.trim();
    profileData.meetingSchedule = scheduleInput.value.trim();
    profileData.location = locationInput.value.trim();

    // Save to localStorage
    saveProfileData();

    // Show success message
    alert('Profile changes saved successfully!');
    isEditing = false;
}

function cancelEditing() {
    if (confirm('Discard changes and reload profile?')) {
        renderProfile();
        isEditing = false;
    }
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

console.log('Club Profile initialized');
