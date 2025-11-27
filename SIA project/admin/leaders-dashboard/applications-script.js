// Sample applications data
let applicationsData = {
    pending: [
        {
            id: 1,
            name: 'Juan Sy',
            email: 'juansy.edu.ph',
            program: 'Business',
            year: 'Sophomore',
            appliedDate: '2025-10-25',
            reason: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut'
        },
        {
            id: 2,
            name: 'Maria Santos',
            email: 'maria.santos@edu.ph',
            program: 'Information Technology',
            year: 'Freshmen',
            appliedDate: '2025-10-26',
            reason: 'I want to join because I am interested in tech innovations and would like to contribute'
        },
        {
            id: 3,
            name: 'Carlos Reyes',
            email: 'carlos.reyes@edu.ph',
            program: 'Engineering',
            year: 'Junior',
            appliedDate: '2025-10-27',
            reason: 'Looking forward to network with like-minded individuals and develop new skills'
        }
    ],
    reviewed: [
        {
            id: 4,
            name: 'Juan Sy',
            email: 'juan.edu.ph',
            program: 'Business',
            year: 'Freshmen',
            appliedDate: '2025-10-25',
            status: 'approved'
        },
        {
            id: 5,
            name: 'Juan Sy',
            email: 'juan.edu.ph',
            program: 'Business',
            year: 'Freshmen',
            appliedDate: '2025-10-25',
            status: 'rejected'
        },
        {
            id: 6,
            name: 'Juan Sy',
            email: 'juan.edu.ph',
            program: 'Business',
            year: 'Freshmen',
            appliedDate: '2025-10-25',
            status: 'rejected'
        }
    ]
};

// Load applications data from localStorage
function loadApplicationsData() {
    const saved = localStorage.getItem('clubApplications');
    if (saved) {
        applicationsData = JSON.parse(saved);
    }
}

// Save applications data to localStorage
function saveApplicationsData() {
    localStorage.setItem('clubApplications', JSON.stringify(applicationsData));
}

// Format date to readable format
function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

// Global variable to store current application being viewed
let currentApplicationId = null;
let currentApplicationStatus = null;

// View application details in modal
function viewApplication(appId, status) {
    const section = status === 'pending' ? applicationsData.pending : applicationsData.reviewed;
    const app = section.find(a => a.id === appId);
    
    if (app) {
        currentApplicationId = appId;
        currentApplicationStatus = status;
        
        const modal = document.getElementById('app-details-modal');
        document.getElementById('app-details-name').textContent = app.name;
        document.getElementById('app-details-email').textContent = app.email;
        document.getElementById('app-details-program').textContent = app.program;
        document.getElementById('app-details-year').textContent = app.year;
        document.getElementById('app-details-applied').textContent = formatDate(app.appliedDate);
        document.getElementById('app-details-reason').textContent = app.reason || 'N/A';
        
        if (app.status) {
            document.getElementById('app-details-status').innerHTML = `<span class="app-status-badge ${app.status}">${app.status}</span>`;
            document.getElementById('app-details-status-row').style.display = 'block';
        } else {
            document.getElementById('app-details-status-row').style.display = 'none';
        }
        
        // Show/hide action buttons based on status
        if (status === 'pending') {
            document.querySelector('.btn-modal-approve').style.display = 'block';
            document.querySelector('.btn-modal-reject').style.display = 'block';
        } else {
            document.querySelector('.btn-modal-approve').style.display = 'none';
            document.querySelector('.btn-modal-reject').style.display = 'none';
        }
        
        modal.classList.add('show');
    }
}

// Approve application
function approveApplication(appId) {
    const appIndex = applicationsData.pending.findIndex(a => a.id === appId);
    if (appIndex !== -1) {
        const app = applicationsData.pending[appIndex];
        app.status = 'approved';
        
        // Move to reviewed
        applicationsData.pending.splice(appIndex, 1);
        applicationsData.reviewed.push(app);
        
        saveApplicationsData();
        renderApplications();
        closeApplicationModal();
        showNotification('✓ Application Approved', 'success');
    }
}

// Reject application
function rejectApplication(appId) {
    const appIndex = applicationsData.pending.findIndex(a => a.id === appId);
    if (appIndex !== -1) {
        const app = applicationsData.pending[appIndex];
        app.status = 'rejected';
        
        // Move to reviewed
        applicationsData.pending.splice(appIndex, 1);
        applicationsData.reviewed.push(app);
        
        saveApplicationsData();
        renderApplications();
        closeApplicationModal();
        showNotification('! Application Rejected', 'error');
    }
}

