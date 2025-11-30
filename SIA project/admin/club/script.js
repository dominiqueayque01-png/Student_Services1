// ============================================
// Club Admin Dashboard Script (Dynamic Version)
// ============================================

// CONFIGURATION: Set the URL based on your server.js (which uses PORT 3001)
const API_BASE_URL = 'http://localhost:3001/api'; 

document.addEventListener('DOMContentLoaded', function() {
    // 1. Fetch data immediately when page loads
    fetchDashboardData();
    
    // 2. Initialize UI interactions
    initializeNavigation();
    initializeLogout();
});

// ============================================
// 1. Data Fetching & UI Updates (STREAMLINED)
// ============================================

async function fetchDashboardData() {
    try {
        console.log("Fetching dashboard data...");

        // A. Fetch All Summary Stats in ONE GO from the dedicated endpoint
        // This is more efficient than four separate calls.
        const summaryRes = await fetch(`${API_BASE_URL}/dashboard/summary`);
        const summaryData = await summaryRes.json();
        
        // Ensure the fetch was successful before trying to access properties
        if (summaryRes.ok) {
            
            // --- Update the Stats Grid ---
            updateElementText('total-clubs-value', summaryData.totalClubs.value); 
            updateElementText('active-clubs-meta', `${summaryData.totalClubs.activeCount} active clubs`);
            
            updateElementText('total-members-value', summaryData.totalMembers.value.toLocaleString()); // Use toLocaleString for large numbers
            updateElementText('active-categories-value', summaryData.activeCategories.value);
            updateElementText('avg-club-size-value', summaryData.avgClubSize.value);

        } else {
             // Handle API error messages (e.g., status 500)
             throw new Error(`API Summary Error: ${summaryData.error || summaryRes.statusText}`);
        }
        
        // B. Fetch Recent Activity
        const activityRes = await fetch(`${API_BASE_URL}/dashboard/activity/recent`);
        const activityData = await activityRes.json();
        
        if (activityRes.ok) {
            renderRecentActivity(activityData);
        } else {
             throw new Error(`API Activity Error: ${activityRes.statusText}`);
        }

    } catch (error) {
        console.error('Error connecting to backend or processing data:', error);
        // You might want to display a visible error on the dashboard here.
        updateElementText('total-clubs-value', 'N/A');
    }
}

// Helper to safely update text content
function updateElementText(id, text) {
    const element = document.getElementById(id);
    // Convert to string and handle formatting for large numbers if needed
    const textContent = (typeof text === 'number') ? text.toLocaleString() : String(text); 
    
    if (element) {
        element.textContent = textContent;
    } else {
        console.warn(`Element with ID '${id}' not found in HTML.`);
    }
}

function renderRecentActivity(activities) {
    const listContainer = document.getElementById('activity-list-container');
    if (!listContainer) return;

    listContainer.innerHTML = ''; // Clear existing hardcoded items

    if (!activities || activities.length === 0) {
        listContainer.innerHTML = '<p style="padding:20px; color:#666;">No recent activity found.</p>';
        return;
    }

    activities.forEach(activity => {
        // Create the HTML structure dynamically
        const item = document.createElement('div');
        
        // Determine style based on activity type (assuming a 'type' field like 'created' or 'updated')
        const isNew = activity.type && activity.type.toLowerCase() === 'created'; 
        item.className = isNew ? 'activity-item new' : 'activity-item updated';
        const badge = isNew ? '+' : '✓';

        item.innerHTML = `
            <div class="activity-badge">${badge}</div>
            <div class="activity-content">
                <p class="activity-title">${activity.description}</p>
                <p class="activity-time">${formatTimeAgo(activity.timestamp)}</p>
            </div>
        `;
        listContainer.appendChild(item);
    });
}

// Helper to format dates (e.g., "2 days ago")
function formatTimeAgo(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} mins ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    
    const days = Math.floor(diffInSeconds / 86400);
    if (days === 1) return '1 day ago';
    return `${days} days ago`;
}

// ============================================
// 2. Navigation Logic (NO CHANGES)
// ============================================

function initializeNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    
    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            navItems.forEach(i => i.classList.remove('active'));
            this.classList.add('active');
        });
    });
}

// ============================================
// 3. Logout Logic (NO CHANGES)
// ============================================

function initializeLogout() {
    const logoutBtn = document.querySelector('.logout-btn');
    
    if (logoutBtn) {
        logoutBtn.addEventListener('click', showLogoutModal);
    }

    const modal = document.getElementById('logout-modal');
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) hideLogoutModal();
        });

        const closeBtn = modal.querySelector('.logout-modal-close');
        const cancelBtn = modal.querySelector('.logout-modal-cancel');
        if (closeBtn) closeBtn.addEventListener('click', hideLogoutModal);
        if (cancelBtn) cancelBtn.addEventListener('click', hideLogoutModal);

        const confirmBtn = modal.querySelector('.logout-modal-confirm');
        if (confirmBtn) confirmBtn.addEventListener('click', confirmLogout);
    }
}

function showLogoutModal() {
    const modal = document.getElementById('logout-modal');
    if (modal) {
        modal.style.display = 'flex'; 
    }
}

function hideLogoutModal() {
    const modal = document.getElementById('logout-modal');
    if (modal) {
        modal.style.display = 'none';
    }
}

function confirmLogout() {
    sessionStorage.clear();
    localStorage.removeItem('token'); 
    window.location.href = '../../login admin/index.html';
}