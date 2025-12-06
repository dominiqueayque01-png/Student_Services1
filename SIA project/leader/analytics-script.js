// ==========================
// Analytics Script
// ==========================

let analyticsData = {
    currentMembers: 0,
    approvalRating: 0,
    newMembers: 0,
    membershipGrowth: [],
    applicationTrends: []
};

// --------------------------
// Backend & Club Config
// --------------------------
const BACKEND_URL = 'http://localhost:3001'; // Node.js backend URL
const CLUB_ID = "692c1bcb1d24903d53f74865"; // Replace with your actual club _id

// --------------------------
// Fetch Analytics from Backend
// --------------------------
async function fetchAnalyticsData() {
    try {
        const response = await fetch(`${BACKEND_URL}/api/leader-analytics/${CLUB_ID}/analytics`);
        console.log('Response status:', response.status);

        if (!response.ok) throw new Error('Failed to fetch analytics');

        const data = await response.json();
        console.log('Analytics data received:', data);

        // Populate local analyticsData safely
        analyticsData.currentMembers = Number(data.currentMembers) || 0;
        analyticsData.approvalRating = Number(data.approvalRating) || 0;
        analyticsData.newMembers = Number(data.newMembers) || 0;
        analyticsData.membershipGrowth = Array.isArray(data.membershipGrowth) ? data.membershipGrowth : [];
        analyticsData.applicationTrends = Array.isArray(data.applicationTrends) ? data.applicationTrends : [];

        renderAnalytics();
    } catch (err) {
        console.error('Error fetching analytics:', err);
        alert('Could not load analytics data. Showing default values.');
        renderAnalytics(); // Render default/empty values
    }
}

// --------------------------
// Render Functions
// --------------------------
function renderStats() {
    document.getElementById('current-members').textContent = analyticsData.currentMembers;
    document.getElementById('approval-rating').textContent = analyticsData.approvalRating + '%';
    document.getElementById('new-members').textContent = analyticsData.newMembers;
}

function getMaxValue(data) {
    if (!Array.isArray(data) || data.length === 0) return 0;
    return Math.max(...data.map(item => Number(item.value) || 0));
}

function renderMembershipGrowth() {
    const container = document.getElementById('membership-growth');
    if (!analyticsData.membershipGrowth.length) {
        container.innerHTML = `<p>No membership growth data available.</p>`;
        return;
    }

    const maxValue = getMaxValue(analyticsData.membershipGrowth);

    container.innerHTML = analyticsData.membershipGrowth.map(item => {
        const percentage = maxValue > 0 ? (item.value / maxValue) * 100 : 0;
        return `
            <div class="chart-item">
                <div class="chart-label">${item.month || '-'}</div>
                <div class="chart-bar-container">
                    <div class="chart-bar ${item.color || 'blue'}" style="width: ${percentage}%;"></div>
                </div>
                <div class="chart-value">${item.value || 0}</div>
            </div>
        `;
    }).join('');
}

function renderApplicationTrends() {
    const container = document.getElementById('application-trends');
    if (!analyticsData.applicationTrends.length) {
        container.innerHTML = `<p>No application trends data available.</p>`;
        return;
    }

    const maxValue = getMaxValue(analyticsData.applicationTrends);

    container.innerHTML = analyticsData.applicationTrends.map(item => {
        const percentage = maxValue > 0 ? (item.value / maxValue) * 100 : 0;
        return `
            <div class="chart-item">
                <div class="chart-label">${item.status || '-'}</div>
                <div class="chart-bar-container">
                    <div class="chart-bar ${item.color || 'gray'}" style="width: ${percentage}%;"></div>
                </div>
                <div class="chart-value">${item.value || 0}</div>
            </div>
        `;
    }).join('');
}

function renderAnalytics() {
    renderStats();
    renderMembershipGrowth();
    renderApplicationTrends();
}

// --------------------------
// Initialize Page
// --------------------------
document.addEventListener('DOMContentLoaded', () => {
    fetchAnalyticsData(); // Fetch live data from backend

  // ----------------------
// Navigation
// ----------------------
const navItems = document.querySelectorAll('.nav-item');
navItems.forEach(item => {
    item.style.cursor = 'pointer';
    item.addEventListener('click', (e) => {
        e.preventDefault();
        const page = item.getAttribute('data-page');

        // FIX: Use index.html for overview
        if (page === 'overview') {
            window.location.href = 'index.html';
        } else {
            window.location.href = `${page}.html`;
        }
    });
});


    // ----------------------
    // Logout Modal
    // ----------------------
    const logoutBtn = document.querySelector('.logout-btn');
    const logoutModal = document.getElementById('logout-modal');
    const logoutConfirmBtn = document.querySelector('.logout-modal-confirm');
    const logoutCancelBtn = document.querySelector('.logout-modal-cancel');
    const logoutCloseBtn = document.querySelector('.logout-modal-close');

    if (logoutBtn) logoutBtn.addEventListener('click', () => logoutModal.classList.add('show'));
    if (logoutCancelBtn) logoutCancelBtn.addEventListener('click', () => logoutModal.classList.remove('show'));
    if (logoutCloseBtn) logoutCloseBtn.addEventListener('click', () => logoutModal.classList.remove('show'));
    if (logoutConfirmBtn) logoutConfirmBtn.addEventListener('click', () => {
        alert('You have been logged out successfully!');
        window.location.href = '../../login admin/index.html';
    });

    // Close modal when clicking outside
    if (logoutModal) {
        logoutModal.addEventListener('click', (e) => {
            if (e.target === logoutModal) logoutModal.classList.remove('show');
        });
    }
});
