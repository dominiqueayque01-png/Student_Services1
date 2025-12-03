// Sample analytics data
let analyticsData = {
    currentMembers: 98,
    approvalRating: 84,
    newMembers: 12,
    membershipGrowth: [
        { month: 'January', value: 2, color: 'blue' },
        { month: 'February', value: 3, color: 'green' },
        { month: 'March', value: 12, color: 'orange' },
        { month: 'April', value: 0, color: 'gray' }
    ],
    applicationTrends: [
        { status: 'Approved', value: 8, color: 'green' },
        { status: 'Rejected', value: 3, color: 'red' }
    ]
};

// Load analytics data from localStorage
function loadAnalyticsData() {
    const saved = localStorage.getItem('clubAnalytics');
    if (saved) {
        analyticsData = JSON.parse(saved);
    }
}

// Save analytics data to localStorage
function saveAnalyticsData() {
    localStorage.setItem('clubAnalytics', JSON.stringify(analyticsData));
}

// Edit stat value
function editStatValue(stat) {
    let newValue = prompt(`Enter new value for ${stat}:`, analyticsData[stat]);
    if (newValue !== null && newValue !== '') {
        const numValue = parseInt(newValue);
        if (!isNaN(numValue)) {
            analyticsData[stat] = numValue;
            saveAnalyticsData();
            renderStats();
        } else {
            alert('Please enter a valid number');
        }
    }
}

// Render stats cards
function renderStats() {
    document.getElementById('current-members').textContent = analyticsData.currentMembers;
    document.getElementById('approval-rating').textContent = analyticsData.approvalRating + '%';
    document.getElementById('new-members').textContent = analyticsData.newMembers;
}

// Calculate max value for a dataset
function getMaxValue(data) {
    return Math.max(...data.map(item => item.value));
}

// Render membership growth chart
function renderMembershipGrowth() {
    const maxValue = getMaxValue(analyticsData.membershipGrowth);
    const container = document.getElementById('membership-growth');
    
    container.innerHTML = analyticsData.membershipGrowth.map(item => {
        const percentage = maxValue > 0 ? (item.value / maxValue) * 100 : 0;
        return `
            <div class="chart-item">
                <div class="chart-label">${item.month}</div>
                <div class="chart-bar-container">
                    <div 
                        class="chart-bar ${item.color}" 
                        style="width: ${percentage}%;"
                        onclick="editChartValue('membershipGrowth', ${analyticsData.membershipGrowth.indexOf(item)})"
                        title="Click to edit"
                    ></div>
                </div>
                <div 
                    class="chart-value"
                    onclick="editChartValue('membershipGrowth', ${analyticsData.membershipGrowth.indexOf(item)})"
                    title="Click to edit"
                >
                    ${item.value}
                </div>
            </div>
        `;
    }).join('');
}

// Render application trends chart
function renderApplicationTrends() {
    const maxValue = getMaxValue(analyticsData.applicationTrends);
    const container = document.getElementById('application-trends');
    
    container.innerHTML = analyticsData.applicationTrends.map(item => {
        const percentage = maxValue > 0 ? (item.value / maxValue) * 100 : 0;
        return `
            <div class="chart-item">
                <div class="chart-label">${item.status}</div>
                <div class="chart-bar-container">
                    <div 
                        class="chart-bar ${item.color}" 
                        style="width: ${percentage}%;"
                        onclick="editChartValue('applicationTrends', ${analyticsData.applicationTrends.indexOf(item)})"
                        title="Click to edit"
                    ></div>
                </div>
                <div 
                    class="chart-value"
                    onclick="editChartValue('applicationTrends', ${analyticsData.applicationTrends.indexOf(item)})"
                    title="Click to edit"
                >
                    ${item.value}
                </div>
            </div>
        `;
    }).join('');
}

// Edit chart value
function editChartValue(chartType, index) {
    const chart = analyticsData[chartType];
    const item = chart[index];
    const newValue = prompt(`Enter new value for ${item.month || item.status}:`, item.value);
    
    if (newValue !== null && newValue !== '') {
        const numValue = parseInt(newValue);
        if (!isNaN(numValue) && numValue >= 0) {
            item.value = numValue;
            saveAnalyticsData();
            
            if (chartType === 'membershipGrowth') {
                renderMembershipGrowth();
            } else if (chartType === 'applicationTrends') {
                renderApplicationTrends();
            }
        } else {
            alert('Please enter a valid number (0 or greater)');
        }
    }
}

// Render all analytics
function renderAnalytics() {
    renderStats();
    renderMembershipGrowth();
    renderApplicationTrends();
}

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    loadAnalyticsData();
    renderAnalytics();

    // Stats card click handlers for editing
    document.getElementById('current-members').addEventListener('click', function() {
        editStatValue('currentMembers');
    });

    document.getElementById('approval-rating').addEventListener('click', function() {
        editStatValue('approvalRating');
    });

    document.getElementById('new-members').addEventListener('click', function() {
        editStatValue('newMembers');
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
