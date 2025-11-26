// ============================================
// Club Admin Dashboard Script
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    initializeStats();
    initializeNavigation();
    initializeLogout();
});

// ============================================
// Stats Functionality
// ============================================

function initializeStats() {
    const statValues = document.querySelectorAll('.stat-value');
    const statMeta = document.querySelectorAll('.stat-meta');

    // Make stat values editable
    statValues.forEach((value, index) => {
        value.title = 'Click to edit value';
        value.addEventListener('click', function(e) {
            e.stopPropagation();
            editStatValue(this, index);
        });
    });

    // Make stat descriptions editable
    statMeta.forEach((meta, index) => {
        meta.title = 'Click to edit description';
        meta.addEventListener('click', function(e) {
            e.stopPropagation();
            editStatMeta(this, index);
        });
    });
}

function editStatValue(element, index) {
    const currentValue = element.textContent.trim();
    const newValue = prompt('Enter new value:', currentValue);

    if (newValue !== null && newValue.trim() !== '') {
        if (/^\d+$/.test(newValue)) {
            element.textContent = newValue;
            element.classList.add('editable');
            setTimeout(() => {
                element.classList.remove('editable');
            }, 500);

            // Save to localStorage
            saveClubStats();
        } else {
            alert('Please enter a valid number');
        }
    }
}

function editStatMeta(element, index) {
    const currentValue = element.textContent.trim();
    const newValue = prompt('Enter new description:', currentValue);

    if (newValue !== null && newValue.trim() !== '') {
        element.textContent = newValue;
        element.classList.add('editable');
        setTimeout(() => {
            element.classList.remove('editable');
        }, 500);

        // Save to localStorage
        saveClubStats();
    }
}

function saveClubStats() {
    const statValues = document.querySelectorAll('.stat-value');
    const stats = {
        totalClubs: statValues[0]?.textContent.trim(),
        totalMembers: statValues[1]?.textContent.trim(),
        activeCategories: statValues[2]?.textContent.trim(),
        avgClubSize: statValues[3]?.textContent.trim()
    };

    localStorage.setItem('clubStats', JSON.stringify(stats));
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

console.log('Club Admin Dashboard initialized');
