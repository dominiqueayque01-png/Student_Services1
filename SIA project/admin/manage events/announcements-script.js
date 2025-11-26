// Sample announcements data
let announcements = [
    {
        id: 1,
        title: "Tech Talk: IT Summit Registration Now Open!",
        content: "Join us for an exciting tech summit featuring industry leaders. Register now to secure your spot!",
        date: "10/8/2025",
        status: "Published"
    },
    {
        id: 2,
        title: "Reminder: QCU Bayanihan Week Tomorrow",
        content: "Don't forget! QCU Bayanihan Week starts tomorrow. See you there!",
        date: "09/28/2025",
        status: "Published"
    },
    {
        id: 3,
        title: "Career Fair 2025 - Save the Date",
        content: "Mark your calendars! Our annual Career Fair is coming up. Connect with top employers.",
        date: "08/15/2025",
        status: "Published"
    }
];

let currentEditingId = null;
let currentDeletingId = null;

const modal = document.getElementById('announcement-modal-overlay');
const modalTitle = document.getElementById('modal-title');
const modalSubtitle = document.getElementById('modal-subtitle');
const titleInput = document.getElementById('announcement-title');
const contentInput = document.getElementById('announcement-content');
const submitBtn = document.getElementById('modal-submit');
const deleteModal = document.getElementById('delete-modal-overlay');
const successMessage = document.getElementById('success-message');
const successText = document.getElementById('success-text');

// Render announcements
function renderAnnouncements(filter = '') {
    const list = document.getElementById('announcements-list');
    const filtered = announcements.filter(a => 
        a.title.toLowerCase().includes(filter.toLowerCase()) ||
        a.content.toLowerCase().includes(filter.toLowerCase())
    );

    if (filtered.length === 0) {
        list.innerHTML = '<div class="empty-state"><p>No announcements found</p></div>';
        return;
    }

    list.innerHTML = filtered.map(announcement => `
        <div class="announcement-card">
            <div class="announcement-banner"></div>
            <div class="announcement-container">
                <div class="announcement-header">
                    <h3 class="announcement-title">${announcement.title}</h3>
                    <span class="announcement-status">${announcement.status}</span>
                </div>
                <p class="announcement-content">${announcement.content}</p>
                <p class="announcement-meta">Posted: ${announcement.date}</p>
                <div class="announcement-actions">
                    <button class="btn-edit" onclick="editAnnouncement(${announcement.id})">
                        ✏️ Edit
                    </button>
                    <button class="btn-delete" onclick="openDeleteModal(${announcement.id})">
                        🗑️ Delete
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// Open modal for creating new announcement
document.getElementById('btn-add-announcement').addEventListener('click', function() {
    currentEditingId = null;
    modalTitle.textContent = 'Add Announcement';
    modalSubtitle.textContent = 'Post a new announcement for students to see';
    titleInput.value = '';
    contentInput.value = '';
    submitBtn.textContent = 'Publish Announcement';
    modal.classList.add('active');
});

// Edit announcement
function editAnnouncement(id) {
    const announcement = announcements.find(a => a.id === id);
    if (announcement) {
        currentEditingId = id;
        modalTitle.textContent = 'Edit Announcement';
        modalSubtitle.textContent = 'Update announcement details';
        titleInput.value = announcement.title;
        contentInput.value = announcement.content;
        submitBtn.textContent = 'Update Announcement';
        modal.classList.add('active');
    }
}

// Save announcement
document.getElementById('modal-submit').addEventListener('click', function() {
    const title = titleInput.value.trim();
    const content = contentInput.value.trim();

    if (!title || !content) {
        alert('Please fill in all fields');
        return;
    }

    const today = new Date();
    const dateStr = `${today.getMonth() + 1}/${today.getDate()}/${today.getFullYear()}`;

    if (currentEditingId === null) {
        // Add new announcement
        const newId = Math.max(...announcements.map(a => a.id), 0) + 1;
        announcements.unshift({
            id: newId,
            title,
            content,
            date: dateStr,
            status: 'Published'
        });
        successText.textContent = 'Announcement added successfully';
    } else {
        // Edit existing announcement
        const announcement = announcements.find(a => a.id === currentEditingId);
        if (announcement) {
            announcement.title = title;
            announcement.content = content;
            announcement.date = dateStr;
            successText.textContent = 'Announcement edited successfully';
        }
    }

    renderAnnouncements();
    modal.classList.remove('active');
    showSuccessMessage();
});

// Open delete confirmation modal
function openDeleteModal(id) {
    currentDeletingId = id;
    deleteModal.classList.add('active');
}

// Delete announcement
document.getElementById('delete-confirm').addEventListener('click', function() {
    announcements = announcements.filter(a => a.id !== currentDeletingId);
    renderAnnouncements();
    deleteModal.classList.remove('active');
    successText.textContent = 'Announcement deleted successfully';
    showSuccessMessage();
});

// Close modals
document.getElementById('modal-close').addEventListener('click', function() {
    modal.classList.remove('active');
});

document.getElementById('modal-cancel').addEventListener('click', function() {
    modal.classList.remove('active');
});

document.getElementById('delete-modal-close').addEventListener('click', function() {
    deleteModal.classList.remove('active');
});

document.getElementById('delete-cancel').addEventListener('click', function() {
    deleteModal.classList.remove('active');
});

// Close modal on overlay click
modal.addEventListener('click', function(e) {
    if (e.target === modal) {
        modal.classList.remove('active');
    }
});

deleteModal.addEventListener('click', function(e) {
    if (e.target === deleteModal) {
        deleteModal.classList.remove('active');
    }
});

// Search announcements
document.getElementById('search-announcements').addEventListener('keyup', function() {
    renderAnnouncements(this.value);
});

// Show success message
function showSuccessMessage() {
    successMessage.classList.add('show');
    setTimeout(() => {
        successMessage.classList.remove('show');
    }, 3000);
}

// Initial render
renderAnnouncements();
