// ============================================
// Stats Overview Functionality
// ============================================

function initializeStats() {
    const statValues = document.querySelectorAll('.stat-value');

    statValues.forEach((value, index) => {
        value.title = 'Click to edit value';
        value.addEventListener('click', function(e) {
            e.stopPropagation();
            editStatValue(this, index);
        });
    });

    // Also make stat-meta editable
    const statMeta = document.querySelectorAll('.stat-meta');
    statMeta.forEach((meta, index) => {
        meta.title = 'Click to edit description';
        meta.addEventListener('click', function(e) {
            e.stopPropagation();
            editStatMeta(this, index);
        });
    });
}

function editStatValue(element, index) {
    const currentValue = element.textContent.trim();
    const newValue = prompt('Enter new value:', currentValue);

    if (newValue !== null && newValue.trim() !== '') {
        // If it's a number, validate it
        if (/^\d+$/.test(newValue) || /^₱\s?\d+$/.test(newValue)) {
            element.textContent = newValue;
            element.classList.add('editable');
            setTimeout(() => {
                element.classList.remove('editable');
            }, 500);

            // Update analytics if on overview page
            updateAnalyticsFromStats();
        } else if (/^₱/.test(currentValue)) {
            // For currency, allow more flexible input
            if (/^\d+$/.test(newValue)) {
                element.textContent = '₱ ' + newValue;
                element.classList.add('editable');
                setTimeout(() => {
                    element.classList.remove('editable');
                }, 500);
            }
        } else {
            alert('Please enter a valid number');
        }
    }
}

function editStatMeta(element, index) {
    const currentValue = element.textContent.trim();
    const newValue = prompt('Enter new description:', currentValue);

    if (newValue !== null && newValue.trim() !== '') {
        element.textContent = newValue;
        element.classList.add('editable');
        setTimeout(() => {
            element.classList.remove('editable');
        }, 500);
    }
}

function updateAnalyticsFromStats() {
    // This function can be used to sync stats with analytics page
    // Store the updated stats in localStorage for cross-page syncing
    const stats = {
        totalListings: document.querySelectorAll('.stat-value')[0]?.textContent.trim(),
        activePrograms: document.querySelectorAll('.stat-value')[1]?.textContent.trim(),
        avgRate: document.querySelectorAll('.stat-value')[2]?.textContent.trim(),
        categories: document.querySelectorAll('.stat-value')[3]?.textContent.trim()
    };

    localStorage.setItem('ojtStats', JSON.stringify(stats));
}

// Handle sidebar navigation
document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', function() {
        // Remove active class from all items
        document.querySelectorAll('.nav-item').forEach(i => {
            i.classList.remove('active');
        });

        // Add active class to clicked item
        this.classList.add('active');

        const page = this.getAttribute('data-page');

        // Navigate to different pages
        if (page === 'overview') {
            // Stay on overview page
            window.location.href = 'index.html';
        } else if (page === 'job-listings') {
            window.location.href = 'job-listings.html';
        } else if (page === 'analytics') {
            window.location.href = 'analytics.html';
        }
    });
});

// Handle logout
document.querySelector('.logout-btn').addEventListener('click', function() {
    showLogoutModal();
});

// Logout Modal Functions
function showLogoutModal() {
    const modal = document.getElementById('logout-modal');
    modal.classList.add('show');
}

function hideLogoutModal() {
    const modal = document.getElementById('logout-modal');
    modal.classList.remove('show');
}

function confirmLogout() {
    // Clear any session data if needed
    sessionStorage.clear();
    // Redirect to the main admin login page
    window.location.href = '../../login admin/index.html';
}

// Logout modal event listeners
document.querySelector('.logout-modal-close').addEventListener('click', hideLogoutModal);
document.querySelector('.logout-modal-cancel').addEventListener('click', hideLogoutModal);
document.querySelector('.logout-modal-confirm').addEventListener('click', confirmLogout);

// Close modal when clicking outside
document.getElementById('logout-modal').addEventListener('click', function(e) {
    if (e.target === this) {
        hideLogoutModal();
    }
});

// ============================================
// Analytics Functionality
// ============================================

function initializeAnalytics() {
    // Get all analytics sections
    const analyticsCards = document.querySelectorAll('.analytics-card');

    analyticsCards.forEach(card => {
        updateChartBars(card);
    });
}

function updateChartBars(card) {
    const chartItems = card.querySelectorAll('.chart-item');
    let maxValue = 0;

    // Find the maximum value in this section
    chartItems.forEach(item => {
        const valueElement = item.querySelector('.chart-value');
        if (valueElement) {
            const value = parseInt(valueElement.textContent);
            if (value > maxValue) {
                maxValue = value;
            }
        }
    });

    // If maxValue is 0, set it to 1 to avoid division issues
    if (maxValue === 0) maxValue = 1;

    // Update each bar width based on the maximum value
    chartItems.forEach(item => {
        const valueElement = item.querySelector('.chart-value');
        const barWrapper = item.querySelector('.chart-bar-wrapper');
        const bar = item.querySelector('.chart-bar');

        if (valueElement && bar) {
            const value = parseInt(valueElement.textContent);
            const percentage = (value / maxValue) * 100;
            bar.style.width = percentage + '%';
        }
    });
}

// Function to update a specific chart when values change
function updateChartValue(cardIndex, itemIndex, newValue) {
    const cards = document.querySelectorAll('.analytics-card');
    const card = cards[cardIndex];

    if (card) {
        const items = card.querySelectorAll('.chart-item');
        const item = items[itemIndex];

        if (item) {
            const valueElement = item.querySelector('.chart-value');
            if (valueElement) {
                valueElement.textContent = newValue;
                updateChartBars(card);
            }
        }
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    // Only initialize stats if we're on the overview page
    if (document.querySelector('.stats-grid')) {
        initializeStats();
    }
    
    // Only initialize analytics if we're on the analytics page
    if (document.querySelector('.analytics-grid')) {
        initializeAnalytics();
        setupAnalyticsInteractivity();
    }
});

// Optional: Add interactivity to allow editing values by clicking
function setupAnalyticsInteractivity() {
    const chartValues = document.querySelectorAll('.chart-value');

    chartValues.forEach((value, index) => {
        value.style.cursor = 'pointer';
        value.title = 'Click to edit value';

        value.addEventListener('click', function(e) {
            e.stopPropagation();
            const currentValue = this.textContent;
            const newValue = prompt('Enter new value:', currentValue);

            if (newValue !== null && !isNaN(newValue) && newValue >= 0) {
                this.textContent = newValue;
                // Find the parent card and update its bars
                const card = this.closest('.analytics-card');
                updateChartBars(card);
            }
        });
    });
}

console.log('OJT Dashboard initialized with interactive analytics');
