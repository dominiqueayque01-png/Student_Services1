// ============================================
// Admin Homepage Script
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    initializeHomepage();
});

function initializeHomepage() {
    // Check if user is logged in
    const isLoggedIn = sessionStorage.getItem('adminLoggedIn');
    if (isLoggedIn !== 'true') {
        window.location.href = '../../login admin/index.html';
        return;
    }

    // Initialize back button
    initializeBackButton();
    
    // Initialize profile button
    initializeProfileButton();

    console.log('Admin Homepage initialized');
}

function navigateTo(section) {
    console.log('Navigating to:', section);
    switch(section) {
        case 'club':
            window.location.href = '../club/index.html';
            break;
        case 'counseling':
            window.location.href = '../counseling/counseling.html';
            break;
        case 'events':
            window.location.href = '../manage events/events.html';
            break;
        case 'ojt':
            window.location.href = '../ojt/index.html';
            break;
        case 'leaders':
            console.log('Going to leaders dashboard');
            window.location.href = '../leaders-dashboard/indexLD.html';
            break;
        default:
            console.log('Unknown section:', section);
    }
}

function initializeBackButton() {
    const backButton = document.querySelector('.back-button');
    if (backButton) {
        backButton.addEventListener('click', function() {
            // Go back to student portal or previous page
            window.history.back();
        });
    }
}

function initializeProfileButton() {
    const profileButton = document.querySelector('.profile-button');
    if (profileButton) {
        profileButton.addEventListener('click', function() {
            // Show logout menu or redirect to profile
            showLogoutMenu();
        });
    }
}

function showLogoutMenu() {
    const confirmed = confirm('Do you want to logout?');
    if (confirmed) {
        sessionStorage.clear();
        window.location.href = '../../login admin/index.html';
    }
}

// Add keyboard navigation
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        window.history.back();
    }
});
