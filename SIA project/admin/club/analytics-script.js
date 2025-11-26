// ============================================
// Club Analytics Script
// ============================================

// Sample analytics data
let analyticsData = {
    clubsByCategory: [
        { label: 'Technology', value: 1 },
        { label: 'Business', value: 2 },
        { label: 'Arts', value: 1 },
        { label: 'Sports', value: 1 }
    ],
    memberDistribution: [
        { label: '0-50 members', value: 2 },
        { label: '51-100 members', value: 3 },
        { label: '101-150 members', value: 2 },
        { label: '150+ members', value: 0 }
    ],
    clubStatus: [
        { label: 'Active', value: 4 },
        { label: 'Inactive', value: 1 }
    ]
};

document.addEventListener('DOMContentLoaded', function() {
    initializeAnalytics();
    initializeNavigation();
    initializeLogout();
});

// ============================================
// Analytics Functionality
// ============================================

function initializeAnalytics() {
    // Initialize all charts
    renderCharts();
}

function renderCharts() {
    // Render Clubs by Category
    renderChart('clubs-by-category', analyticsData.clubsByCategory, 'category');
    
    // Render Member Distribution
    renderChart('member-distribution', analyticsData.memberDistribution, 'member');
    
    // Render Club Status
    renderChart('club-status', analyticsData.clubStatus, 'status');
}

function renderChart(chartId, data, type) {
    const chartContainer = document.getElementById(chartId);
    if (!chartContainer) return;

    chartContainer.innerHTML = '';

    // Find the maximum value to calculate percentages
    const maxValue = Math.max(...data.map(item => item.value));

    data.forEach((item, index) => {
        const percentage = maxValue > 0 ? (item.value / maxValue) * 100 : 0;
        const barClass = type === 'category' ? `category-${index + 1}` 
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

    // Add interactivity to values
    setupChartInteractivity(chartId, type);
}

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
        // Get the correct data array
        let dataArray = type === 'category' ? analyticsData.clubsByCategory
                      : type === 'member' ? analyticsData.memberDistribution
                      : analyticsData.clubStatus;

        dataArray[index].value = parseInt(newValue);
        
        // Re-render the specific chart
        renderChart(chartId, dataArray, type);
        
        // Save to localStorage
        saveAnalyticsData();
    }
}

function saveAnalyticsData() {
    localStorage.setItem('clubAnalytics', JSON.stringify(analyticsData));
}

function loadAnalyticsData() {
    const savedData = localStorage.getItem('clubAnalytics');
    if (savedData) {
        analyticsData = JSON.parse(savedData);
    }
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

console.log('Club Analytics initialized');
