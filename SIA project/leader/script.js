// ============================================
// Club Leaders Dashboard Script (Live API)
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    initializeDashboard();
    initializeLogout();
    loadDashboardStats();
    loadDashboardLists();
    setActiveNavItem();
});

// ============================================
// Dashboard Functionality
// ============================================

function initializeDashboard() {
    const statValues = document.querySelectorAll('.stat-value');
    const statMeta = document.querySelectorAll('.stat-meta');

    statValues.forEach((value, index) => {
        value.title = 'Click to edit value';
        value.addEventListener('click', e => { e.stopPropagation(); editStatValue(value, index); });
    });

    statMeta.forEach((meta, index) => {
        meta.title = 'Click to edit description';
        meta.addEventListener('click', e => { e.stopPropagation(); editStatMeta(meta, index); });
    });
}

// ============================================
// Fetch Stats from Backend
// ============================================
async function loadDashboardStats() {
    try {
        const res = await fetch('http://localhost:3001/api/leader-overview/summary');
        const data = await res.json();

        const statValues = document.querySelectorAll('.stat-value');

        // Map API data to stat cards
        statValues[0].textContent = data.newMembers || 0;           // New Members
        statValues[1].textContent = data.totalMembers || 0;         // Total Members
        statValues[2].textContent = data.pendingApplications || 0;  // Pending Applications
        statValues[3].textContent = data.rejectedApplications || 0; // Rejected Applications
    } catch (err) {
        console.error('Error fetching stats:', err);
    }
}

// ============================================
// Fetch Recent Applications & New Members
// ============================================
async function loadDashboardLists() {
    try {
        // --- Recent Applications ---
        const resApps = await fetch('http://localhost:3001/api/leader-overview/recent-applications');
        const applications = await resApps.json();
        const appListEl = document.getElementById('recent-applications-list');

        if (appListEl) {
            appListEl.innerHTML = applications.length ? applications.map(app => `
                <div class="application-item">
                    <div class="application-header">
                        <h3 class="application-name">${app.fullName}</h3>
                        <span class="application-status ${app.status.toLowerCase()}">${app.status}</span>
                    </div>
                    <p class="application-meta">
                        <span class="application-major">${app.program} - ${app.year}</span>
                    </p>
                </div>
            `).join('') : '<p class="empty-state">No recent applications</p>';
        }

        // --- New Members (latest active clubs) ---
        const resMembers = await fetch('http://localhost:3001/api/leader-overview/new-members');
        const members = await resMembers.json();
        const membersListEl = document.getElementById('new-members-list');

        if (membersListEl) {
            membersListEl.innerHTML = members.length ? members.map(m => `
                <div class="member-item">
                    <div class="member-info">
                        <p class="member-name">${m.name}</p>
                        <p class="member-major">${m.category}</p>
                    </div>
                    <p class="member-date">Members: ${m.members}</p>
                </div>
            `).join('') : '<p class="empty-state">No new members</p>';
        }

    } catch (err) {
        console.error('Error fetching lists:', err);
    }
}

// ============================================
// Stats Editing
// ============================================

function editStatValue(element, index) {
    const currentValue = element.textContent.trim();
    const newValue = prompt('Enter new value:', currentValue);

    if (newValue !== null && !isNaN(newValue) && newValue >= 0) {
        element.textContent = newValue;
        element.classList.add('editable');
        setTimeout(() => element.classList.remove('editable'), 500);
    }
}

function editStatMeta(element, index) {
    const currentValue = element.textContent.trim();
    const newValue = prompt('Enter new description:', currentValue);

    if (newValue !== null && newValue.trim() !== '') {
        element.textContent = newValue;
        element.classList.add('editable');
        setTimeout(() => element.classList.remove('editable'), 500);
    }
}

// ============================================
// Navigation
// ============================================
function setActiveNavItem() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navItems = document.querySelectorAll('.nav-item');

    navItems.forEach(item => {
        const href = item.getAttribute('href');
        item.classList.toggle('active', href === currentPage || (currentPage === '' && href === 'index.html'));
    });
}

// ============================================
// Logout
// ============================================
function initializeLogout() {
    const logoutBtn = document.querySelector('.logout-btn');
    if (logoutBtn) logoutBtn.addEventListener('click', showLogoutModal);
}

function showLogoutModal() { document.getElementById('logout-modal')?.classList.add('show'); }
function hideLogoutModal() { document.getElementById('logout-modal')?.classList.remove('show'); }
function confirmLogout() {
    sessionStorage.clear();
    window.location.href = '../../login admin/index.html';
}

// Logout modal events
const logoutModal = document.getElementById('logout-modal');
logoutModal?.addEventListener('click', e => { if (e.target === logoutModal) hideLogoutModal(); });
document.querySelector('.logout-modal-close')?.addEventListener('click', hideLogoutModal);
document.querySelector('.logout-modal-cancel')?.addEventListener('click', hideLogoutModal);
document.querySelector('.logout-modal-confirm')?.addEventListener('click', confirmLogout);

console.log('Club Leaders Dashboard initialized');
