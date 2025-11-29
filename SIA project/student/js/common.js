// Common helpers and global initializer (shared across student pages)

// Navigation / profile helpers
function handleProfileClick() {
    console.log('Profile clicked - Ready to redirect to profile panel');
    alert('Profile panel coming soon!');
}

function handleBackClick() {
    console.log('Back button clicked');
    window.history.back();
}

function handleServiceClick(service) {
    console.log(`${service} service clicked`);
    const serviceMap = {
        'counseling': 'counseling.html',
        'events': 'event.html',
        'clubs': 'clubs.html',
        'ojt': 'ojt.html'
    };
    window.location.href = serviceMap[service];
}

function navigateTo(page) {
    console.log(`Navigating to ${page}`);
    const pageMap = {
        'counseling.html': 'counseling.html',
        'events.html': 'event.html',
        'event.html': 'event.html',
        'clubs.html': 'clubs.html',
        'ojt.html': 'ojt.html',
        'index.html': 'index.html'
    };
    if (pageMap[page]) window.location.href = pageMap[page];
}

// Small helper used by multiple pages
function timeAgo(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);

    let interval = Math.floor(seconds / 31536000);
    if (interval > 1) return interval + " years ago";
    interval = Math.floor(seconds / 2592000);
    if (interval > 1) return interval + " months ago";
    interval = Math.floor(seconds / 86400);
    if (interval > 1) return interval + " days ago";
    interval = Math.floor(seconds / 3600);
    if (interval >= 1) return interval + " hours ago";
    interval = Math.floor(seconds / 60);
    if (interval >= 1) return interval + " mins ago";
    return "Just now";
}

// Global modal key handler (single source of truth)
function handleModalKeydown(e) {
    if (e.key === 'Escape' || e.key === 'Esc') {
        // Close known modals (feature scripts may define more specific closers)
        try { closeLearnMoreModal(); } catch (e) {}
        try { closeRequestFormModal(); } catch (e) {}
        try { closeSessionsModal(); } catch (e) {}
        try { closeFAQsModal(); } catch (e) {}
        try { closeAnnouncementDetailModal(); } catch (e) {}
        try { closeEventDetailModal(); } catch (e) {}
        try { closeRegistrationModal(); } catch (e) {}
        try { closeClubInfoModal(); } catch (e) {}
        try { closeClubApplicationModal(); } catch (e) {}
        try { closeOJTCompanyModal(); } catch (e) {}
    }
}

// Main initializer - runs on every student page. It detects which page
// elements exist and calls the corresponding feature initializer if present.
document.addEventListener('DOMContentLoaded', async () => {
    const currentPage = window.location.pathname.split('/').pop();
    const navLinks = document.querySelectorAll('.sidebar-nav .nav-item');

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === currentPage) link.classList.add('active');
    });

    const studentId = localStorage.getItem('currentStudentId');
    if (!studentId) console.log('No Student ID found. Simulation mode active.');

    // Page-specific initializers: call them only if the page element exists
    if (document.getElementById('ojtGrid') && typeof fetchAndInitializeOJT === 'function') {
        console.log('Page: OJT Listings');
        fetchAndInitializeOJT();
        const ojtSearch = document.getElementById('ojtSearchInput');
        if (ojtSearch) ojtSearch.addEventListener('keyup', searchAndFilterOJT);
    }

    else if (document.getElementById('clubsGrid') && typeof fetchAndInitializeClubs === 'function') {
        console.log('Page: Club Organization');
        fetchAndInitializeClubs();
        const clubSearch = document.getElementById('clubsSearchInput');
        if (clubSearch) clubSearch.addEventListener('keyup', searchAndFilterClubs);
        const clubForm = document.getElementById('clubApplicationForm');
        if (clubForm) clubForm.addEventListener('submit', handleApplicationSubmit);
    }

    else if (document.getElementById('upcoming') && typeof fetchAndInitializeEvents === 'function') {
        console.log('Page: Event Services');
        fetchAndInitializeEvents();
        const searchInput = document.getElementById('eventSearchInput');
        if (searchInput) searchInput.addEventListener('keyup', (e) => searchEvents(e.target.value));
    }

    else if (document.getElementById('requestForm') && typeof fetchAndRenderAnnouncements === 'function') {
        console.log('Page: Counseling Unit');
        fetchAndRenderAnnouncements();
        const requestForm = document.getElementById('requestForm');
        if (requestForm) requestForm.addEventListener('submit', handleRequestFormSubmit);

        const addInputListener = (id, regex) => {
            const el = document.getElementById(id);
            if (el) el.addEventListener('input', (e) => { e.target.value = e.target.value.replace(regex, ''); });
        };
        addInputListener('studentId', /[^0-9\-]/g);
        addInputListener('fullName', /[^a-zA-Z\s]/g);
        addInputListener('phone', /[^0-9\s\-\+]/g);
        addInputListener('refName', /[^a-zA-Z\s]/g);
        addInputListener('relationship', /[^a-zA-Z\s]/g);
        addInputListener('refPhone', /[^0-9\s\-\+]/g);

        const sessionsSearch = document.getElementById('sessionsSearch');
        if (sessionsSearch) {
            sessionsSearch.addEventListener('input', function() {
                const activeTabBtn = document.querySelector('#sessionsModal .tab-btn.active');
                const activeTabName = activeTabBtn ? activeTabBtn.getAttribute('onclick').match(/'([^']+)'/)[1] : 'pending';
                if (typeof renderSessionsList === 'function') renderSessionsList(activeTabName);
            });
        }

        if (studentId && typeof fetchAndRenderSessions === 'function') {
            try {
                const response = await fetch(`http://localhost:3001/api/counseling/my-appointments/${studentId}`);
                if (response.ok) {
                    const sessions = await response.json();
                    allStudentSessions = sessions;
                    if (typeof updateTabCounts === 'function') updateTabCounts();
                }
            } catch (err) {
                console.warn('Silent session fetch failed:', err);
            }
        }
    }

    // Homepage helpers
    else if (document.querySelector('.welcome-card')) {
        console.log('Page: Homepage');
    }

    // Initialize global FAQ/announcement lists if present
    if (document.getElementById('faqsList')) {
        if (typeof fetchAndRenderFAQs === 'function') fetchAndRenderFAQs();
    }
});