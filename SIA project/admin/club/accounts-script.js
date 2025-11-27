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
        clubname: 'Debate Club',
        created: '2025-10-25',
        status: 'active'
    },
    {
        id: 2,
        name: 'Juan Sy',
        email: 'juan.edu.ph',
        username: 'Leader_Debate_Club',
        clubname: 'Debate Club',
        created: '2025-10-25',
        status: 'active'
    },
    {
        id: 3,
        name: 'Juan Sy',
        email: 'juan.edu.ph',
        username: 'Leader_Debate_Club',
        clubname: 'Debate Club',
        created: '2025-10-25',
        status: 'active'
    },
    {
        id: 4,
        name: 'Juan Sy',
        email: 'juan.edu.ph',
        username: 'Leader_Debate_Club',
        clubname: 'Debate Club',
        created: '2025-10-25',
        status: 'active'
    }
];

document.addEventListener('DOMContentLoaded', function() {
    initializeAccounts();
    initializeNavigation();
    initializeLogout();
    initializeModalHandlers();
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
            <td colspan="6" style="text-align: center; padding: 40px;">
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
            <td class="table-clubname">${account.clubname || 'Leader_Debate_Club'}</td>
            <td class="table-created">${account.created}</td>
            <td>
                <div class="table-actions">
                    <button class="btn-action btn-edit" data-id="${account.id}" title="Edit">
                        ✎
                    </button>
                    <button class="btn-action btn-reset-password" data-id="${account.id}" title="Reset Password">
                        ↻
                    </button>
                    <button class="btn-action btn-deactivate" data-id="${account.id}" title="Deactivate">
                        ✕
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
        // Populate the edit form with account data
        document.getElementById('edit-account-id').value = account.id;
        document.getElementById('edit-fullname').value = account.name;
        document.getElementById('edit-email').value = account.email;
        document.getElementById('edit-username').value = account.username;
        document.getElementById('edit-clubname').value = account.clubname || '';
        
        // Show the edit modal
        const modal = document.getElementById('edit-account-modal');
        if (modal) {
            modal.classList.add('show');
        }
    }
}

function resetPassword(id) {
    const account = accountsData.find(a => a.id == id);
    if (account) {
        // Store the account ID in the modal
        document.getElementById('reset-password-id').value = account.id;
        
        // Show the reset password modal
        const modal = document.getElementById('reset-password-modal');
        if (modal) {
            modal.classList.add('show');
        }
    }
}

function deactivateAccount(id) {
    const account = accountsData.find(a => a.id == id);
    if (account) {
        // Store the account ID in the modal
        document.getElementById('remove-account-id').value = account.id;
        
        // Update the confirmation message
        const message = `Are you sure you want to remove the account for <strong>${account.name}</strong>?`;
        document.getElementById('remove-account-message').innerHTML = message;
        
        // Show the remove account modal
        const modal = document.getElementById('remove-account-modal');
        if (modal) {
            modal.classList.add('show');
        }
    }
}

function openCreateAccountModal() {
    // Clear the form
    document.getElementById('create-account-form').reset();
    
    // Show the create modal
    const modal = document.getElementById('create-account-modal');
    if (modal) {
        modal.classList.add('show');
    }
}

// ============================================
// Modal Handlers
// ============================================

function initializeModalHandlers() {
    // Close buttons
    document.querySelectorAll('.modal-close').forEach(btn => {
        btn.addEventListener('click', function() {
            const modal = this.closest('.modal');
            if (modal) {
                modal.classList.remove('show');
            }
        });
    });

    // Cancel buttons
    document.querySelectorAll('.btn-cancel').forEach(btn => {
        btn.addEventListener('click', function() {
            const modal = this.closest('.modal');
            if (modal) {
                modal.classList.remove('show');
            }
        });
    });

    // Create Account Submit
    const createSubmitBtn = document.getElementById('create-account-submit');
    if (createSubmitBtn) {
        createSubmitBtn.addEventListener('click', function() {
            const form = document.getElementById('create-account-form');
            if (!form.checkValidity()) {
                showNotification('Please fill in all required fields', 'error');
                return;
            }

            const newAccount = {
                id: Math.max(...accountsData.map(a => a.id), 0) + 1,
                name: document.getElementById('create-fullname').value,
                email: document.getElementById('create-email').value,
                username: document.getElementById('create-username').value,
                clubname: document.getElementById('create-clubname').value,
                created: new Date().toISOString().split('T')[0],
                status: 'active'
            };

            accountsData.push(newAccount);
            saveAccountsData();
            renderAccounts();
            
            const modal = document.getElementById('create-account-modal');
            if (modal) {
                modal.classList.remove('show');
            }
            
            showNotification('Account created successfully!', 'success');
        });
    }

    // Edit Account Submit
    const editSubmitBtn = document.getElementById('edit-account-submit');
    if (editSubmitBtn) {
        editSubmitBtn.addEventListener('click', function() {
            const form = document.getElementById('edit-account-form');
            if (!form.checkValidity()) {
                showNotification('Please fill in all required fields', 'error');
                return;
            }

            const id = document.getElementById('edit-account-id').value;
            const account = accountsData.find(a => a.id == id);
            
            if (account) {
                account.name = document.getElementById('edit-fullname').value;
                account.email = document.getElementById('edit-email').value;
                account.username = document.getElementById('edit-username').value;
                account.clubname = document.getElementById('edit-clubname').value;
                
                saveAccountsData();
                renderAccounts();
                
                const modal = document.getElementById('edit-account-modal');
                if (modal) {
                    modal.classList.remove('show');
                }
                
                showNotification('Account updated successfully!', 'success');
            }
        });
    }

    // Reset Password Submit
    const resetSubmitBtn = document.getElementById('reset-password-submit');
    if (resetSubmitBtn) {
        resetSubmitBtn.addEventListener('click', function() {
            const newPassword = document.getElementById('reset-new-password').value;
            
            if (!newPassword) {
                showNotification('Please enter a new password', 'error');
                return;
            }

            const id = document.getElementById('reset-password-id').value;
            const account = accountsData.find(a => a.id == id);
            
            if (account) {
                // In a real app, this would hash and store the password securely
                saveAccountsData();
                
                const modal = document.getElementById('reset-password-modal');
                if (modal) {
                    modal.classList.remove('show');
                }
                
                showNotification('Password reset successfully for ' + account.name, 'success');
            }
        });
    }

    // Remove Account Submit
    const removeSubmitBtn = document.getElementById('remove-account-submit');
    if (removeSubmitBtn) {
        removeSubmitBtn.addEventListener('click', function() {
            const id = document.getElementById('remove-account-id').value;
            const accountIndex = accountsData.findIndex(a => a.id == id);
            
            if (accountIndex !== -1) {
                const account = accountsData[accountIndex];
                // Remove the account from the array
                accountsData.splice(accountIndex, 1);
                saveAccountsData();
                renderAccounts();
                
                const modal = document.getElementById('remove-account-modal');
                if (modal) {
                    modal.classList.remove('show');
                }
                
                showNotification(`Account for ${account.name} has been removed!`, 'success');
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
            <div class="toast-message">${message}</div>
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

console.log('Accounts Management initialized');
