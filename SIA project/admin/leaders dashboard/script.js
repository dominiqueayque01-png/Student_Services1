// ============================================
// Club Leaders Dashboard Script
// ============================================

// Sample data
let dashboardData = {
    stats: {
        newMembers: 8,
        totalMembers: 98,
        pendingApplications: 4,
        rejectedApplications: 5
    },
    recentApplications: [
        {
            id: 1,
            name: 'Juan Dela Cruz',
            major: 'Computer Science',
            status: 'pending',
            time: '2 hours ago'
        },
        {
            id: 2,
            name: 'Juan Mercado',
            major: 'Engineering',
            status: 'pending',
            time: '5 hours ago'
        },
        {
            id: 3,
            name: 'Juan Sy',
            major: 'Business',
            status: 'approved',
            time: '1 day ago'
        }
    ],
    newMembers: [
        {
            id: 1,
            name: 'Juan Sy',
            major: 'Computer Science',
            joined: '2025-10-25'
        },
        {
            id: 2,
            name: 'Juan Sy',
            major: 'Computer Science',
            joined: '2025-10-25'
        },
        {
            id: 3,
            name: 'Juan Sy',
            major: 'Computer Science',
            joined: '2025-10-25'
        },
        {
            id: 4,
            name: 'Juan Sy',
            major: 'Computer Science',
            joined: '2025-10-25'
        },
        {
            id: 5,
            name: 'Juan Sy',
            major: 'Computer Science',
            joined: '2025-10-25'
        },
        {
            id: 6,
            name: 'Juan Sy',
            major: 'Computer Science',
            joined: '2025-10-25'
        }
    ]
};

document.addEventListener('DOMContentLoaded', function() {
    initializeDashboard();
    initializeNavigation();
    initializeLogout();
    loadDashboardData();
    renderDashboard();
});

// ============================================
// Dashboard Functionality
// ============================================

function initializeDashboard() {
    // Setup stat editing
    const statValues = document.querySelectorAll('.stat-value');
    const statMeta = document.querySelectorAll('.stat-meta');

    statValues.forEach((value, index) => {
        value.title = 'Click to edit value';
        value.addEventListener('click', function(e) {
            e.stopPropagation();
            editStatValue(this, index);
        });
    });

    statMeta.forEach((meta, index) => {
        meta.title = 'Click to edit description';
        meta.addEventListener('click', function(e) {
            e.stopPropagation();
            editStatMeta(this, index);
        });
    });
}

function loadDashboardData() {
    const savedData = localStorage.getItem('clubLeadersDashboard');
    if (savedData) {
        dashboardData = JSON.parse(savedData);
    } else {
        saveDashboardData();
    }
}

function saveDashboardData() {
    localStorage.setItem('clubLeadersDashboard', JSON.stringify(dashboardData));
}

function renderDashboard() {
    renderStats();
    renderRecentApplications();
    renderNewMembers();
}

function renderStats() {
    const statValues = document.querySelectorAll('.stat-value');
    
    statValues[0].textContent = dashboardData.stats.newMembers;
    statValues[1].textContent = dashboardData.stats.totalMembers;
    statValues[2].textContent = dashboardData.stats.pendingApplications;
    statValues[3].textContent = dashboardData.stats.rejectedApplications;
}

function renderRecentApplications() {
    const container = document.getElementById('recent-applications-list');
    if (!container) return;

    container.innerHTML = '';

    if (dashboardData.recentApplications.length === 0) {
        container.innerHTML = '<p class="empty-state">No recent applications</p>';
        return;
    }

    dashboardData.recentApplications.forEach(app => {
        const item = document.createElement('div');
        item.className = 'application-item';
        item.innerHTML = `
            <div class="application-header">
                <h3 class="application-name">${app.name}</h3>
                <span class="application-status ${app.status}">${app.status}</span>
            </div>
            <p class="application-meta">
                <span class="application-major">${app.major}</span><br>
                <span class="application-time">${app.time}</span>
            </p>
        `;
        container.appendChild(item);
    });
}

function renderNewMembers() {
    const container = document.getElementById('new-members-list');
    if (!container) return;

    container.innerHTML = '';

    if (dashboardData.newMembers.length === 0) {
        container.innerHTML = '<p class="empty-state">No new members</p>';
        return;
    }

    dashboardData.newMembers.forEach(member => {
        const item = document.createElement('div');
        item.className = 'member-item';
        item.innerHTML = `
            <div class="member-info">
                <p class="member-name">${member.name}</p>
                <p class="member-major">${member.major}</p>
            </div>
            <p class="member-date">Joined ${member.joined}</p>
        `;
        container.appendChild(item);
    });
}

function editStatValue(element, index) {
    const currentValue = element.textContent.trim();
    const newValue = prompt('Enter new value:', currentValue);

    if (newValue !== null && !isNaN(newValue) && newValue >= 0) {
        const statKeys = ['newMembers', 'totalMembers', 'pendingApplications', 'rejectedApplications'];
        dashboardData.stats[statKeys[index]] = parseInt(newValue);
        
        element.textContent = newValue;
        element.classList.add('editable');
        setTimeout(() => {
            element.classList.remove('editable');
        }, 500);

        saveDashboardData();
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

        saveDashboardData();
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

console.log('Club Leaders Dashboard initialized');
