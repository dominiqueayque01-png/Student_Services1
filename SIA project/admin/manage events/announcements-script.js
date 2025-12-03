// ============ CONFIGURATION ============
const API_URL = 'http://localhost:3001/api/event-announcements';
// Global Variables
let announcementsData = []; // Fetched from DB
let currentEditingAnnouncementId = null;
let currentTab = 'pending';

// ============ INITIALIZE ============
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded - initializing announcements');
    fetchAnnouncements(); // Load data from DB
    setupEventHandlers();
});

// ============ 1. FETCH DATA FROM DB ============
async function fetchAnnouncements() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('Failed to fetch');
        
        const rawData = await response.json();

        // Map MongoDB data to match your UI structure
        announcementsData = rawData.map(item => ({
            id: item._id, 
            title: item.title || 'Untitled', // Fallback title
            content: item.content || '',     // Fallback content
            status: item.status || 'Pending', // Fallback status
            postedDate: item.createdAt ? new Date(item.createdAt).toLocaleDateString('en-US') : 'Date N/A'
        }));

        renderAnnouncements();
        console.log('Announcements loaded:', announcementsData.length);

    } catch (error) {
        console.error('Error:', error);
        showAnnouncementToast('error', 'Error loading announcements');
    }
}

// ============ 2. SAVE (CREATE / UPDATE) ============
window.saveAnnouncement = async function() {
    const title = document.getElementById('announcement-title').value.trim();
    const content = document.getElementById('announcement-content').value.trim();

    if (!title || !content) {
        showAnnouncementToast('error', 'Please fill in all fields');
        return;
    }

    const payload = { title, content };

    try {
        let response;
        if (currentEditingAnnouncementId) {
            // UPDATE (PATCH)
            response = await fetch(`${API_URL}/${currentEditingAnnouncementId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
        } else {
            // CREATE (POST)
            // New announcements default to 'Pending' in backend schema
            response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                // Change status to 'Pending' so it goes to the approval queue
                body: JSON.stringify({ ...payload, status: 'Pending' }) 
            });
        }

        if (response.ok) {
            document.getElementById('announcement-modal').style.display = 'none';
           showAnnouncementToast('success', 'Announcement created successfully!');
            fetchAnnouncements(); // Refresh list
        } else {
            throw new Error('Failed to save');
        }
    } catch (error) {
        console.error(error);
        showAnnouncementToast('error', 'Error saving announcement');
    }
};

// ============ 3. STATUS UPDATES (Approve/Reject/Restore) ============
async function updateAnnouncementStatus(id, newStatus) {
    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus })
        });

        if (response.ok) {
            showAnnouncementToast('success', `Announcement ${newStatus}!`);
            fetchAnnouncements(); // Refresh
        } else {
            throw new Error('Failed to update status');
        }
    } catch (error) {
        console.error(error);
        showAnnouncementToast('error', 'Error updating status');
    }
}

window.approveAnnouncement = function(id) { updateAnnouncementStatus(id, 'Published'); };
window.rejectAnnouncement = function(id) { updateAnnouncementStatus(id, 'Rejected'); };
window.restoreAnnouncement = function(id) { updateAnnouncementStatus(id, 'Pending'); };

// ============ 4. DELETE ============
window.openDeleteConfirmation = function(id) {
    currentEditingAnnouncementId = id;
    document.getElementById('delete-announcement-modal').style.display = 'flex';
};

window.confirmDelete = async function() {
    if (!currentEditingAnnouncementId) return;

    try {
        const response = await fetch(`${API_URL}/${currentEditingAnnouncementId}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            document.getElementById('delete-announcement-modal').style.display = 'none';
            showAnnouncementToast('success', 'Announcement deleted');
            fetchAnnouncements(); // Refresh
        } else {
            throw new Error('Delete failed');
        }
    } catch (error) {
        console.error(error);
        showAnnouncementToast('error', 'Error deleting announcement');
    }
};

// ============ UI FUNCTIONS (UNCHANGED) ============

window.openNewAnnouncementModal = function() {
    currentEditingAnnouncementId = null;
    document.getElementById('announcement-modal-title').textContent = 'Add Announcement';
    document.getElementById('announcement-title').value = '';
    document.getElementById('announcement-content').value = '';
    document.getElementById('announcement-submit-btn').textContent = 'Publish Announcement';
    document.getElementById('announcement-modal').style.display = 'flex';
};

window.openEditAnnouncementModal = function(id) {
    const announcement = announcementsData.find(a => a.id === id);
    if (!announcement) return;

    currentEditingAnnouncementId = id;
    document.getElementById('announcement-modal-title').textContent = 'Edit Announcement';
    document.getElementById('announcement-title').value = announcement.title;
    document.getElementById('announcement-content').value = announcement.content;
    document.getElementById('announcement-submit-btn').textContent = 'Update Announcement';
    document.getElementById('announcement-modal').style.display = 'flex';
};

window.switchTab = function(tab) {
    currentTab = tab;
    renderAnnouncements();
};

window.viewAnnouncement = function(id) {
    const announcement = announcementsData.find(a => a.id === id);
    if (!announcement) return;
    
    // Simple View Modal generation
    const viewModal = document.createElement('div');
    viewModal.className = 'modal';
    viewModal.style.display = 'flex';
    viewModal.innerHTML = `
        <div class="modal-content" style="max-width: 600px;">
            <div class="modal-header">
                <div>
                    <h2 style="font-size: 24px; font-weight: 700; margin: 0; color: #333;">${announcement.title}</h2>
                    <p class="modal-subtitle" style="font-size: 12px; color: #999; margin: 6px 0 0 0;">Posted on ${announcement.postedDate}</p>
                </div>
                <button class="modal-close">&times;</button>
            </div>
            <div class="modal-body">
                <p style="font-size: 14px; color: #555; line-height: 1.8; white-space: pre-wrap;">${announcement.content}</p>
            </div>
            <div class="modal-footer">
                <button class="btn-cancel" style="padding: 12px 24px; border: 1px solid #e0e0e0; background: white; color: #333; border-radius: 4px; cursor: pointer; flex: 1;">Close</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(viewModal);
    
    const closeModal = () => viewModal.remove();
    viewModal.querySelector('.modal-close').onclick = closeModal;
    viewModal.querySelector('.btn-cancel').onclick = closeModal;
    viewModal.onclick = (e) => { if (e.target === viewModal) closeModal(); };
};

// ============ RENDER & FILTER (UNCHANGED LOGIC) ============
window.filterAnnouncements = function() {
    const searchTerm = document.getElementById('announcement-search')?.value.toLowerCase() || '';
    const container = document.getElementById('announcements-container');

    let filteredData = announcementsData;
    
    // Filter by tab
    if (currentTab !== 'all') {
        const status = currentTab.charAt(0).toUpperCase() + currentTab.slice(1);
        filteredData = filteredData.filter(a => a.status === status);
    }
    
    // Filter by search term (Safe Check)
    filteredData = filteredData.filter(announcement => {
        const title = (announcement.title || '').toLowerCase();
        const content = (announcement.content || '').toLowerCase();
        return title.includes(searchTerm) || content.includes(searchTerm);
    });

    container.innerHTML = '';

    if (filteredData.length === 0) {
        container.innerHTML = '<div class="no-announcements" style="text-align:center; padding:20px; color:#999;"><p>No announcements found.</p></div>';
        return;
    }

    filteredData.forEach(announcement => {
        const announcementCard = document.createElement('div');
        announcementCard.className = 'announcement-card';
        announcementCard.style.cursor = 'pointer';
        
        // 1. DETERMINE STATUS & BUTTONS
        const safeStatus = (announcement.status || 'Pending');
        let actionButtons = '';

        if (safeStatus === 'Pending') {
            actionButtons = `
                <button class="btn-outline btn-view" onclick="window.viewAnnouncement('${announcement.id}'); return false;">View</button>
                <button class="btn-outline btn-approve" onclick="window.approveAnnouncement('${announcement.id}'); return false;">Approve</button>
                <button class="btn-outline btn-reject" onclick="window.rejectAnnouncement('${announcement.id}'); return false;">Reject</button>
            `;
        } else if (safeStatus === 'Rejected') {
            actionButtons = `
                <button class="btn-outline btn-view" onclick="window.viewAnnouncement('${announcement.id}'); return false;">View</button>
                <button class="btn-outline btn-restore" onclick="window.restoreAnnouncement('${announcement.id}'); return false;">Restore</button>
                <button class="btn-outline btn-delete" onclick="window.openDeleteConfirmation('${announcement.id}'); return false;">Delete</button>
            `;
        } else {
            // Published
            actionButtons = `
                <button class="btn-outline btn-view" onclick="window.viewAnnouncement('${announcement.id}'); return false;">View</button>
                <button class="btn-outline btn-edit" onclick="window.openEditAnnouncementModal('${announcement.id}'); return false;">Edit</button>
                <button class="btn-outline btn-delete" onclick="window.openDeleteConfirmation('${announcement.id}'); return false;">Delete</button>
            `;
        }
        
        // 2. METADATA (Fallback values)
        const authorName = announcement.author || 'Supreme Student Counsil'; 
        const dateDisplay = announcement.postedDate || 'Date N/A';

        // 3. HTML STRUCTURE (Matches Figma Design)
        announcementCard.innerHTML = `
            <div class="announcement-card-header">
                <h3 class="card-title">${announcement.title}</h3>
                <span class="status-badge ${safeStatus.toLowerCase()}">${safeStatus}</span>
            </div>
            
            <div class="announcement-card-content">
                <p>${announcement.content}</p>
            </div>

            <div class="announcement-meta-info">
                <div class="meta-row">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                    <span>Posted by: <strong class="author-text">${authorName}</strong></span>
                </div>
                <div class="meta-row">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                    <span>Last Updated: ${dateDisplay}</span>
                </div>
            </div>

            <div class="card-divider"></div>

            <div class="announcement-card-footer">
                <div class="announcement-actions">
                    ${actionButtons}
                </div>
            </div>
        `;
        
        announcementCard.onclick = (e) => {
            if (e.target.tagName !== 'BUTTON') window.viewAnnouncement(announcement.id);
        };
        
        container.appendChild(announcementCard);
    });
};

function renderAnnouncements() {
    // Update tab styles
    const tabs = document.querySelectorAll('.tab-item');
    tabs.forEach(tab => {
        if (tab.getAttribute('data-tab') === currentTab) {
            tab.classList.add('active');
            tab.style.borderBottomColor = '#2d5aa8';
            tab.style.color = '#2d5aa8';
        } else {
            tab.classList.remove('active');
            tab.style.borderBottomColor = 'transparent';
            tab.style.color = '#999';
        }
    });
    
    window.filterAnnouncements();
}

// ============ HELPERS ============
function setupEventHandlers() {
    const searchInput = document.getElementById('announcement-search');
    if (searchInput) {
        searchInput.addEventListener('input', window.filterAnnouncements);
    }
    
    document.querySelectorAll('.tab-item').forEach(tab => {
        tab.addEventListener('click', function() {
            window.switchTab(this.getAttribute('data-tab'));
        });
    });
    
    // Sidebar Navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const page = this.getAttribute('data-page');
            if (page === 'index') window.location.href = 'index.html';
            else if (page === 'registrations') window.location.href = 'registrations.html';
            else if (page === 'announcements') window.location.href = 'announcements.html';
        });
    }); 
}

// --- TOAST NOTIFICATION LOGIC ---
function showAnnouncementToast(type, message) {
    // 1. Remove any existing toast to prevent stacking
    const existingToast = document.querySelector('.announcement-toast');
    if (existingToast) existingToast.remove();

    // 2. Create the HTML elements
    const toast = document.createElement('div');
    toast.className = `announcement-toast ${type}`;
    
    // Choose icon based on type
    const iconSymbol = type === 'success' ? '✓' : '!';
    
    toast.innerHTML = `
        <div class="toast-icon">${iconSymbol}</div>
        <div class="toast-message">${message}</div>
    `;

    // 3. Add to document
    document.body.appendChild(toast);

    // 4. Trigger Animation (Wait 10ms for DOM to render)
    setTimeout(() => {
        toast.classList.add('show');
    }, 10);

    // 5. Remove after 3 seconds
    setTimeout(() => {
        toast.classList.remove('show');
        // Wait for slide-down animation to finish before deleting
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 3000);
}