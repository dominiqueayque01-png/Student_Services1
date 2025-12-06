const CLUB_ID = '692c1bcb1d24903d53f74865'; // Club ID for fetching applications
let applicationsData = { pending: [], reviewed: [] };

// Format date to readable format
function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

// Fetch applications from backend
async function fetchApplications() {
    try {
        // Update URL to match backend port & route
        const res = await fetch(`http://localhost:3001/api/clubs/${CLUB_ID}/applications`);
        if (!res.ok) throw new Error('Failed to fetch applications');
        const data = await res.json();

        // Separate pending and reviewed
        applicationsData.pending = data.filter(app => app.status.toLowerCase() === 'pending');
        applicationsData.reviewed = data.filter(app => app.status.toLowerCase() !== 'pending');

        renderApplications();
    } catch (err) {
        console.error(err);
        showNotification('Failed to load applications', 'error');
        document.getElementById('pending-table-body').innerHTML =
            '<tr><td colspan="6" style="text-align:center; padding:40px;">Failed to load applications</td></tr>';
        document.getElementById('reviewed-table-body').innerHTML =
            '<tr><td colspan="6" style="text-align:center; padding:40px;">Failed to load applications</td></tr>';
    }
}

// Global variables
let currentApplicationId = null;
let currentApplicationStatus = null;

// View application details in modal
function viewApplication(appId, status) {
    const section = status === 'pending' ? applicationsData.pending : applicationsData.reviewed;
    const app = section.find(a => a._id === appId);
    if (!app) return;

    currentApplicationId = appId;
    currentApplicationStatus = status;

    const modal = document.getElementById('app-details-modal');
    document.getElementById('app-details-name').textContent = app.fullName;
    document.getElementById('app-details-email').textContent = app.email;
    document.getElementById('app-details-program').textContent = app.program;
    document.getElementById('app-details-year').textContent = app.year;
    document.getElementById('app-details-applied').textContent = formatDate(app.appliedAt);
    document.getElementById('app-details-reason').textContent = app.motive || 'N/A';

    if (app.status) {
        document.getElementById('app-details-status').innerHTML =
            `<span class="app-status-badge ${app.status.toLowerCase()}">${app.status}</span>`;
        document.getElementById('app-details-status-row').style.display = 'block';
    } else {
        document.getElementById('app-details-status-row').style.display = 'none';
    }

    if (status === 'pending') {
        document.querySelector('.btn-modal-approve').style.display = 'block';
        document.querySelector('.btn-modal-reject').style.display = 'block';
    } else {
        document.querySelector('.btn-modal-approve').style.display = 'none';
        document.querySelector('.btn-modal-reject').style.display = 'none';
    }

    modal.classList.add('show');
}

// Approve application
async function approveApplication(appId) {
    try {
        const res = await fetch(`http://localhost:3001/api/applications/${appId}/approve`, { method: 'PATCH' });
        if (!res.ok) throw new Error('Failed to approve application');
        await fetchApplications();
        closeApplicationModal();
        showNotification('✓ Application Approved', 'success');
    } catch (err) {
        console.error(err);
        showNotification('Failed to approve application', 'error');
    }
}

// Reject application
async function rejectApplication(appId) {
    try {
        const res = await fetch(`http://localhost:3001/api/applications/${appId}/reject`, { method: 'PATCH' });
        if (!res.ok) throw new Error('Failed to reject application');
        await fetchApplications();
        closeApplicationModal();
        showNotification('✗ Application Rejected', 'error');
    } catch (err) {
        console.error(err);
        showNotification('Failed to reject application', 'error');
    }
}

// Close modal
function closeApplicationModal() {
    const modal = document.getElementById('app-details-modal');
    modal.classList.remove('show');
    currentApplicationId = null;
    currentApplicationStatus = null;
}

// Show notification
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
            <td>${app.fullName}</td>
            <td>${app.email}</td>
            <td>${app.program}</td>
            <td>${app.year}</td>
            <td>${formatDate(app.appliedAt)}</td>
            <td>
                <button onclick="viewApplication('${app._id}', 'pending')">👁️</button>
                <button onclick="approveApplication('${app._id}')">✓</button>
                <button onclick="rejectApplication('${app._id}')">✕</button>
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
            <td>${app.fullName}</td>
            <td>${formatDate(app.appliedAt)}</td>
            <td>${app.program}</td>
            <td>${app.year}</td>
            <td><span class="table-status ${app.status.toLowerCase()}">${app.status}</span></td>
            <td><button onclick="viewApplication('${app._id}', 'reviewed')">👁️</button></td>
        </tr>
    `).join('');
}

// Render all applications
function renderApplications() {
    renderPendingApplications();
    renderReviewedApplications();
}

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    fetchApplications();

    const appDetailsModal = document.getElementById('app-details-modal');
    document.querySelector('.app-details-close').addEventListener('click', closeApplicationModal);
    document.querySelector('.btn-modal-close').addEventListener('click', closeApplicationModal);
    document.querySelector('.btn-modal-approve').addEventListener('click', () => {
        if (currentApplicationId) approveApplication(currentApplicationId);
    });
    document.querySelector('.btn-modal-reject').addEventListener('click', () => {
        if (currentApplicationId) rejectApplication(currentApplicationId);
    });

    appDetailsModal.addEventListener('click', e => {
        if (e.target === appDetailsModal) closeApplicationModal();
    });
});
