// ==========================================
//   COUNSELING ANNOUNCEMENTS MANAGEMENT
// ==========================================

const API_URL_ANNOUNCEMENTS = 'http://localhost:3001/api/counseling-announcements'; 

let announcementsData = [];
let currentEditingId = null;

document.addEventListener('DOMContentLoaded', () => {
    fetchAnnouncements();
    setupEventListeners();
});

// --- 1. FETCH DATA ---
async function fetchAnnouncements() {
    const list = document.getElementById('announcements-list');
    if (!list) return;

    try {
        const response = await fetch(API_URL_ANNOUNCEMENTS);
        if (!response.ok) throw new Error('Failed to fetch');
        
        const data = await response.json();
        
        // Map data
        announcementsData = data.map(a => ({
            id: a._id,
            title: a.title,
            content: a.content,
            status: a.status || 'Published',
            date: new Date(a.createdAt).toLocaleDateString()
        }));

        renderAnnouncements();

    } catch (error) {
        console.error(error);
        list.innerHTML = '<p style="text-align:center; color:red; padding:20px;">Error loading announcements.</p>';
    }
}

// --- 2. RENDER LIST ---
function renderAnnouncements() {
    const list = document.getElementById('announcements-list');
    const searchBox = document.getElementById('announcement-search');
    const term = searchBox ? searchBox.value.toLowerCase().trim() : '';

    if (!list) return;
    list.innerHTML = '';

    const filtered = announcementsData.filter(a => 
        a.title.toLowerCase().includes(term) || 
        a.content.toLowerCase().includes(term)
    );

    if (filtered.length === 0) {
        list.innerHTML = '<p style="text-align:center; color:#999; padding:30px;">No announcements found.</p>';
        return;
    }

    filtered.forEach(a => {
        const item = document.createElement('div');
        item.className = 'announcement-item';
        
        item.innerHTML = `
            <div class="announcement-header">
                <h3 class="announcement-title">${a.title}</h3>
                <span class="announcement-status">${a.status}</span>
            </div>
            <p class="announcement-content">${a.content}</p>
            <p class="announcement-date">Posted: ${a.date}</p>
            <div class="announcement-actions">
                <button class="btn-edit-announcement" onclick="openAnnouncementModal(true, '${a.id}')">Edit</button>
                <button class="btn-delete-announcement" onclick="deleteAnnouncementConfirm('${a.id}')">Delete</button>
            </div>
        `;
        
        list.appendChild(item);
    });
}

// --- 3. MODAL LOGIC ---
window.openAnnouncementModal = function(isEdit, id = null) {
    const modal = document.getElementById('announcement-modal');
    const title = document.getElementById('announcement-modal-title');
    const btn = document.getElementById('announcement-submit-btn');
    
    currentEditingId = id;

    if (isEdit && id) {
        const item = announcementsData.find(x => x.id === id);
        if (!item) return;

        title.textContent = 'Edit Announcement';
        btn.textContent = 'Update Announcement';
        
        document.getElementById('announcement-title').value = item.title;
        document.getElementById('announcement-content').value = item.content;
    } else {
        title.textContent = 'Add Announcement';
        btn.textContent = 'Publish Announcement';
        document.getElementById('announcement-title').value = '';
        document.getElementById('announcement-content').value = '';
    }

    modal.style.display = 'flex';
};

// --- 4. SAVE LOGIC (Create/Update) ---
const submitBtn = document.getElementById('announcement-submit-btn');
if (submitBtn) {
    // Remove old listeners to prevent stacking
    const newBtn = submitBtn.cloneNode(true);
    submitBtn.parentNode.replaceChild(newBtn, submitBtn);

    newBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        
        const title = document.getElementById('announcement-title').value.trim();
        const content = document.getElementById('announcement-content').value.trim();

        if (!title || !content) {
            alert("Please fill in all fields.");
            return;
        }

        // Find existing status if editing, otherwise default to Published
        let statusToSave = 'Published';
        if (currentEditingId) {
            const existingItem = announcementsData.find(a => a.id === currentEditingId);
            if (existingItem) statusToSave = existingItem.status;
        }

        const payload = { 
            title, 
            content, 
            status: statusToSave 
        };

        console.log("Current Editing ID:", currentEditingId);

        try {
            const url = currentEditingId 
                ? `${API_URL_ANNOUNCEMENTS}/${currentEditingId}` 
                : API_URL_ANNOUNCEMENTS;
            
            const method = currentEditingId ? 'PATCH' : 'POST';

            console.log(`Sending ${method} request to: ${url}`);

            const res = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await res.json(); // Always parse JSON response

            if (res.ok) {
                showToast(currentEditingId ? 'Announcement Updated' : 'Announcement Published', 'success');
                document.getElementById('announcement-modal').style.display = 'none';
                fetchAnnouncements();
            } else {
                console.error('Server Error:', data);
                alert('Error: ' + (data.message || 'Unknown error'));
            }
        } catch (error) {
            console.error('Network Error:', error);
            alert('Network Error: Check console for details.');
        }
    });
}

// --- 5. DELETE LOGIC ---
let deleteId = null;
window.deleteAnnouncementConfirm = function(id) {
    deleteId = id;
    document.getElementById('delete-announcement-modal').style.display = 'flex';
};

const deleteBtn = document.querySelector('.btn-delete');
if (deleteBtn) {
    const newDelBtn = deleteBtn.cloneNode(true);
    deleteBtn.parentNode.replaceChild(newDelBtn, deleteBtn);
    
    newDelBtn.addEventListener('click', async () => {
        if (!deleteId) return;
        try {
            const res = await fetch(`${API_URL_ANNOUNCEMENTS}/${deleteId}`, { method: 'DELETE' });
            if (res.ok) {
                document.getElementById('delete-announcement-modal').style.display = 'none';
                showToast('Announcement deleted', 'success');
                fetchAnnouncements();
            }
        } catch (error) { console.error(error); }
    });
}


// --- UTILS ---
function setupEventListeners() {
    document.getElementById('announcement-search')?.addEventListener('keyup', renderAnnouncements);
    
    // Add Button
    document.querySelector('.btn-new-announcement')?.addEventListener('click', () => openAnnouncementModal(false));

    // Close Modals
    document.querySelectorAll('.modal-close, .btn-cancel').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.modal').forEach(m => m.style.display = 'none');
        });
    });

    // Sidebar Navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', function() {
            const page = this.getAttribute('data-page');
            if (page === 'index') window.location.href = 'index.html';
            else if (page === 'counselors') window.location.href = 'counselors.html';
            else if (page === 'announcements') window.location.href = 'announcements.html';
        });
    });
}

function showToast(message, type = 'success') {
    const div = document.createElement('div');
    div.className = `toast-notification ${type}`; // Use existing CSS class
    div.innerHTML = `<div class="toast-message">${message}</div>`;
    document.body.appendChild(div);
    setTimeout(() => div.classList.add('show'), 10);
    setTimeout(() => { div.classList.remove('show'); setTimeout(() => div.remove(), 300); }, 3000);
}