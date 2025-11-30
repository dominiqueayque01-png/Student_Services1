// ============================================
// Club Analytics Script (Dynamic Version)
// ============================================

let analyticsData = {
    clubsByCategory: [],
    memberDistribution: [],
    clubStatus: []
};

document.addEventListener('DOMContentLoaded', function() {
    loadAnalyticsDataFromServer();  // Load charts
    loadRecentActivities();          // Load recent activities
    initializeNavigation();
    initializeLogout();
});

// ============================================
// FETCH ANALYTICS FROM BACKEND
// ============================================

async function loadAnalyticsDataFromServer() {
    try {
        const res = await fetch("http://localhost:3001/api/clubs/analytics");
        const data = await res.json();

        analyticsData = {
            clubsByCategory: Object.entries(data.categories).map(([label, value]) => ({ label, value })),
            memberDistribution: [
                { label: "0-50 members", value: data.memberDist["0-50"] },
                { label: "51-100 members", value: data.memberDist["51-100"] },
                { label: "101-150 members", value: data.memberDist["101-150"] },
                { label: "150+ members", value: data.memberDist["150+"] },
            ],
            clubStatus: [
                { label: "Active", value: data.status.active },
                { label: "Inactive", value: data.status.inactive }
            ]
        };

        renderCharts();

    } catch (error) {
        console.error("Failed to load analytics:", error);
    }
}

// ============================================
// RENDER CHARTS (unchanged)
// ============================================

function renderCharts() {
    renderChart('clubs-by-category', analyticsData.clubsByCategory, 'category');
    renderChart('member-distribution', analyticsData.memberDistribution, 'member');
    renderChart('club-status', analyticsData.clubStatus, 'status');
}

function renderChart(chartId, data, type) {
    const chartContainer = document.getElementById(chartId);
    if (!chartContainer) return;

    chartContainer.innerHTML = '';
    const total = data.reduce((sum, item) => sum + item.value, 0);

    data.forEach((item, index) => {
        const percentage = total > 0 ? (item.value / total) * 100 : 0;
        const barClass =
            type === 'category' ? `category-${index + 1}`
            : type === 'member' ? `member-${index + 1}`
            : `status-${item.label.toLowerCase()}`;

        const chartItem = document.createElement('div');
        chartItem.className = 'chart-item';
        chartItem.innerHTML = `
            <div class="chart-label">${item.label}</div>
            <div class="chart-bar-wrapper">
                <div class="chart-bar ${barClass}" style="width: ${percentage}%">
                    <span class="chart-value">${item.value}</span>
                </div>
            </div>
        `;
        chartContainer.appendChild(chartItem);
    });

    setupChartInteractivity(chartId, type);
}

// ============================================
// RECENT ACTIVITY FETCH
// ============================================

// ============================================
// RECENT ACTIVITY FETCH (FIXED)
// ============================================

async function loadRecentActivities() {
    const container = document.getElementById('activity-list'); // use correct ID
    if (!container) return;

    container.innerHTML = '<div class="activity-loading">Fetching live activity...</div>';

    try {
        // Use full URL to ensure it works
        const response = await fetch('http://localhost:3001/api/activities/recent');
        if (!response.ok) throw new Error('Network response was not ok');
        const activities = await response.json();

        container.innerHTML = ''; // clear loading

        if (activities.length === 0) {
            container.innerHTML = '<div>No recent activity.</div>';
            return;
        }

        activities.forEach(act => {
            const item = document.createElement('div');
            item.className = 'activity-item';
            item.textContent = act.description;

            const time = document.createElement('span');
            const date = new Date(act.timestamp);
            time.textContent = ` (${date.toLocaleString()})`;
            time.style.fontSize = '0.8rem';
            time.style.color = '#888';

            item.appendChild(time);
            container.appendChild(item);
        });

    } catch (err) {
        console.error('Failed to load recent activities:', err);
        container.innerHTML = '<div>Failed to load activities.</div>';
    }
}

// ============================================
// Chart Editing, Navigation, Logout (unchanged)
// ============================================

function setupChartInteractivity(chartId, type) {
    const chartValues = document.querySelectorAll(`#${chartId} .chart-value`);
    chartValues.forEach((value, index) => {
        value.style.cursor = 'pointer';
        value.title = 'Click to edit value';
        value.addEventListener('click', function(e) {
            e.stopPropagation();
            editChartValue(this, chartId, index, type);
        });
    });
}

function editChartValue(element, chartId, index, type) {
    const currentValue = element.textContent;
    const newValue = prompt('Enter new value:', currentValue);
    if (newValue !== null && !isNaN(newValue) && newValue >= 0) {
        let dataArray =
            type === 'category' ? analyticsData.clubsByCategory
            : type === 'member' ? analyticsData.memberDistribution
            : analyticsData.clubStatus;

        dataArray[index].value = parseInt(newValue);
        renderChart(chartId, dataArray, type);
        saveAnalyticsData();
    }
}

function saveAnalyticsData() {
    localStorage.setItem('clubAnalytics', JSON.stringify(analyticsData));
}

function initializeNavigation() {
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', function() {
            document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
            this.classList.add('active');
            const page = this.getAttribute('data-page');
            if (page === 'overview') window.location.href = 'index.html';
            else if (page === 'listings') window.location.href = 'club-listings.html';
            else if (page === 'analytics') window.location.href = 'analytics.html';
            else if (page === 'accounts') window.location.href = 'accounts.html';
        });
    });
}

function initializeLogout() {
    const logoutBtn = document.querySelector('.logout-btn');
    if (logoutBtn) logoutBtn.addEventListener('click', showLogoutModal);
}

function showLogoutModal() { document.getElementById('logout-modal').classList.add('show'); }
function hideLogoutModal() { document.getElementById('logout-modal').classList.remove('show'); }
function confirmLogout() { sessionStorage.clear(); window.location.href = '../../login admin/index.html'; }

const logoutModal = document.getElementById('logout-modal');
if (logoutModal) logoutModal.addEventListener('click', e => { if (e.target === logoutModal) hideLogoutModal(); });
document.querySelector('.logout-modal-close')?.addEventListener('click', hideLogoutModal);
document.querySelector('.logout-modal-cancel')?.addEventListener('click', hideLogoutModal);
document.querySelector('.logout-modal-confirm')?.addEventListener('click', confirmLogout);

console.log('Club Analytics initialized');
