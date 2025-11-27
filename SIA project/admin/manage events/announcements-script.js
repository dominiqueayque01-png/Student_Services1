// Announcements data
let announcementsData = [
    {
        id: 1,
        title: 'Tech Talk: IT Summit Registration Now Open!',
        content: 'Join us for an exciting tech summit featuring industry leaders. Register now to secure your spot!',
        postedDate: '10/08/2025',
        status: 'Published'
    },
    {
        id: 2,
        title: 'Reminder: QCU Bayanihan Week Tomorrow',
        content: "Don't forget! QCU Bayanihan Week starts tomorrow. See you there!",
        postedDate: '09/25/2025',
        status: 'Published'
    },
    {
        id: 3,
        title: 'Career Fair 2025 - Save the Date',
        content: "Mark your calendars! Our annual Career Fair is coming up. Connect with top employers.",
        postedDate: '08/15/2025',
        status: 'Published'
    }
];

let currentEditingAnnouncementId = null;

// ============ GLOBAL FUNCTIONS ============

window.openNewAnnouncementModal = function() {
    console.log('Opening new announcement modal');
    currentEditingAnnouncementId = null;
    
    const titleEl = document.getElementById('announcement-modal-title');
    const subtitleEl = document.getElementById('announcement-modal-subtitle');
    const titleInput = document.getElementById('announcement-title');
    const contentInput = document.getElementById('announcement-content');
    const statusSelect = document.getElementById('announcement-status');
    const modal = document.getElementById('announcement-modal');
    
    if (titleEl) titleEl.textContent = 'Add Announcement';
    if (subtitleEl) subtitleEl.textContent = 'Post a new announcement for students to see';
    if (titleInput) titleInput.value = '';
    if (contentInput) contentInput.value = '';
    if (statusSelect) statusSelect.value = 'Published';
    
    if (modal) {
        modal.style.display = 'flex';
        console.log('Modal displayed');
    }
};

window.saveAnnouncement = function() {
    const title = document.getElementById('announcement-title').value.trim();
    const content = document.getElementById('announcement-content').value.trim();
    const status = document.getElementById('announcement-status').value;

    if (!title || !content) {
        const missingFields = [];
        if (!title) missingFields.push('Title');
        if (!content) missingFields.push('Content');
        showAnnouncementToast('error', `Missing fields: ${missingFields.join(', ')}`);
        return;
    }

    if (currentEditingAnnouncementId) {
        const announcement = announcementsData.find(a => a.id === currentEditingAnnouncementId);
        if (announcement) {
            announcement.title = title;
            announcement.content = content;
            announcement.status = status;
        }
    } else {
        const newId = Math.max(...announcementsData.map(a => a.id), 0) + 1;
        const today = new Date();
        const formattedDate = `${String(today.getMonth() + 1).padStart(2, '0')}/${String(today.getDate()).padStart(2, '0')}/${today.getFullYear()}`;

        announcementsData.unshift({
            id: newId,
            title: title,
            content: content,
            postedDate: formattedDate,
            status: status
        });
    }

    renderAnnouncements();
    document.getElementById('announcement-modal').style.display = 'none';
    showAnnouncementToast('success', currentEditingAnnouncementId ? 'Announcement updated successfully!' : 'Announcement published successfully!');
};

window.confirmDelete = function() {
    if (currentEditingAnnouncementId) {
        announcementsData = announcementsData.filter(a => a.id !== currentEditingAnnouncementId);
        renderAnnouncements();
        document.getElementById('delete-announcement-modal').style.display = 'none';
        showAnnouncementToast('success', 'Announcement deleted successfully!');
    }
};

window.openEditAnnouncementModal = function(id) {
    const announcement = announcementsData.find(a => a.id === id);
    if (!announcement) return;

    currentEditingAnnouncementId = id;
    document.getElementById('announcement-modal-title').textContent = 'Edit Announcement';
    document.getElementById('announcement-modal-subtitle').textContent = 'Update announcement details';
    document.getElementById('announcement-title').value = announcement.title;
    document.getElementById('announcement-content').value = announcement.content;
    document.getElementById('announcement-status').value = announcement.status;
    document.getElementById('announcement-modal').style.display = 'flex';
};

window.openDeleteConfirmation = function(id) {
    currentEditingAnnouncementId = id;
    document.getElementById('delete-announcement-modal').style.display = 'flex';
};

