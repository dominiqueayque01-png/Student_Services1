// ============================================
// Accounts Management Script
// ============================================

// Sample accounts data
let accountsData = [
    {
        id: 1,
        name: 'Juan Sy',
        email: 'juan.edu.ph',
        username: 'Leader_Debate_Club',
        created: '2025-10-25',
        status: 'active'
    },
    {
        id: 2,
        name: 'Juan Sy',
        email: 'juan.edu.ph',
        username: 'Leader_Debate_Club',
        created: '2025-10-25',
        status: 'active'
    },
    {
        id: 3,
        name: 'Juan Sy',
        email: 'juan.edu.ph',
        username: 'Leader_Debate_Club',
        created: '2025-10-25',
        status: 'active'
    },
    {
        id: 4,
        name: 'Juan Sy',
        email: 'juan.edu.ph',
        username: 'Leader_Debate_Club',
        created: '2025-10-25',
        status: 'active'
    }
];

document.addEventListener('DOMContentLoaded', function() {
    initializeAccounts();
    initializeNavigation();
    initializeLogout();
    loadAccountsData();
    renderAccounts();
});

// ============================================
// Accounts Management Functionality
// ============================================

function initializeAccounts() {
    // Setup search functionality
    const searchBox = document.getElementById('search-accounts');
    if (searchBox) {
        searchBox.addEventListener('input', filterAccounts);
    }

    // Setup create account button
    const createBtn = document.querySelector('.btn-create-account');
    if (createBtn) {
        createBtn.addEventListener('click', openCreateAccountModal);
    }
}

function loadAccountsData() {
    // Try to load from localStorage, fallback to sample data
    const savedAccounts = localStorage.getItem('accountsData');
    if (savedAccounts) {
        accountsData = JSON.parse(savedAccounts);
    } else {
        saveAccountsData();
    }
}

function saveAccountsData() {
    localStorage.setItem('accountsData', JSON.stringify(accountsData));
}

function renderAccounts() {
    const tableBody = document.querySelector('.accounts-table tbody');
    if (!tableBody) return;

    tableBody.innerHTML = '';

    if (accountsData.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td colspan="5" style="text-align: center; padding: 40px;">
                No accounts found. <a href="#" onclick="openCreateAccountModal()">Create one</a>
            </td>
        `;
        tableBody.appendChild(row);
        return;
    }

    accountsData.forEach(account => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="table-name">${account.name}</td>
            <td class="table-email">${account.email}</td>
            <td class="table-username">${account.username}</td>
            <td class="table-created">${account.created}</td>
            <td>
                <div class="table-actions">
                    <button class="btn-action btn-edit" data-id="${account.id}" title="Edit">
                        ✏️
                    </button>
                    <button class="btn-action btn-reset-password" data-id="${account.id}" title="Reset Password">
                        👤
                    </button>
                    <button class="btn-action btn-deactivate" data-id="${account.id}" title="Deactivate">
                        ☁️
                    </button>
                </div>
            </td>
        `;

        tableBody.appendChild(row);
    });

    // Add event listeners to buttons
    document.querySelectorAll('.btn-edit').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const id = this.getAttribute('data-id');
            editAccount(id);
        });
    });

    document.querySelectorAll('.btn-reset-password').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const id = this.getAttribute('data-id');
            resetPassword(id);
        });
    });

    document.querySelectorAll('.btn-deactivate').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const id = this.getAttribute('data-id');
            deactivateAccount(id);
        });
    });
}

function filterAccounts() {
    const searchTerm = document.getElementById('search-accounts')?.value.toLowerCase() || '';

    const filteredAccounts = accountsData.filter(account => {
        return account.name.toLowerCase().includes(searchTerm) ||
               account.email.toLowerCase().includes(searchTerm) ||
               account.username.toLowerCase().includes(searchTerm);
    });

    // Temporarily replace data to render filtered results
    const originalData = accountsData;
    accountsData = filteredAccounts;
    renderAccounts();
    accountsData = originalData;
}

function editAccount(id) {
    const account = accountsData.find(a => a.id == id);
    if (account) {
        alert(`Edit account: ${account.name}\n\nFull edit functionality coming soon!`);
    }
}

function resetPassword(id) {
    const account = accountsData.find(a => a.id == id);
    if (account) {
        if (confirm(`Reset password for ${account.name}?`)) {
            alert('Password reset link has been sent to ' + account.email);
        }
    }
}

function deactivateAccount(id) {
    const account = accountsData.find(a => a.id == id);
    if (account) {
        if (confirm(`Deactivate account for ${account.name}?`)) {
            account.status = account.status === 'active' ? 'inactive' : 'active';
            saveAccountsData();
            renderAccounts();
        }
    }
}

function openCreateAccountModal() {
    alert('Create new account\n\nForm modal coming soon!');
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

console.log('Accounts Management initialized');
