// ============================================
// Accounts Management Script (MongoDB integrated)
// ============================================

const API_BASE = "http://localhost:3001/api/accounts"; // adjust port if needed

// Holds the accounts currently loaded from server
let accountsData = [];

// Keep references to DOM elements that are reused
const tableSelector = '.accounts-table tbody';
const searchInputId = 'search-accounts';

document.addEventListener('DOMContentLoaded', function() {
    initializeAccounts();
    initializeNavigation();
    initializeLogout();
    initializeModalHandlers();
    fetchAccounts(); // load from backend
});

// ============================================
// Data fetch / CRUD (talk to your backend)
// ============================================

async function fetchAccounts() {
    const tableBody = document.querySelector(tableSelector);
    if (!tableBody) return;

    tableBody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:20px">Loading...</td></tr>`;

    try {
        const res = await fetch(API_BASE);
        if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
        accountsData = await res.json();
        renderAccounts();
    } catch (err) {
        console.error("Failed to fetch accounts:", err);
        tableBody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:20px">Error loading accounts.</td></tr>`;
    }
}

async function createAccountOnServer(account) {
    try {
        const res = await fetch(API_BASE, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(account)
        });
        if (!res.ok) {
            const err = await res.json().catch(()=>null);
            throw new Error(err?.error || `Create failed: ${res.status}`);
        }
        return await res.json();
    } catch (err) {
        throw err;
    }
}

async function updateAccountOnServer(id, update) {
    try {
        const res = await fetch(`${API_BASE}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(update)
        });
        if (!res.ok) {
            const err = await res.json().catch(()=>null);
            throw new Error(err?.error || `Update failed: ${res.status}`);
        }
        return await res.json();
    } catch (err) {
        throw err;
    }
}

async function deleteAccountOnServer(id) {
    try {
        const res = await fetch(`${API_BASE}/${id}`, { method: 'DELETE' });
        if (!res.ok) {
            const err = await res.json().catch(()=>null);
            throw new Error(err?.error || `Delete failed: ${res.status}`);
        }
        return await res.json();
    } catch (err) {
        throw err;
    }
}

async function resetPasswordOnServer(id, newPassword) {
    try {
        // backend may ignore body and set a default; we still send password if provided
        const res = await fetch(`${API_BASE}/${id}/reset`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password: newPassword })
        });
        if (!res.ok) {
            const err = await res.json().catch(()=>null);
            throw new Error(err?.error || `Reset failed: ${res.status}`);
        }
        return await res.json();
    } catch (err) {
        throw err;
    }
}

// ============================================
// Render & UI
// ============================================

function renderAccounts(list = accountsData) {
    const tableBody = document.querySelector(tableSelector);
    if (!tableBody) return;

    tableBody.innerHTML = '';

    if (!list || list.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td colspan="6" style="text-align: center; padding: 40px;">
                No accounts found. <a href="#" onclick="openCreateAccountModal()">Create one</a>
            </td>
        `;
        tableBody.appendChild(row);
        return;
    }

    list.forEach(account => {
        const createdDisplay = account.dateCreated ? new Date(account.dateCreated).toISOString().split('T')[0] : '';
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="table-name">${escapeHtml(account.name || '')}</td>
            <td class="table-email">${escapeHtml(account.email || '')}</td>
            <td class="table-username">${escapeHtml(account.username || '')}</td>
            <td class="table-clubname">${escapeHtml(account.clubname || '')}</td>
            <td class="table-created">${escapeHtml(createdDisplay)}</td>
            <td>
                <div class="table-actions">
                    <button class="btn-action btn-edit" data-id="${account._id}" title="Edit">✎</button>
                    <button class="btn-action btn-reset-password" data-id="${account._id}" title="Reset Password">↻</button>
                    <button class="btn-action btn-deactivate" data-id="${account._id}" title="Deactivate">✕</button>
                </div>
            </td>
        `;
        tableBody.appendChild(row);
    });

    // Attach listeners after DOM insertion
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

// small helper to avoid XSS when inserting text
function escapeHtml(str) {
    if (typeof str !== 'string') return '';
    return str.replace(/[&<>"'`=\/]/g, function(s) {
        return ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;",
            "/": "&#x2F;",
            "`": "&#x60;",
            "=": "&#x3D;"
        })[s];
    });
}