window.filterAnnouncements = function() {
    const searchTerm = document.getElementById('announcement-search').value.toLowerCase();
    const container = document.getElementById('announcements-container');

    const filteredData = announcementsData.filter(announcement => 
        announcement.title.toLowerCase().includes(searchTerm) ||
        announcement.content.toLowerCase().includes(searchTerm)
    );

    container.innerHTML = '';

    if (filteredData.length === 0) {
        container.innerHTML = '<div class="no-announcements"><p>No announcements found matching your search.</p></div>';
        return;
    }

    filteredData.forEach(announcement => {
        const announcementCard = document.createElement('div');
        announcementCard.className = 'announcement-card';
        announcementCard.innerHTML = `
            <div class="announcement-card-header">
                <h3>${announcement.title}</h3>
                <span class="status-badge ${announcement.status.toLowerCase()}">${announcement.status}</span>
            </div>
            <div class="announcement-card-content">
                <p>${announcement.content}</p>
            </div>
            <div class="announcement-card-footer">
                <span class="announcement-date">Posted ${announcement.postedDate}</span>
                <div class="announcement-actions">
                    <button class="btn-edit" onclick="window.openEditAnnouncementModal(${announcement.id}); return false;">Edit</button>
                    <button class="btn-delete" onclick="window.openDeleteConfirmation(${announcement.id}); return false;">Delete</button>
                </div>
            </div>
        `;
        container.appendChild(announcementCard);
    });
};

// ============ RENDER ANNOUNCEMENTS ============
function renderAnnouncements() {
    const container = document.getElementById('announcements-container');
    if (!container) return;

    container.innerHTML = '';

    if (announcementsData.length === 0) {
        container.innerHTML = '<div class="no-announcements"><p>No announcements yet. Create one to get started!</p></div>';
        return;
    }

    announcementsData.forEach(announcement => {
        const announcementCard = document.createElement('div');
        announcementCard.className = 'announcement-card';
        announcementCard.innerHTML = `
            <div class="announcement-card-header">
                <h3>${announcement.title}</h3>
                <span class="status-badge ${announcement.status.toLowerCase()}">${announcement.status}</span>
            </div>
            <div class="announcement-card-content">
                <p>${announcement.content}</p>
            </div>
            <div class="announcement-card-footer">
                <span class="announcement-date">Posted ${announcement.postedDate}</span>
                <div class="announcement-actions">
                    <button class="btn-edit" onclick="window.openEditAnnouncementModal(${announcement.id}); return false;">Edit</button>
                    <button class="btn-delete" onclick="window.openDeleteConfirmation(${announcement.id}); return false;">Delete</button>
                </div>
            </div>
        `;
        container.appendChild(announcementCard);
    });
}

// ============ SETUP EVENT HANDLERS ============
function setupEventHandlers() {
    console.log('Setting up event handlers...');
    
    // Search Input
    const searchInput = document.getElementById('announcement-search');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            window.filterAnnouncements();
        });
    }
}

// ============ NOTIFICATIONS ============
function showAnnouncementToast(type, message) {
    // Remove existing toast if present
    const existingToast = document.querySelector('.announcement-toast');
    if (existingToast) {
        existingToast.remove();
    }

    // Create toast element
    const toast = document.createElement('div');
    toast.className = `announcement-toast ${type}`;
    
    // Add icon based on type
    const icon = type === 'success' ? '✓' : '!';
    toast.innerHTML = `
        <span class="toast-icon">${icon}</span>
        <span class="toast-message">${message}</span>
    `;
    
    document.body.appendChild(toast);
    
    // Trigger animation
    setTimeout(() => {
        toast.classList.add('show');
    }, 10);
    
    // Auto-remove after 4 seconds
    setTimeout(function() {
        toast.classList.remove('show');
        setTimeout(function() {
            toast.remove();
        }, 300);
    }, 4000);
}

function showSuccessNotification(message) {
    const existing = document.querySelector('.success-notification');
    if (existing) {
        existing.remove();
    }

    const notification = document.createElement('div');
    notification.className = 'success-notification';
    notification.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
        <span>${message}</span>
    `;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// ============ INITIALIZE ============
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded - initializing announcements');
    renderAnnouncements();
    setupEventHandlers();
    console.log('Announcements initialized');
});