// Close application details modal
function closeApplicationModal() {
    const modal = document.getElementById('app-details-modal');
    modal.classList.remove('show');
    currentApplicationId = null;
    currentApplicationStatus = null;
}

// Show notification toast
function showNotification(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast-notification ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideUp 0.3s ease-out reverse';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Render pending applications
function renderPendingApplications() {
    const tableBody = document.getElementById('pending-table-body');
    
    if (applicationsData.pending.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 40px;">No pending applications</td></tr>';
        return;
    }

    tableBody.innerHTML = applicationsData.pending.map(app => `
        <tr>
            <td class="table-name">${app.name}</td>
            <td class="table-email">${app.email}</td>
            <td class="table-program">${app.program}</td>
            <td class="table-year">${app.year}</td>
            <td class="table-applied">${formatDate(app.appliedDate)}</td>
            <td class="table-actions">
                <button class="btn-action btn-view" onclick="viewApplication(${app.id}, 'pending')" title="View">👁️</button>
                <button class="btn-action btn-approve" onclick="approveApplication(${app.id})" title="Approve">✓</button>
                <button class="btn-action btn-reject" onclick="rejectApplication(${app.id})" title="Reject">✕</button>
            </td>
        </tr>
    `).join('');
}

// Render reviewed applications
function renderReviewedApplications() {
    const tableBody = document.getElementById('reviewed-table-body');
    
    if (applicationsData.reviewed.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 40px;">No reviewed applications</td></tr>';
        return;
    }

    tableBody.innerHTML = applicationsData.reviewed.map(app => `
        <tr>
            <td class="table-name">${app.name}</td>
            <td class="table-applied">${formatDate(app.appliedDate)}</td>
            <td class="table-program">${app.program}</td>
            <td class="table-year">${app.year}</td>
            <td>
                <span class="table-status ${app.status}">
                    ${app.status}
                </span>
            </td>
            <td class="table-actions">
                <button class="btn-action btn-view" onclick="viewApplication(${app.id}, 'reviewed')" title="View">👁️</button>
            </td>
        </tr>
    `).join('');
}

// Render all applications
function renderApplications() {
    renderPendingApplications();
    renderReviewedApplications();
}

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    loadApplicationsData();
    renderApplications();
    
    // Setup application details modal
    const appDetailsModal = document.getElementById('app-details-modal');
    const closeAppDetailsBtn = document.querySelector('.app-details-close');
    const closeModalBtn = document.querySelector('.btn-modal-close');
    const approveBtn = document.querySelector('.btn-modal-approve');
    const rejectBtn = document.querySelector('.btn-modal-reject');
    
    if (closeAppDetailsBtn) {
        closeAppDetailsBtn.addEventListener('click', closeApplicationModal);
    }
    
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', closeApplicationModal);
    }
    
    if (approveBtn) {
        approveBtn.addEventListener('click', function() {
            if (currentApplicationId) {
                approveApplication(currentApplicationId);
            }
        });
    }
    
    if (rejectBtn) {
        rejectBtn.addEventListener('click', function() {
            if (currentApplicationId) {
                rejectApplication(currentApplicationId);
            }
        });
    }
    
    // Close modal when clicking outside
    appDetailsModal.addEventListener('click', function(e) {
        if (e.target === appDetailsModal) {
            closeApplicationModal();
        }
    });

    // Navigation
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

    // Logout functionality
    const logoutBtn = document.querySelector('.logout-btn');
    const logoutModal = document.getElementById('logout-modal');
    const logoutConfirmBtn = document.querySelector('.logout-modal-confirm');
    const logoutCancelBtn = document.querySelector('.logout-modal-cancel');
    const logoutCloseBtn = document.querySelector('.logout-modal-close');

    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            logoutModal.classList.add('show');
        });
    }

    if (logoutCancelBtn) {
        logoutCancelBtn.addEventListener('click', function() {
            logoutModal.classList.remove('show');
        });
    }

    if (logoutCloseBtn) {
        logoutCloseBtn.addEventListener('click', function() {
            logoutModal.classList.remove('show');
        });
    }

    if (logoutConfirmBtn) {
        logoutConfirmBtn.addEventListener('click', function() {
            alert('You have been logged out successfully!');
            window.location.href = '../../login admin/index.html';
        });
    }

    // Close modal when clicking outside
    logoutModal.addEventListener('click', function(e) {
        if (e.target === logoutModal) {
            logoutModal.classList.remove('show');
        }
    });
});