// ============================================
// Search / Filter
// ============================================

function initializeAccounts() {
    const searchBox = document.getElementById(searchInputId);
    if (searchBox) {
        searchBox.addEventListener('input', filterAccounts);
    }

    const createBtn = document.querySelector('.btn-create-account');
    if (createBtn) {
        createBtn.addEventListener('click', openCreateAccountModal);
    }
}

function filterAccounts() {
    const searchTerm = document.getElementById(searchInputId)?.value.toLowerCase() || '';

    const filteredAccounts = accountsData.filter(account => {
        return (account.name || '').toLowerCase().includes(searchTerm) ||
               (account.email || '').toLowerCase().includes(searchTerm) ||
               (account.username || '').toLowerCase().includes(searchTerm) ||
               (account.clubname || '').toLowerCase().includes(searchTerm);
    });

    renderAccounts(filteredAccounts);
}

// ============================================
// Modals & CRUD handlers (uses your existing modal IDs)
// ============================================

function editAccount(id) {
    const account = accountsData.find(a => a._id == id);
    if (account) {
        document.getElementById('edit-account-id').value = account._id;
        document.getElementById('edit-fullname').value = account.name || '';
        document.getElementById('edit-email').value = account.email || '';
        document.getElementById('edit-username').value = account.username || '';
        document.getElementById('edit-clubname').value = account.clubname || '';
        
        const modal = document.getElementById('edit-account-modal');
        if (modal) modal.classList.add('show');
    } else {
        showNotification('Account not found', 'error');
    }
}

function resetPassword(id) {
    const account = accountsData.find(a => a._id == id);
    if (account) {
        document.getElementById('reset-password-id').value = account._id;
        const modal = document.getElementById('reset-password-modal');
        if (modal) modal.classList.add('show');
    } else {
        showNotification('Account not found', 'error');
    }
}

function deactivateAccount(id) {
    const account = accountsData.find(a => a._id == id);
    if (account) {
        document.getElementById('remove-account-id').value = account._id;
        const message = `Are you sure you want to remove the account for <strong>${escapeHtml(account.name || '')}</strong>?`;
        const msgEl = document.getElementById('remove-account-message');
        if (msgEl) msgEl.innerHTML = message;
        const modal = document.getElementById('remove-account-modal');
        if (modal) modal.classList.add('show');
    } else {
        showNotification('Account not found', 'error');
    }
}

function openCreateAccountModal() {
    const form = document.getElementById('create-account-form');
    if (form) form.reset();
    const modal = document.getElementById('create-account-modal');
    if (modal) modal.classList.add('show');
}

// ============================================
// Modal Handlers wiring (create / edit / reset / remove)
// ============================================

function initializeModalHandlers() {
    // Close buttons
    document.querySelectorAll('.modal-close').forEach(btn => {
        btn.addEventListener('click', function() {
            const modal = this.closest('.modal');
            if (modal) modal.classList.remove('show');
        });
    });

    // Cancel buttons
    document.querySelectorAll('.btn-cancel').forEach(btn => {
        btn.addEventListener('click', function() {
            const modal = this.closest('.modal');
            if (modal) modal.classList.remove('show');
        });
    });

    // Create Account Submit
    const createSubmitBtn = document.getElementById('create-account-submit');
    if (createSubmitBtn) {
        createSubmitBtn.addEventListener('click', async function(e) {
            e.preventDefault();
            const form = document.getElementById('create-account-form');
            if (!form.checkValidity()) {
                showNotification('Please fill in all required fields', 'error');
                return;
            }

            const newAccount = {
                name: document.getElementById('create-fullname').value,
                email: document.getElementById('create-email').value,
                username: document.getElementById('create-username').value,
                clubname: document.getElementById('create-clubname').value,
                password: document.getElementById('create-password') ? document.getElementById('create-password').value : undefined
            };

            try {
                await createAccountOnServer(newAccount);
                const modal = document.getElementById('create-account-modal');
                if (modal) modal.classList.remove('show');
                showNotification('Account created successfully!', 'success');
                fetchAccounts();
            } catch (err) {
                console.error(err);
                showNotification('Failed to create account: ' + (err.message || ''), 'error');
            }
        });
    }

    // Edit Account Submit
    const editSubmitBtn = document.getElementById('edit-account-submit');
    if (editSubmitBtn) {
        editSubmitBtn.addEventListener('click', async function(e) {
            e.preventDefault();
            const form = document.getElementById('edit-account-form');
            if (!form.checkValidity()) {
                showNotification('Please fill in all required fields', 'error');
                return;
            }

            const id = document.getElementById('edit-account-id').value;
            const update = {
                name: document.getElementById('edit-fullname').value,
                email: document.getElementById('edit-email').value,
                username: document.getElementById('edit-username').value,
                clubname: document.getElementById('edit-clubname').value
            };

            try {
                await updateAccountOnServer(id, update);
                const modal = document.getElementById('edit-account-modal');
                if (modal) modal.classList.remove('show');
                showNotification('Account updated successfully!', 'success');
                fetchAccounts();
            } catch (err) {
                console.error(err);
                showNotification('Failed to update account: ' + (err.message || ''), 'error');
            }
        });
    }

    // Reset Password Submit
    const resetSubmitBtn = document.getElementById('reset-password-submit');
    if (resetSubmitBtn) {
        resetSubmitBtn.addEventListener('click', async function(e) {
            e.preventDefault();
            const newPassword = document.getElementById('reset-new-password').value;
            if (!newPassword) {
                showNotification('Please enter a new password', 'error');
                return;
            }

            const id = document.getElementById('reset-password-id').value;
            try {
                await resetPasswordOnServer(id, newPassword);
                const modal = document.getElementById('reset-password-modal');
                if (modal) modal.classList.remove('show');
                showNotification('Password reset successfully!', 'success');
                // No need to refetch accounts for password change, but you can if you want:
                // fetchAccounts();
            } catch (err) {
                console.error(err);
                showNotification('Failed to reset password: ' + (err.message || ''), 'error');
            }
        });
    }

    // Remove Account Submit
    const removeSubmitBtn = document.getElementById('remove-account-submit');
    if (removeSubmitBtn) {
        removeSubmitBtn.addEventListener('click', async function(e) {
            e.preventDefault();
            const id = document.getElementById('remove-account-id').value;
            try {
                await deleteAccountOnServer(id);
                const modal = document.getElementById('remove-account-modal');
                if (modal) modal.classList.remove('show');
                showNotification('Account removed successfully!', 'success');
                fetchAccounts();
            } catch (err) {
                console.error(err);
                showNotification('Failed to remove account: ' + (err.message || ''), 'error');
            }
        });
    }

    // Close modal when clicking outside
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                this.classList.remove('show');
            }
        });
    });
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

// ============================================
// Toast Notifications
// ============================================

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `toast toast-${type}`;
    notification.innerHTML = `
        <div class="toast-content">
            <div class="toast-icon">${type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ'}</div>
            <div class="toast-message">${escapeHtml(message)}</div>
        </div>
        <button class="toast-close">×</button>
    `;
    
    document.body.appendChild(notification);
    
    // Trigger animation
    setTimeout(() => notification.classList.add('show'), 10);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
    
    // Close button
    notification.querySelector('.toast-close').addEventListener('click', () => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    });
}

console.log('Accounts Management initialized (MongoDB integrated)');
