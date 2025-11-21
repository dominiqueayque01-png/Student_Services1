// Handle profile button click
function handleProfileClick() {
    console.log('Profile clicked - Ready to redirect to profile panel');
    // TODO: Redirect to profile panel once it's ready
    // window.location.href = 'profile.html';
    alert('Profile panel coming soon!');
}

// Handle back button click
function handleBackClick() {
    console.log('Back button clicked');
    // You can modify this based on your app's navigation structure
    window.history.back();
}

// Handle service card clicks
function handleServiceClick(service) {
    console.log(`${service} service clicked`);
    
    const serviceMap = {
        'counseling': 'counseling.html',
        'events': 'event.html',
        'clubs': 'clubs.html',
        'ojt': 'ojt.html'
    };

    // Redirect to the service page
    window.location.href = serviceMap[service];
}

// Navigation function for sidebar
function navigateTo(page) {
    console.log(`Navigating to ${page}`);
    
    // Map pages to their actual file paths
    const pageMap = {
        'counseling.html': 'counseling.html',
        // Some places may reference events.html or event.html; normalize both to the single file name
        'events.html': 'event.html',
        'event.html': 'event.html',
        'clubs.html': 'clubs.html',
        'ojt.html': 'ojt.html',
        'index.html': 'index.html'
    };

    // Prevent default link behavior and navigate
    if (pageMap[page]) {
        window.location.href = pageMap[page];
    }
}


/* ============================================
   COUNSELING PAGE FUNCTIONS (DYNAMIC VERSION)
   (With Read/Unread and Modal Logic)
   ============================================ */

// --- Global variables for this page ---
let allStudentSessions = []; // This will hold our fetched sessions
let allAnnouncements = []; // This will hold our fetched announcements

// --- 1. LOCALSTORAGE HELPER FUNCTIONS ---
// These functions will "remember" what you've read

// --- THIS IS THE FIXED CODE ---
function getReadAnnouncements() {
    const read = localStorage.getItem('counselingAnnouncements'); // <-- This is the fix
    return read ? JSON.parse(read) : [];
}

function saveReadAnnouncements(idArray) {
    localStorage.setItem('counselingAnnouncements', JSON.stringify(idArray));
}

function markAnnouncementAsRead(itemId) {
    let readIds = getReadAnnouncements();
    if (!readIds.includes(itemId)) {
        readIds.push(itemId);
        saveReadAnnouncements(readIds);
    }
    // Update the UI
    const itemEl = document.querySelector(`.announcement-item[data-id="${itemId}"]`);
    if (itemEl) {
        itemEl.setAttribute('data-read', 'true');
    }
    updateUnreadCount();
}

function markAllAsRead(event) {
    event.preventDefault();
    let readIds = allAnnouncements.map(item => item._id); // Get all IDs
    saveReadAnnouncements(readIds);
    
    // Update all UI elements
    document.querySelectorAll('.announcement-item').forEach(el => {
        el.setAttribute('data-read', 'true');
    });
    
    updateUnreadCount();
    filterAnnouncements('all'); // Switch to the "All" tab
}

// --- 2. DYNAMIC ANNOUNCEMENTS (FIXED) ---
    async function fetchAndRenderAnnouncements() {
    const listEl = document.getElementById('announcementsList');
    const noAnnouncementsMessageEl = document.getElementById('noAnnouncementsMessage'); 
    const readIds = getReadAnnouncements();

    try {
        const response = await fetch('http://localhost:3001/api/announcements');
        allAnnouncements = await response.json();

        listEl.innerHTML = '';
        noAnnouncementsMessageEl.style.display = 'none';

        if (allAnnouncements.length === 0) {
            noAnnouncementsMessageEl.textContent = 'No announcements at this time.';
            noAnnouncementsMessageEl.style.display = 'block';
            return;
        }

        allAnnouncements.forEach(item => {
            const isRead = readIds.includes(item._id);
                
            const announcementItem = document.createElement('div');
            announcementItem.className = 'announcement-item';
            announcementItem.setAttribute('data-id', item._id);
            announcementItem.setAttribute('data-read', isRead);
            
            // NO BUTTONS. Just Title, Date, and Content.
            announcementItem.innerHTML = `
                <h3 class="announcement-title">${item.title}</h3>
                <div class="announcement-meta">
                    <span class="meta-item">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1"><rect x="2" y="2" width="12" height="12" rx="1"/><path d="M2 6h12"/></svg>
                        Posted on: ${new Date(item.createdAt).toLocaleDateString()}
                    </span>
                </div>
                <p class="announcement-description">${item.content}</p>
                        `;
            
            // Click to open the "Read More" modal (View Only)
            announcementItem.addEventListener('click', () => {
                openAnnouncementDetailModal(item._id);
            });
            
            listEl.appendChild(announcementItem);
            });
        
        updateUnreadCount();
        filterAnnouncements('unread');

    } catch (error) {
        console.error('Error fetching announcements:', error);
        noAnnouncementsMessageEl.textContent = 'Could not load announcements.';
        noAnnouncementsMessageEl.style.display = 'block';
    }
}

// --- 3. FILTER & COUNT FUNCTIONS (FIXED) ---
function filterAnnouncements(filterType) {
    // Update button active state
    document.getElementById('filterUnread').classList.toggle('active', filterType === 'unread');
    document.getElementById('filterAll').classList.toggle('active', filterType === 'all');
    
    const items = document.querySelectorAll('.announcement-item');
    // Get the dedicated message element
    const noAnnouncementsMessageEl = document.getElementById('noAnnouncementsMessage');
    
    let hasUnread = false;

    items.forEach(item => {
        const isRead = item.getAttribute('data-read') === 'true';
        if (filterType === 'unread') {
            if (isRead) {
                item.style.display = 'none';
            } else {
                item.style.display = 'block';
                hasUnread = true;
            }
           } else {
            // "All" tab
            item.style.display = 'block';
        }
    });

    // --- NEW LOGIC ---
    // This section now correctly shows/hides the message
    // without destroying the announcement items.
    
    // First, always hide the message
    noAnnouncementsMessageEl.style.display = 'none';

    if (filterType === 'unread' && !hasUnread) {
        // If "Unread" tab is active and no items are unread
        noAnnouncementsMessageEl.textContent = 'No unread announcements!';
        noAnnouncementsMessageEl.style.display = 'block';
    } else if (filterType === 'all' && items.length === 0) {
        // If "All" tab is active and there are no items at all
        noAnnouncementsMessageEl.textContent = 'No announcements at this time.';
        noAnnouncementsMessageEl.style.display = 'block';
    }
}

function updateUnreadCount() {
    const readIds = getReadAnnouncements();
    const unreadCount = allAnnouncements.filter(item => !readIds.includes(item._id)).length;
    
    const badge = document.getElementById('unreadCount');
    if (badge) {
        badge.textContent = unreadCount;
        badge.style.display = unreadCount > 0 ? 'flex' : 'none';
    }
}

// --- 4. DYNAMIC FAQs ---
async function handleRequestFormSubmit(e) {
    if (e && e.preventDefault) e.preventDefault(); 
    console.log("Checkpoint 1: Function started");

    const form = document.getElementById('requestForm');
    if (!form.checkValidity()) { form.reportValidity(); return; }
    
    const formData = new FormData(form);
    const payload = {
        studentId: formData.get('studentId'),
        studentFullName: formData.get('fullName'),
        studentPhone: formData.get('phone'),
        studentEmail: formData.get('email'),
        preferredMode: formData.get('preferredMode'),
        referenceContact: {
            name: formData.get('refName'),
            relationship: formData.get('relationship'),
            phone: formData.get('refPhone'),
            email: formData.get('refEmail')

            
        }
    };

    try {
        console.log("Checkpoint 2: Sending to backend...");
        const response = await fetch('http://localhost:3001/api/admin/counseling/appointments', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        console.log("Checkpoint 3: Response received", response);

        if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
        }

        // Try to parse JSON (This sometimes causes crashes if server returns text)
        const data = await response.json(); 
        console.log("Checkpoint 4: Data parsed", data);

        // Save ID
        localStorage.setItem('currentStudentId', payload.studentId);

        // Close modal
        form.reset();
        // Check if this function exists before calling
        if (typeof closeRequestFormModal === 'function') {
            closeRequestFormModal();
        } else {
            console.warn("closeRequestFormModal function is missing!");
        }

        // SUCCESS ALERT
        alert('Request submitted successfully!');
        console.log("Checkpoint 5: Success Alert shown");

        // --- DANGEROUS PART (UI REFRESH) ---
        // We will comment this out for ONE TEST to see if the error stops.
        /* try {
            await fetchAndRenderSessions();
        } catch (innerErr) {
            console.warn("List refresh failed", innerErr);
        }
        */
       // ------------------------------------

    } catch (error) {
        console.error("CRASH REPORT:", error); // This will show us the real error
        alert('There was a problem submitting your request.\nCheck Console for details.');
    }
    }
// --- 6. DYNAMIC "MY SESSIONS" LIST ---
async function fetchAndRenderSessions() {
    // ... (This function is already correct, no changes needed) ...
    const listEl = document.getElementById('sessionsList');
    if (!listEl) return;
    listEl.innerHTML = '<p style="padding: 20px; text-align: center; color: #666;">Loading sessions...</p>';
    try {

        // --- NEW DYNAMIC CODE ---
        // Get the student ID from the browser's memory
        const studentId = localStorage.getItem('currentStudentId');

        if (!studentId) {
            // If no student ID is saved, show a message and stop
            listEl.innerHTML = '<p style="padding: 20px; text-align: center; color: #666;">Submit a request form to see your sessions.</p>';
            allStudentSessions = []; // Ensure sessions are empty
            updateTabCounts(); // Update counts to 0
            return;
        }
        // --- END OF NEW CODE ---
        
        const response = await fetch(`http://localhost:3001/api/counseling/my-appointments/${studentId}`);
        allStudentSessions = await response.json();
        updateTabCounts();
        const activeTabBtn = document.querySelector('#sessionsModal .tab-btn.active');
        const activeTabName = activeTabBtn.getAttribute('onclick').match(/'([^']+)'/)[1] || 'pending';
        renderSessionsList(activeTabName);
    } catch (error) {
        console.error('Error fetching sessions:', error);
        listEl.innerHTML = '<p style="padding: 20px; text-align: center; color: #666;">Could not load sessions.</p>';
    }
}

function renderSessionsList(filterTab = 'pending') {
    const listEl = document.getElementById('sessionsList');
    if (!listEl) return;

    const filtered = allStudentSessions.filter(s => s.status.toLowerCase() === filterTab.toLowerCase());
    
    listEl.innerHTML = '';

    if (filtered.length === 0) {
        listEl.innerHTML = '<p style="padding: 20px; text-align: center; color: #666; font-size: 13px;">No sessions found in this category.</p>';
        return;
    }

    filtered.forEach(session => {
        const card = document.createElement('div');
        const statusClass = `status-${session.status.toLowerCase()}`; 
        const badgeClass = `badge-${session.status.toLowerCase()}`;
        
        card.className = `session-card ${statusClass}`;
        
        const submittedDate = new Date(session.createdAt).toLocaleDateString();
        const counselorName = session.assignedCounselor ? session.assignedCounselor.name : 'Waiting for assignment...';
        
        let scheduleDisplay = 'Not Scheduled';
        if (session.scheduledDateTime) {
            const dateObj = new Date(session.scheduledDateTime);
            scheduleDisplay = `${dateObj.toLocaleDateString()} • ${dateObj.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;
        }

        let modeBadge = '';
            if (session.preferredMode === 'Virtual') {
                modeBadge = `<span style="font-size:10px; background:#e0f2fe; color:#0284c7; padding:2px 6px; border-radius:4px; border:1px solid #bae6fd;">📹 Virtual</span>`;
            } else {
                modeBadge = `<span style="font-size:10px; background:#f1f5f9; color:#475569; padding:2px 6px; border-radius:4px; border:1px solid #cbd5e1;">🏫 In-Person</span>`;
            }

// Add it to your HTML string, maybe next to the Case ID or Date
card.innerHTML = `
    <div class="session-header">
        <div>
            <span class="session-id">Case #${session._id.slice(-6).toUpperCase()}</span>
            ${modeBadge} </div>
        <span class="status-badge ${badgeClass}">${session.status}</span>
    </div>
    ...
`;
        
        // === LOGIC FOR CANCEL BUTTON ===
        // Only show button if status is 'Pending'
        let actionButtons = '';
        if (session.status === 'Pending') {
            actionButtons = `
                <div style="margin-top: 12px; padding-top: 12px; border-top: 1px dashed #e2e8f0; text-align: right;">
                    <button class="btn-cancel-request" onclick="cancelSession(event, '${session._id}')">
                        Cancel Request
                    </button>
                </div>
            `;
        }

        card.innerHTML = `
            <div class="session-header">
                <span class="session-id">Case #${session._id.slice(-6).toUpperCase()}</span>
                <span class="status-badge ${badgeClass}">${session.status}</span>
            </div>
            <div class="session-date">Requested on: ${submittedDate}</div>

            <div class="session-details-grid">
                <div class="detail-item">
                    <span class="detail-label">Student Name</span>
                    <span class="detail-value">${session.studentFullName}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Counselor</span>
                    <span class="detail-value">${counselorName}</span>
                </div>
                <div class="detail-item" style="grid-column: 1 / -1; margin-top: 6px;">
                    <span class="detail-label">Schedule</span>
                    <span class="detail-value" style="color: #2c3e7f;">${scheduleDisplay}</span>
                </div>
            </div>
            
            ${actionButtons} `;

        // Click card to open details (optional, currently just logs)
        card.addEventListener('click', (e) => {
            // Prevent card click if we clicked the button
            if(e.target.tagName === 'BUTTON') return;
            console.log("Clicked session:", session._id);
        });
        
        listEl.appendChild(card);
    });
}

// === ADD THIS NEW FUNCTION TO HANDLE THE CLICK ===
async function cancelSession(event, sessionId) {
    event.stopPropagation(); // Stop the card from opening details
    
    if (!confirm("Are you sure you want to cancel this request?")) return;

    try {
        const response = await fetch(`http://localhost:3001/api/counseling/cancel/${sessionId}`, {
            method: 'PATCH' // We use PATCH because we are updating part of the record
        });

        if (response.ok) {
            alert("Request cancelled successfully.");
            fetchAndRenderSessions(); // Refresh the list to see the change
        } else {
            alert("Failed to cancel request.");
        }
    } catch (error) {
        console.error("Error cancelling:", error);
        alert("An error occurred.");
    }
}

function updateTabCounts() {
    // ... (This function is already correct, no changes needed) ...
    const pendingCount = allStudentSessions.filter(s => s.status === 'Pending').length;
    const scheduledCount = allStudentSessions.filter(s => s.status === 'Scheduled').length;
    const completedCount = allStudentSessions.filter(s => s.status === 'Completed').length;
    document.getElementById('countPending').textContent = pendingCount || '';
    document.getElementById('countScheduled').textContent = scheduledCount || '';
    document.getElementById('countCompleted').textContent = completedCount || '';
}

function switchSessionTab(tabName) {
    // ... (This function is already correct, no changes needed) ...
    document.querySelectorAll('#sessionsModal .tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('onclick').includes(`'${tabName}'`));
    });
    renderSessionsList(tabName);
}

// --- 7. MODAL HELPER FUNCTIONS (With new Announcement Modal) ---

function openAnnouncementDetailModal(itemId) {
    const item = allAnnouncements.find(a => a._id === itemId);
    if (!item) return;

    const modal = document.getElementById('announcementDetailModal');
    if (modal) {
        document.getElementById('announcementDetailTitle').textContent = item.title;
        document.getElementById('announcementDetailMeta').innerHTML = `
            <span class="meta-item">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1"><rect x="2" y="2" width="12" height="12" rx="1"/><path d="M2 6h12"/></svg>
                Posted on: ${new Date(item.createdAt).toLocaleDateString()}
            </span>
        `;
        document.getElementById('announcementDetailContent').textContent = item.content;
        
        modal.setAttribute('aria-hidden', 'false');
        modal.classList.add('open');
        document.addEventListener('keydown', handleModalKeydown);
        
        // Mark as read and switch to "All" tab
        markAnnouncementAsRead(item._id);
        filterAnnouncements('all');
    }
}
function closeAnnouncementDetailModal() {
    const modal = document.getElementById('announcementDetailModal');
    if (modal) {
        modal.setAttribute('aria-hidden', 'true');
        modal.classList.remove('open');
        document.removeEventListener('keydown', handleModalKeydown);
    }
}

function openLearnMoreModal() {
    // ... (This function is already correct, no changes needed) ...
    const modal = document.getElementById('learnMoreModal');
    if (modal) {
        modal.setAttribute('aria-hidden', 'false');
        modal.classList.add('open');
        document.addEventListener('keydown', handleModalKeydown);
    }
}
function closeLearnMoreModal() {
    // ... (This function is already correct, no changes needed) ...
    const modal = document.getElementById('learnMoreModal');
    if (modal) {
        modal.setAttribute('aria-hidden', 'true');
        modal.classList.remove('open');
        document.removeEventListener('keydown', handleModalKeydown);
    }
}
function openRequestFormModal() {
    // ... (This function is already correct, no changes needed) ...
    const modal = document.getElementById('requestFormModal');
    if (modal) {
        modal.setAttribute('aria-hidden', 'false');
        modal.classList.add('open');
        document.addEventListener('keydown', handleModalKeydown);
    }
}
function closeRequestFormModal() {
    // ... (This function is already correct, no changes needed) ...
    const modal = document.getElementById('requestFormModal');
    if (modal) {
        modal.setAttribute('aria-hidden', 'true');
           modal.classList.remove('open');
        document.removeEventListener('keydown', handleModalKeydown);


    }
}
function openSessionsModal() {
    // ... (This function is already correct, no changes needed) ...
    const modal = document.getElementById('sessionsModal');
    if (modal) {
        modal.setAttribute('aria-hidden', 'false');
        modal.classList.add('open');
        document.addEventListener('keydown', handleModalKeydown);
        fetchAndRenderSessions(); 
    }
}
function closeSessionsModal() {
    // ... (This function is already correct, no changes needed) ...
    const modal = document.getElementById('sessionsModal');
    if (modal) {
        modal.setAttribute('aria-hidden', 'true');
        modal.classList.remove('open');
        document.removeEventListener('keydown', handleModalKeydown);
    }
}
function openFAQsModal() {
    // ... (This function is already correct, no changes needed) ...
    const modal = document.getElementById('faqsModal');
    if (modal) {
        modal.setAttribute('aria-hidden', 'false');
        modal.classList.add('open');
        document.addEventListener('keydown', handleModalKeydown);
        fetchAndRenderFAQs(); 
    }
}
function closeFAQsModal() {
    // ... (This function is already correct, no changes needed) ...
    const modal = document.getElementById('faqsModal');
    if (modal) {
        modal.setAttribute('aria-hidden', 'true');
        modal.classList.remove('open');
        document.removeEventListener('keydown', handleModalKeydown);
    }
}

// This is the global modal closer (now includes new modal)
function handleModalKeydown(e) {
    if (e.key === 'Escape' || e.key === 'Esc') {
        closeLearnMoreModal();
        closeRequestFormModal();
        closeSessionsModal();
        closeFAQsModal();
        closeAnnouncementDetailModal(); // <-- ADD THIS
ind   }
}


// --- 8. (NEW CODE) ATTACH EVENT LISTENERS ---
// We need to wait for the page to be fully loaded before attaching listeners


/* ============================================
   EVENT PAGE LOGIC - SAVED EVENTS FOCUS
   ============================================ */

        let allEventsData = [];
        let mySavedEventIds = []; // Stores just the IDs of saved events [ "id1", "id2" ]
        let myRegistrations = []; // <--- THIS WAS MISSING causing the modal crash
        let currentEventId = null;

        let calendarDate = new Date();


/* ============================================
   NOTIFICATION LOGIC
   ============================================ */
async function fetchNotifications(studentId) {
    try {
        const response = await fetch(`http://localhost:3001/api/notifications/${studentId}`);
        const notifications = await response.json();
        renderNotifications(notifications);
    } catch (error) {
        console.error("Error loading notifications:", error);
    }
}

function renderNotifications(notifications) {
    const container = document.getElementById('latestItems');
    if (!container) return;

    container.innerHTML = '';

    if (notifications.length === 0) {
        container.innerHTML = '<p style="font-size:12px; color:#999; padding:10px;">No new notifications.</p>';
        return;
    }

    notifications.forEach(notif => {
        const item = document.createElement('div');
        
        // Apply 'read' class if it's read
        const readClass = notif.isRead ? 'read' : '';
        item.className = `latest-item ${readClass}`;

        // 1. The Star Icon (Yellow)
        const icon = `
            <div class="notif-icon">
                <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="#f59e0b" stroke-width="1.5">
                    <path d="M10 2l2.4 4.8h5.2l-4.2 3.2 1.6 4.8-4-3.2-4 3.2 1.6-4.8-4.2-3.2h5.2z"/>
                </svg>
            </div>
        `;

        // 2. The Red Dot (Only if NOT read)
        const dotHTML = !notif.isRead ? `<div class="unread-dot"></div>` : '';

        // 3. The Time Formatting
        const timeString = timeAgo(notif.createdAt); // Uses our new helper
        // Optional: Tooltip with full date
        const fullDate = new Date(notif.createdAt).toLocaleString();

        item.innerHTML = `
            ${icon}
            <div class="notif-content">
                <span class="notif-message">${notif.message}</span>
                <span class="notif-time" title="${fullDate}">${timeString}</span>
            </div>
            ${dotHTML}
        `;
        
        container.appendChild(item);
    });
}

async function markAllEventsAsRead(e) {
    if(e) e.preventDefault();
    const studentId = localStorage.getItem('currentStudentId');
    if(!studentId) return;

    try {
        await fetch(`http://localhost:3001/api/notifications/mark-read/${studentId}`, { method: 'PATCH' });
        // Refresh the list visually
        fetchNotifications(studentId);
    } catch (err) {
        console.error(err);
    }
}

/* --- Helper: Format Date like Facebook/Twitter --- */
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


// --- RENDER HISTORY (PAST EVENTS) ---
function renderHistoryEvents() {
    const historyList = document.getElementById('history');
    if (!historyList) return;
    
    historyList.innerHTML = '';

    const now = new Date(); // Current time

    // Filter: Registered AND Date is in the past
    const pastEvents = allEventsData.filter(event => {
        const eventDate = new Date(event.date);
        return myRegistrations.includes(event._id) && eventDate < now;
    });

    if (pastEvents.length === 0) {
        historyList.innerHTML = '<p style="text-align: center; color: #999; padding: 30px 20px;">No past events attended.</p>';
        return;
    }

    pastEvents.forEach(event => {
        const dateString = new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        
        const card = document.createElement('div');
        card.className = `event-list-item ${event.category || 'academic'}`;
        
        // We fade it out slightly to show it's "done"
        card.style.opacity = '0.8'; 
        card.style.backgroundColor = '#f8fafc';
        card.style.cursor = 'pointer';

        card.innerHTML = `
             <div class="event-color-indicator ${event.category || 'academic'}" style="background-color:#94a3b8;"></div>
             
             <div class="event-item-content">
                <h4 class="event-item-title" style="color:#64748b; text-decoration: line-through;">${event.title}</h4>
                <p class="event-item-date">Completed • ${dateString}</p>
             </div>
             
             <div style="background:#e2e8f0; color:#475569; font-size:11px; font-weight:600; padding:4px 8px; border-radius:4px;">
                Done
             </div>
        `;

        // Still allow clicking to see details (for reference)
        card.addEventListener('click', () => {
            openEventDetail_DYNAMIC(event._id);
        });

        historyList.appendChild(card);
    });
}

/* ============================================
   ADVANCED CALENDAR (Multi-Event Support)
   ============================================ */

// Define your category colors here (Must match your CSS)
const categoryColors = {
    academic: '#f59e0b',     // Orange
    community: '#9b59b6',    // Purple
    institutional: '#64748b',// Grey
    recreation: '#3b82f6',   // Blue
    culture: '#e91e63',      // <--- NEW: Pink for Culture & Arts
    default: '#2c3e7f'       // Fallback Blue
};

function renderCalendar(events) {
    const calendarDays = document.querySelector('.calendar-days');
    const calendarTitle = document.querySelector('.calendar-title');

    if (!calendarDays || !calendarTitle) return; 

    const year = calendarDate.getFullYear();
    const month = calendarDate.getMonth();
    
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    calendarTitle.textContent = `${monthNames[month]} ${year}`;

    const firstDayIndex = new Date(year, month, 1).getDay(); 
    const adjustedFirstDay = (firstDayIndex === 0 ? 6 : firstDayIndex - 1);
    const lastDay = new Date(year, month + 1, 0).getDate(); 

    calendarDays.innerHTML = ''; 

    // === FIX PART 1: Create a bucket to hold this month's events ===
    const eventsInThisMonth = []; 
    // ==============================================================

    // Empty slots
    for (let i = 0; i < adjustedFirstDay; i++) {
        calendarDays.innerHTML += `<div class="calendar-day empty"></div>`;
    }

    // Days
    for (let i = 1; i <= lastDay; i++) {
        const dayDiv = document.createElement('div');
        dayDiv.className = 'calendar-day';
        dayDiv.textContent = i;

        // Find ALL events for this specific day
        const daysEvents = events.filter(event => {
            const eDate = new Date(event.date);
            return eDate.getDate() === i && 
                   eDate.getMonth() === month && 
                   eDate.getFullYear() === year;
        });

        if (daysEvents.length > 0) {
            // === FIX PART 2: Add found events to our bucket ===
            eventsInThisMonth.push(...daysEvents);
            // ==================================================

            dayDiv.style.cursor = 'pointer';
            dayDiv.classList.add('has-event');

            // Color Logic
            if (daysEvents.length === 1) {
                const cat = daysEvents[0].category || 'academic';
                dayDiv.classList.add(cat);
            } else {
                const colors = daysEvents.map(e => categoryColors[e.category] || categoryColors.default);
                const uniqueColors = [...new Set(colors)];
                if (uniqueColors.length === 1) {
                    dayDiv.style.backgroundColor = uniqueColors[0];
                } else {
                    const gradient = `linear-gradient(135deg, ${uniqueColors.join(', ')})`;
                    dayDiv.style.background = gradient;
                }
            }
            
            // Click Logic
            dayDiv.addEventListener('click', () => {
                if (daysEvents.length === 1) {
                    openEventDetail_DYNAMIC(daysEvents[0]._id);
                } else {
                    document.querySelectorAll('.calendar-day').forEach(d => d.style.border = 'none');
                    dayDiv.style.border = '2px solid #2c3e7f';
                    renderUpcomingEvents(daysEvents);
                    const upcomingTab = document.querySelector('.tab-btn.active');
                    if (upcomingTab) upcomingTab.innerText = `Events on ${monthNames[month]} ${i}`;
                    document.getElementById('upcoming').classList.add('active');
                    document.getElementById('saved').classList.remove('active');
                    document.getElementById('history').classList.remove('active');
                }
            });
        }

        // Highlight Today
        const today = new Date();
        if (i === today.getDate() && month === today.getMonth() && year === today.getFullYear()) {
            dayDiv.classList.add('today'); 
            if (daysEvents.length === 0) dayDiv.style.border = "2px solid #2c3e7f";
        }

        calendarDays.appendChild(dayDiv);
    }

    // === FIX PART 3: Send the bucket to the banner function ===
    updateFeaturedBannerForMonth(eventsInThisMonth);
    // ==========================================================
}

// === ADD THIS NEW HELPER FUNCTION ===
function updateFeaturedBannerForMonth(monthEvents) {
    const bannerSection = document.querySelector('.featured-event-banner');
    const btn = document.querySelector('.view-details-btn');

    if (monthEvents.length === 0) {
        // If no events, show placeholder
        renderFeaturedEvent({
            title: "No Featured Events",
            date: calendarDate, 
            location: "Campus Wide",
            imageUrl: "", 
            _id: null 
        });
        if(btn) btn.style.display = 'none'; // Hide button
        return;
    }

    // If events exist, show the first one
    if(btn) btn.style.display = 'block'; // Show button

    // Sort by date to find the earliest one
    monthEvents.sort((a, b) => new Date(a.date) - new Date(b.date));

    renderFeaturedEvent(monthEvents[0]);
}
function previousMonth() {
    calendarDate.setMonth(calendarDate.getMonth() - 1);
    renderCalendar(allEventsData);
}

function nextMonth() {
    calendarDate.setMonth(calendarDate.getMonth() + 1);
    renderCalendar(allEventsData);
}

/* ============================================
   SEARCH FUNCTION
   ============================================ */
/* ============================================
   SEARCH FUNCTION (FIXED: Future Events Only)
   ============================================ */
function searchEvents(query) {
    const lowerQuery = query.toLowerCase().trim();

    // 1. IF EMPTY: Reset to showing ONLY FUTURE events (Default View)
    if (!lowerQuery) {
        // Reset Tab Name
        document.querySelector('.events-tabs .tab-btn:first-child').textContent = 'Upcoming Events';
        
        const now = new Date();
        now.setHours(0,0,0,0);
        const futureEvents = allEventsData.filter(e => new Date(e.date) >= now);
        
        renderUpcomingEvents(futureEvents);
        return;
    }

    // 2. IF SEARCHING: Look through ALL data (Past & Future)
    const filteredEvents = allEventsData.filter(event => {
        const matchesTitle = event.title.toLowerCase().includes(lowerQuery);
        const matchesLoc = event.location.toLowerCase().includes(lowerQuery);
        return matchesTitle || matchesLoc;
    });

    // 3. Switch to the main list view to show results
    document.getElementById('upcoming').classList.add('active');
    document.getElementById('saved').classList.remove('active');
    document.getElementById('history').classList.remove('active');
    
    // Update buttons
    document.querySelectorAll('.events-tabs .tab-btn').forEach(btn => btn.classList.remove('active'));
    const firstBtn = document.querySelector('.events-tabs .tab-btn:first-child');
    firstBtn.classList.add('active');
    
    // UX: Change Tab text to indicate these are Search Results
    firstBtn.textContent = `Search Results (${filteredEvents.length})`;

    // 4. Render Mixed Results
    renderUpcomingEvents(filteredEvents);
}

function renderFeaturedEvent(event) {
    const featuredTitle = document.querySelector('.featured-title');
    const featuredDetails = document.querySelector('.featured-details');
    
    if (!featuredTitle || !featuredDetails) return;

    const eventDate = new Date(event.date);
    const dateString = eventDate.toLocaleDateString('en-US', {
        weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' 
    });

    featuredTitle.textContent = event.title;
    featuredDetails.textContent = `${dateString} · ${event.location}`;

    const viewDetailsBtn = document.querySelector('.view-details-btn');
    if (viewDetailsBtn) {
        // Use the DYNAMIC open function
        viewDetailsBtn.onclick = () => openEventDetail_DYNAMIC(event._id);
    }
}

async function fetchAndInitializeEvents() {
    try {
        const studentId = localStorage.getItem('currentStudentId');

        // 1. Fetch All Events
        const eventsResponse = await fetch('http://localhost:3001/api/events');
        allEventsData = await eventsResponse.json();

        // 2. Fetch My Registrations (If logged in)
        if (studentId) {
            // Get Registrations (For the "Already Registered" button check)
            try {
                const regResponse = await fetch(`http://localhost:3001/api/registrations/my-registrations/${studentId}`);
                const regData = await regResponse.json();
                // Save JUST the IDs to the global variable
                myRegistrations = regData.map(r => r.eventId); 
            } catch (err) {
                console.warn("Could not fetch registrations", err);
                myRegistrations = [];
            }
                fetchNotifications(studentId);
            // Get Saved/Bookmarked Events (For the Yellow Star)
            try {
                const saveResponse = await fetch(`http://localhost:3001/api/saved-events/${studentId}`);
                mySavedEventIds = await saveResponse.json();
            } catch (err) {
                console.warn("Could not fetch saved events", err);
                mySavedEventIds = [];
            }
        }

        // 3. Render Everything
        renderUpcomingEvents(allEventsData);

        const now = new Date();
        now.setHours(0, 0, 0, 0); // Reset time so "Today" events still show up
        
        const futureEvents = allEventsData.filter(event => new Date(event.date) >= now);
        renderUpcomingEvents(futureEvents);
        renderSavedEvents();
        renderHistoryEvents();

        // 4. Initialize Calendar and Featured Event
        
        if (allEventsData.length > 0) {
            renderFeaturedEvent(allEventsData[0]);
            renderCalendar(allEventsData); 
        }

    } catch (error) {
        console.error('Error initializing events:', error);
    }
}

/* ============================================
   MISSING MODAL FUNCTIONS
   ============================================ */

function openEventDetail_DYNAMIC(eventId) {
    const event = allEventsData.find(e => e._id === eventId); 
    if (!event) {
        console.error("Event not found:", eventId);
        return;
    }

    currentEventId = eventId; 
    const container = document.getElementById('eventDetailContent');
    if (!container) return;

    // Format Date
    const eventDate = new Date(event.date);
    const dateString = eventDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

    // Check if already registered
    const isRegistered = myRegistrations.includes(eventId);
    
    // Determine Button State
    let registerBtnHTML = '';
    if (isRegistered) {
        registerBtnHTML = `<button type="button" disabled style="background:#ecfdf5; color:#10b981; border:1px solid #10b981; padding:12px 20px; border-radius:6px; cursor:default; font-weight:600;">✓ Already Registered</button>`;
    } else {
        // Note: We pass the ID and Title to the registration modal
        registerBtnHTML = `<button type="button" class="learn-more-btn" style="background:#2c3e7f;color:#fff;padding:12px 20px;border-radius:6px;border:0;cursor:pointer;" onclick="openRegistrationModal('${event._id}', '${event.title}')">Register Now</button>`;
    }

    // Safe checks for Arrays (Agenda/Expectations)
    const agendaHTML = (event.agenda && event.agenda.length > 0) 
        ? event.agenda.map((item, idx) => `
            <div style="display:flex;gap:12px;margin-bottom:12px; align-items: center;">
                <div style="background:#2c3e7f;color:#fff;border-radius:50%;width:32px;height:32px;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-weight:600;font-size:12px;">${idx + 1}</div>
                <div>
                    <div style="font-weight:700;color:#2c3e7f;font-size:13px;">${item.time}</div>
                    <div style="color:#666;font-size:13px;">${item.title}</div>
                </div>
            </div>`).join('') 
        : '<p style="color:#999;font-style:italic;">No detailed agenda provided.</p>';

    const expectationsHTML = (event.expectations && event.expectations.length > 0)
        ? event.expectations.map(exp => `
            <li style="display:flex;align-items:flex-start;gap:10px;margin-bottom:8px;">
                <span style="color:#2c3e7f;font-weight:bold;">✓</span>
                <span style="color:#555;font-size:14px;">${exp}</span>
            </li>`).join('')
        : '<li style="color:#999;font-style:italic;">No specific expectations listed.</li>';

    const requirementsHTML = event.requirements 
        ? `<p style="color:#4b5563; font-size:13px; line-height:1.5; background:#eff6ff; padding:12px 16px; border-radius:6px; border-left:4px solid #3b82f6; margin-top:4px;">
                <strong style="color:#1e40af;">⚠️ Requirement:</strong> ${event.requirements}
           </p>`
        : '';

    // Inject Content
    container.innerHTML = `
        ${event.imageUrl ? `<div style="background: url('${event.imageUrl}') no-repeat center center; background-size: cover; height:200px; border-radius:8px; margin-bottom:20px;"></div>` : ''}

        <p style="color:#666; font-size:13px; margin-bottom:16px;">Organized by ${event.organizer || 'QCU Student Services'}</p>

        <div style="display:grid; grid-template-columns: 1fr 1fr; gap: 20px 40px; background:#f8fafc; padding:20px; border-radius:8px; border:1px solid #e2e8f0; margin-bottom:24px;">
            <div>
                <div style="color:#2c3e7f; font-weight:700; font-size:12px; text-transform:uppercase; letter-spacing:0.5px;">Date</div>
                <div style="color:#334155; font-size:13px; font-weight:500; margin-top:2px;">${dateString}</div>
            </div>
            <div>
                <div style="color:#2c3e7f; font-weight:700; font-size:12px; text-transform:uppercase; letter-spacing:0.5px;">Time</div>
                <div style="color:#334155; font-size:13px; font-weight:500; margin-top:2px;">${event.time}</div>
            </div>
            <div>
                <div style="color:#2c3e7f; font-weight:700; font-size:12px; text-transform:uppercase; letter-spacing:0.5px;">Location</div>
                <div style="color:#334155; font-size:13px; font-weight:500; margin-top:2px;">${event.location}</div>
            </div>
            <div>
                <div style="color:#2c3e7f; font-weight:700; font-size:12px; text-transform:uppercase; letter-spacing:0.5px;">Availability</div>
                <div style="color:#334155; font-size:13px; font-weight:500; margin-top:2px;">${event.availability || 'Open to all'}</div>
            </div>
        </div>

        <h3 style="color:#1e293b; font-size:16px; font-weight:700; margin-bottom:10px;">About this Event</h3>
        <p style="color:#64748b; font-size:14px; line-height:1.6; margin-bottom:24px;">${event.description}</p>

        <h3 style="color:#1e293b; font-size:16px; font-weight:700; margin-bottom:12px;">Event Agenda</h3>
        <div style="background:#fff; border:1px solid #e2e8f0; border-radius:8px; padding:16px; margin-bottom:24px;">
            ${agendaHTML}
        </div>

        <h3 style="color:#1e293b; font-size:16px; font-weight:700; margin-bottom:12px;">What to Expect?</h3>
        <ul style="list-style:none; padding:0; margin:0 0 24px 0;">
            ${expectationsHTML}
        </ul>

        ${event.requirements ? `<h3 style="color:#1e293b; font-size:16px; font-weight:700; margin-bottom:12px;">Requirements</h3>` : ''}
        ${requirementsHTML}

        <div style="display:flex; justify-content:flex-end; gap:12px; margin-top:30px; border-top:1px solid #e2e8f0; padding-top:20px;">
            <button type="button" style="background:#fff; color:#64748b; border:1px solid #cbd5e1; padding:12px 20px; border-radius:6px; cursor:pointer; font-weight:500;" onclick="closeEventDetailModal()">Back to Calendar</button>
            ${registerBtnHTML}
        </div>
    `;

    const modal = document.getElementById('eventDetailModal');
    modal.setAttribute('aria-hidden', 'false');
    modal.classList.add('open');
}

function closeEventDetailModal() {
    const modal = document.getElementById('eventDetailModal');
    modal.setAttribute('aria-hidden', 'true');
    modal.classList.remove('open');
}

// --- RENDER LIST (Handles Future & Past Logic) ---
function renderUpcomingEvents(events) {
    const upcomingList = document.getElementById('upcoming');
    if (!upcomingList) return; 

    upcomingList.innerHTML = ''; 

    if (events.length === 0) {
        upcomingList.innerHTML = `
            <div style="text-align: center; padding: 40px 20px; color: #64748b;">
                <p>No events found.</p>
            </div>
        `;
        return;
    }

    const now = new Date();
    // Reset hours to ensure accurate day comparison
    now.setHours(0,0,0,0); 

    events.forEach(event => {
        const eventDate = new Date(event.date);
        const dateString = eventDate.toLocaleDateString('en-US', {
            weekday: 'long', month: 'short', day: 'numeric'
        });
        const category = event.category || 'academic';
        
        // === CHECK: IS IT PAST OR FUTURE? ===
        const isPast = eventDate < now;

        const eventCard = document.createElement('div');
        eventCard.className = `event-list-item ${category}`;
        
        // Common styles
        eventCard.style.cursor = 'pointer';
        eventCard.style.position = 'relative';

        if (isPast) {
            // === RENDER AS HISTORY STYLE (Gray) ===
            eventCard.style.opacity = '0.8'; 
            eventCard.style.backgroundColor = '#f8fafc';
            
            eventCard.innerHTML = `
                <div class="event-color-indicator ${category}" style="background-color:#94a3b8;"></div>
                <div class="event-item-content">
                    <h4 class="event-item-title" style="color:#64748b; text-decoration: line-through;">${event.title}</h4>
                    <p class="event-item-date">Ended • ${dateString}</p>
                    <p class="event-item-time">${event.time}</p>
                </div>
                <div style="background:#e2e8f0; color:#475569; font-size:11px; font-weight:600; padding:4px 8px; border-radius:4px; height:fit-content;">
                    Done
                </div>
            `;
        } else {
            // === RENDER AS UPCOMING STYLE (Colorful) ===
            const isSaved = mySavedEventIds.includes(event._id);
            const activeClass = isSaved ? 'active' : ''; 

            eventCard.innerHTML = `
                <div class="event-color-indicator ${category}"></div>
                <div class="event-item-content">
                    <h4 class="event-item-title">${event.title}</h4>
                    <p class="event-item-date">${dateString}</p>
                    <p class="event-item-time">${event.time} · ${event.location}</p>
                </div>
                <button class="save-event-btn ${activeClass}" style="position: relative; z-index: 10;">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5">
                        <path d="M4 2v16l8-5 8 5V2H4z"/>
                    </svg>
                </button>
            `;

            // Attach Save Button Listener (Only for future events)
            const saveBtn = eventCard.querySelector('.save-event-btn');
            saveBtn.addEventListener('click', (e) => {
                e.stopPropagation(); 
                toggleSaveEvent(e, event._id);
            });
        }

        // === GLOBAL CLICK: OPEN MODAL ===
        // (Works for both Past and Future)
        eventCard.addEventListener('click', () => {
            openEventDetail_DYNAMIC(event._id);
        });

        upcomingList.appendChild(eventCard);
    });
}


// --- TOGGLE SAVE LOGIC ---
async function toggleSaveEvent(e, eventId) {
    if (e) e.stopPropagation(); 
    
    const studentId = localStorage.getItem('currentStudentId');
    if (!studentId) {
        alert("Please submit a counseling form first to set your Student ID.");
        return;
    }

    // 1. Update Local Data
    const index = mySavedEventIds.indexOf(eventId);
    if (index > -1) {
        mySavedEventIds.splice(index, 1); // Remove ID
    } else {
        mySavedEventIds.push(eventId); // Add ID
    }

    // 2. REFRESH LISTS (WITH FIXES)
    
    // FIX A: Filter for Future Events before rendering "Upcoming"
    // This prevents "Past Events" from suddenly appearing when you click save
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const futureEvents = allEventsData.filter(event => new Date(event.date) >= now);
    
    renderUpcomingEvents(futureEvents); // <--- Render ONLY future events
    renderSavedEvents(); // Refresh the Saved tab

    // 3. Send to Backend
    try {
        await fetch('http://localhost:3001/api/saved-events/toggle', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ studentId, eventId })
        });
    } catch (error) {
        console.error("Error toggling save:", error);
        // Revert on error
        if (index > -1) mySavedEventIds.push(eventId);
        else mySavedEventIds.splice(mySavedEventIds.indexOf(eventId), 1);
        renderUpcomingEvents(futureEvents);
        renderSavedEvents();
    }
}

// --- RENDER SAVED EVENTS TAB ---
// --- 3. RENDER SAVED EVENTS (FIXED CLICK) ---
function renderSavedEvents() {
    const savedList = document.getElementById('saved');
    if (!savedList) return;
    
    savedList.innerHTML = '';

    // Filter Future & Saved
    const now = new Date();
    now.setHours(0,0,0,0);
    const savedEvents = allEventsData.filter(event => 
        mySavedEventIds.includes(event._id) && new Date(event.date) >= now
    );

    if (savedEvents.length === 0) {
        savedList.innerHTML = '<p style="text-align: center; color: #999; padding: 30px 20px;">No saved events.</p>';
        return;
    }

    savedEvents.forEach(event => {
        const dateString = new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        
        const card = document.createElement('div');
        card.className = `event-list-item ${event.category || 'academic'}`;
        
        card.innerHTML = `
             <div class="event-color-indicator ${event.category || 'academic'}"></div>
             <div class="event-item-content" style="cursor:pointer;">
                <h4 class="event-item-title">${event.title}</h4>
                <p class="event-item-date">Saved • ${dateString}</p>
             </div>
             <button class="save-event-btn active">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="M4 2v16l8-5 8 5V2H4z"/>
                </svg>
            </button>
        `;

        card.querySelector('.event-item-content').addEventListener('click', () => {
            openEventDetail_DYNAMIC(event._id);
        });

        // === CONFIRMATION LOGIC ===
        const unsaveBtn = card.querySelector('.save-event-btn');
        unsaveBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            // Ask before removing from the list
            if(confirm("Remove this event from your saved list?")) {
                toggleSaveEvent(e, event._id);
            }
        });

        savedList.appendChild(card);
    });
}

// --- TABS SWITCHER (Keep this) ---
function switchTab(tabName) {
    // Reset Buttons
    document.querySelectorAll('.events-tabs .tab-btn').forEach(btn => {
        btn.classList.remove('active');
        // Reset text if we changed it via calendar click
        if (btn.textContent.includes('Events on')) btn.textContent = 'Upcoming Events';
    });
    
    if (event && event.target) {
        event.target.classList.add('active');
    }

    // Reset Lists
    document.getElementById('upcoming').classList.remove('active');
    document.getElementById('saved').classList.remove('active');
    document.getElementById('history').classList.remove('active');
    
    document.getElementById(tabName).classList.add('active');

    // === FIX: IF SWITCHING TO UPCOMING, FILTER AGAIN ===
if (tabName === 'upcoming') {
        // === RESET SEARCH TEXT ===
        const upcomingBtn = document.querySelector('.events-tabs .tab-btn:first-child');
        upcomingBtn.textContent = 'Upcoming Events';
        
        // Clear Search Input
        const searchInput = document.getElementById('eventSearchInput');
        if(searchInput) searchInput.value = '';

        // Show Future Only
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        const futureEvents = allEventsData.filter(e => new Date(e.date) >= now);
        
        renderUpcomingEvents(futureEvents);
        
        document.querySelectorAll('.calendar-day').forEach(d => d.style.border = 'none');
    }
    // ===================================================
}
/* ============================================
   CLUBS PAGE FUNCTIONS (DYNAMIC VERSION)
   Handles club filtering, searching, sorting, and applications
   ============================================ */

// --- MODIFIED ---
// This was a hard-coded array. Now, it's our "global state"
// that will be filled by the backend.
let allClubsData = [];
let filteredClubs = [];
let myClubApplications = [];


// Your other global variables are perfect
let currentClubId = null;
let currentSortBy = 'newest';
let currentCategory = 'All';

// --- (This function is unchanged, it's perfect) ---
function getClubById(id) {
    // Note: We use allClubsData to find the club, even if it's filtered out
    return allClubsData.find(c => c._id === id); // Use _id from MongoDB
}

// --- NEW HELPER FUNCTION ---
// This function builds the HTML for all the club cards.
// It's the "renderer".
function renderClubs() {
    const clubsGrid = document.getElementById('clubsGrid');
    clubsGrid.innerHTML = ''; // Clear the grid

    if (filteredClubs.length === 0) {
        clubsGrid.innerHTML = '<p>No clubs found matching your criteria.</p>';
        document.getElementById('clubsCount').textContent = '0 clubs found';
        return;
    }

    filteredClubs.forEach(club => {
        const card = document.createElement('div');
        card.className = 'club-card';
        card.setAttribute('data-club-id', club._id); // Use MongoDB _id
        card.setAttribute('data-club-category', club.category);

        // We are just building the *exact* same HTML you had before
        card.innerHTML = `
            <div class="club-header">
                <h2 class="club-name">${club.name}</h2>
                <span class="club-category-badge">${club.category}</span>
            </div>
            <p class="club-description">${club.description}</p>
            
            <div class="club-info">
                <div class="club-info-item">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#2c3e7f" stroke-width="1.5"><rect x="2" y="2" width="16" height="16" rx="2"/><path d="M2 7h16"/><path d="M5 2v3"/><path d="M15 2v3"/></svg>
                    <span>${club.location || 'N/A'}</span>
                </div>
                <div class="club-info-item">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#2c3e7f" stroke-width="1.5"><circle cx="10" cy="10" r="8"/><path d="M10 6v4l3 2"/></svg>
                    <span>${club.meetingTime || 'TBD'}</span>
                </div>
            </div>

            <div class="club-stats">
                <div class="club-stat">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="#ff6b9d" stroke="#ff6b9d" stroke-width="1.5"><circle cx="7" cy="5" r="2.5"/><path d="M2 10c0-1.5 1.5-2.5 3.5-2.5s3.5 1 3.5 2.5v4c0 1 .5 1.5 1.5 1.5"/><circle cx="13" cy="5" r="2.5"/><path d="M8 10c0-1.5 1.5-2.5 3.5-2.5s3.5 1 3.5 2.5v4c0 1 .5 1.5 1.5 1.5"/></svg>
                    <span>${club.members} members</span>
                </div>
                <div class="club-stat">
                    <span>${club.applicants} applicants</span>
                </div>
            </div>

            <button class="view-club-btn">View Club Info</button>
        `;
        
        // Add the click event listener to the button
        card.querySelector('.view-club-btn').addEventListener('click', () => openClubInfoModal(club._id));

        clubsGrid.appendChild(card);
    });

    // Update the count
    document.getElementById('clubsCount').textContent = filteredClubs.length + ' clubs found';
}

// --- MODIFIED ---
// This function is now perfect. It uses the `getClubById` which
// pulls from our new dynamic `allClubsData`. No changes needed
// except to handle the MongoDB `_id` and new fields.
function openClubInfoModal(clubId) {
    currentClubId = clubId;
    const club = getClubById(clubId);
    if (!club) return;

    // === NEW LOGIC: CHECK STATUS ===
    const isApplied = myClubApplications.includes(clubId);
    
    let actionButton = '';
    if (isApplied) {
        // Green "Applied" Button
        actionButton = `
            <button type="button" disabled style="background:#ecfdf5; color:#047857; border:1px solid #10b981; padding:10px 18px; border-radius:6px; cursor:default; font-weight:600;">
                ✓ Application Submitted
            </button>`;
    } else {
        // Normal Blue "Application" Button
        actionButton = `
            <button type="button" class="learn-more-btn" style="background:#2c3e7f;color:#fff;padding:10px 18px;border-radius:6px;border:0;cursor:pointer;" onclick="openClubApplicationModal('${clubId}')">
                Application
            </button>`;
    }
    // ===============================

    const container = document.getElementById('clubInfoContent');
    container.innerHTML = `
        <h2 style="color:#2c3e7f;margin-bottom:8px;">${club.name}</h2>
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:16px;color:#666;font-size:14px;">
            <span>${club.category}</span>
            <span>•</span>
            <span>${club.members} members</span>
        </div>
        <h3 style="color:#2c3e7f;margin-top:20px;margin-bottom:12px;font-size:16px;">About the Club</h3>
        <p style="color:#666;line-height:1.6;margin-bottom:20px;">${club.aboutClub}</p>
        <h3 style="color:#2c3e7f;margin-top:20px;margin-bottom:12px;font-size:16px;">Club Information</h3>
        <div style="background:#f9f9f9;padding:16px;border-radius:8px;margin-bottom:20px;">
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
                <div>
                    <div style="font-weight:600;color:#2c3e7f;margin-bottom:4px;">Location</div>
                    <div style="color:#666;">${club.location}</div>
                </div>
                <div>
                    <div style="font-weight:600;color:#2c3e7f;margin-bottom:4px;">Meeting Time</div>
                    <div style="color:#666;">${club.meetingTime}</div>
                </div>
            </div>
        </div>
        <div style="display:flex;justify-content:flex-end;gap:10px;margin-top:20px;">
            <button type="button" class="learn-more-btn" style="background:#fff;color:#333;border:1px solid #e8e8e8;padding:10px 18px;border-radius:6px;" onclick="closeClubInfoModal()">Cancel</button>
            ${actionButton} </div>
    `;

    const modal = document.getElementById('clubInfoModal');
    modal.setAttribute('aria-hidden', 'false');
    modal.classList.add('open');
    }

function closeClubInfoModal() {
    const modal = document.getElementById('clubInfoModal');
    modal.setAttribute('aria-hidden', 'true');
    modal.classList.remove('open');
}

// --- MODIFIED --- (Just changed clubId to be a string `_id`)
function openClubApplicationModal(clubId) {
    currentClubId = clubId;
    const club = getClubById(clubId);
    if (!club) return;
    document.getElementById('applicationClubName').textContent = club.name;
    const modal = document.getElementById('clubApplicationModal');
    modal.setAttribute('aria-hidden', 'false');
    modal.classList.add('open');
    // ... (rest of your modal code is fine) ...
}

function closeClubApplicationModal() {
    const modal = document.getElementById('clubApplicationModal');
    modal.setAttribute('aria-hidden', 'true');
    modal.classList.remove('open');
    document.getElementById('clubApplicationForm').reset();
}

// --- ADD THESE MISSING HELPER FUNCTIONS ---

function toggleCategoryDropdown() {
    const dropdown = document.getElementById('categoryDropdown');
    dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
}

function toggleSortMenu() {
    const sortMenu = document.getElementById('sortContainer');
    const sortBtn = document.getElementById('sortDisplay'); // The text button
    
    // Toggle visibility
    const isHidden = sortMenu.style.display === 'none';
    sortMenu.style.display = isHidden ? 'block' : 'none';

    if (isHidden) {
        // === FIX: Align to the RIGHT instead of the Left ===
        sortMenu.style.left = 'auto'; 
        sortMenu.style.right = '0px'; // Flush with the right edge of the container
        
        // Position it just below the button
        // (You can adjust the +5 if you want more/less gap)
        sortMenu.style.top = (sortBtn.offsetTop + sortBtn.offsetHeight + 8) + 'px';
    }
}
// --- THIS IS THE MOST IMPORTANT CHANGE ---
// We modify your form submit listener to send data to the
// backend instead of localStorage.
async function handleApplicationSubmit(e) {
    e.preventDefault();

    // 1. Get the Student ID
    const currentStudentId = localStorage.getItem('currentStudentId');

    if (!currentStudentId) {
        alert("Please submit a counseling form first to set your Student ID (Simulation Mode).");
        return;
    }

    // 2. Collect Form Data
    const formData = {
        clubId: currentClubId,
        studentId: currentStudentId,
        fullName: document.getElementById('appFullName').value,
        year: document.getElementById('appYear').value,
        motive: document.getElementById('appMotive').value,
        program: document.getElementById('appProgram').value,
        email: document.getElementById('appEmail').value,
        experience: document.getElementById('appExperience').value,
    };

    try {
        // 3. Send to Backend
        const response = await fetch('http://localhost:3001/api/applications', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });

        // === THIS IS THE CRITICAL PART: READ ONCE ===
        const result = await response.json(); 
        // ============================================

        // 4. Handle Errors (using the data we just read)
        if (!response.ok) {
            throw new Error(result.message || 'Server error');
        }

        // 5. Update "My Applications" List (So the button turns Green)
        if (!myClubApplications.includes(currentClubId)) {
            myClubApplications.push(currentClubId);
        }

        // 6. Success UI Updates
        alert('Application submitted successfully!');
        
        closeClubApplicationModal();
        
        // Refresh the Info Modal to show "Application Submitted" status
        openClubInfoModal(currentClubId);
        
        // Update the club card stats on the main grid (increment applicants)
        // (Optional: Ideally we re-fetch all clubs to get the official count from DB)
        fetchAndInitializeClubs();

    } catch (error) {
        console.error('Error submitting application:', error);
        alert(error.message); // Show the specific error (e.g. "Already applied")
    }
}

// --- MODIFIED --- (Filter/Sort)
// Your search/filter/sort logic was good, but it was tied to the
// DOM. This new version is "data-first".
// --- REPLACE your main searchAndFilterClubs function with this ---
// --- UPDATED SEARCH LOGIC (Includes Category) ---
function searchAndFilterClubs() {
    const searchQuery = document.getElementById('clubsSearchInput').value.toLowerCase();

    // 1. Filter by Dropdown Category (The button menu)
    let clubsToFilter = allClubsData;
    if (currentCategory !== 'All') {
        clubsToFilter = allClubsData.filter(club => club.category === currentCategory);
    }

    // 2. Filter by Search Bar (The typing input)
    if (searchQuery) {
        clubsToFilter = clubsToFilter.filter(club =>
            // Check Name
            club.name.toLowerCase().includes(searchQuery) ||
            // Check Description
            club.description.toLowerCase().includes(searchQuery) ||
            // === NEW: Check Category ===
            club.category.toLowerCase().includes(searchQuery)
        );
    }
    
    // 3. Sort the results
    if (currentSortBy === 'newest') {
        clubsToFilter.sort((a, b) => new Date(b.createdDate) - new Date(a.createdDate));
    } else if (currentSortBy === 'oldest') {
        clubsToFilter.sort((a, b) => new Date(a.createdDate) - new Date(b.createdDate));
    } else if (currentSortBy === 'alphabetical') {
        clubsToFilter.sort((a, b) => a.name.localeCompare(b.name));
    } else if (currentSortBy === 'most-members') {
        clubsToFilter.sort((a, b) => b.members - a.members);
    } else if (currentSortBy === 'fewest-members') {
        clubsToFilter.sort((a, b) => a.members - b.members);
    }

    // 4. Save and Render
    filteredClubs = clubsToFilter;
    renderClubs();
}

// --- MODIFIED ---
// We keep your functions, but just make them call our new `searchAndFilterClubs`
function filterByCategory(category) {
    currentCategory = category;
    
    // Update the button text
    const filterBtn = document.getElementById('categoryFilterBtn');
    filterBtn.innerHTML = `${category} <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M13 6l-5 5-5-5"/></svg>`;
    
    // Hide the menu
    document.getElementById('categoryDropdown').style.display = 'none';
    
    // Re-run the search!
    searchAndFilterClubs();
}

function sortClubs(sortBy) {
    currentSortBy = sortBy;
    const sortDisplay = document.getElementById('sortDisplay');
    
    // This object maps the key to the display text
    const sortLabels = {
        'newest': 'Newest',
        'oldest': 'Oldest', // We'll add this logic next
        'alphabetical': 'Alphabetical'
        // You can add 'most-members' and 'fewest-members' here too
    };
    
    // Update the button text
    sortDisplay.textContent = sortLabels[sortBy];
    
    // Hide the menu
    document.getElementById('sortContainer').style.display = 'none';
    
    // Re-run the search!
    searchAndFilterClubs();
}

// --- NEW FUNCTION ---
// This is the main "waiter" function that starts everything.
async function fetchAndInitializeClubs() {
    try {
        // 1. Fetch Clubs
        const response = await fetch('http://localhost:3001/api/clubs');
        if (!response.ok) throw new Error('Network response was not ok');
        allClubsData = await response.json();

        // 2. Fetch My Applications (If logged in)
        const studentId = localStorage.getItem('currentStudentId');
        if (studentId) {
            try {
                const appResponse = await fetch(`http://localhost:3001/api/applications/my-applications/${studentId}`);
                const appData = await appResponse.json();
                // Save just the Club IDs to our list
                myClubApplications = appData.map(app => app.clubId);
            } catch (err) {
                console.warn("Could not fetch applications", err);
            }
        }
        
        // 3. Render
        searchAndFilterClubs();

    } catch (error) {
        console.error('Failed to fetch clubs:', error);
        document.getElementById('clubsGrid').innerHTML = '<p>Error loading clubs. Please try refreshing.</p>';
    }
}

// --- MODIFIED ---
// This is the "on switch" for the entire page.


/* ============================================
   MODAL HELPER FUNCTIONS
   ============================================ */

// This is the function your "x" and "Back" buttons call
function closeEventDetailModal() {
    const modal = document.getElementById('eventDetailModal');
    if (modal) {
        modal.setAttribute('aria-hidden', 'true');
        modal.classList.remove('open');
    }
}

// This is the function your "Register Now" button calls
function openRegistrationModal(id, title) {
    // If triggered from a button event, stop it from bubbling up
    if (event) event.stopPropagation(); 

    const modal = document.getElementById('registrationModal');
    const messageEl = document.getElementById('registrationEventName');
    
    if (modal && messageEl) {
        messageEl.innerHTML = `Are you sure you want to register for <strong>${title}</strong>?`;
        
        // Store ID on the modal itself to retrieve later
        modal.dataset.eventId = id;
        modal.dataset.eventTitle = title;
        
        modal.setAttribute('aria-hidden', 'false');
        modal.classList.add('open');
    } else {
        console.error("Registration modal elements not found in HTML");
    }
}

async function confirmRegistration() {
    const modal = document.getElementById('registrationModal');
    const eventId = modal.dataset.eventId;
    const eventTitle = modal.dataset.eventTitle;
    
    // Get Real Student ID
    const studentId = localStorage.getItem('currentStudentId');

    if (!studentId) {
        alert("You must fill out a counseling form first to set your Student ID (Simulation Mode).");
        return;
    }

    try {
        const response = await fetch('http://localhost:3001/api/registrations', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                eventId: eventId,
                eventTitle: eventTitle,
                studentId: studentId
            })
        });

        const data = await response.json();

        if (!response.ok) { 
            throw new Error(data.message || 'Server error'); 
        }

        alert('Registration successful! Your registration has been confirmed.');
        
        closeRegistrationModal();
        
        // If the "Event Detail Modal" is open, close it too
        const detailModal = document.getElementById('eventDetailModal');
        if (detailModal && detailModal.classList.contains('open')) {
            closeEventDetailModal();
        }
        
        // REFRESH THE PAGE DATA so the button turns green immediately
        fetchAndInitializeEvents(); 

    } catch (error) {
        console.error('Error submitting registration:', error);
        alert(error.message); 
    }
}

// This is the function your "Cancel" button (in the 2nd modal) calls
function closeRegistrationModal() {
    const modal = document.getElementById('registrationModal');
    if (modal) {
        modal.setAttribute('aria-hidden', 'true');
        modal.classList.remove('open');
    }
}

// This is a helper for modal accessibility (you had this before)
function handleModalKeydown(event) {
    if (event.key === 'Escape') {
        closeEventDetailModal();
        closeRegistrationModal();
        // You can add your other modal-closing functions here
    }
}

// (Keep all your other functions like toggleCategoryDropdown, toggleSortMenu, etc.)


/* ============================================
   OJT PAGE LOGIC (The Missing Piece)
   ============================================ */

// Global OJT Variables
let allOjtData = [];
let myOjtApplications = [];
let currentOJTCategory = 'All';
let currentOJTSortBy = 'newest';

// --- 1. MAIN FETCH FUNCTION ---
async function fetchAndInitializeOJT() {
    try {
        // Fetch Listings
        const response = await fetch('http://localhost:3001/api/ojt');
        allOjtData = await response.json();

        // Fetch My Applications (If logged in)
        const studentId = localStorage.getItem('currentStudentId');
        if (studentId) {
            try {
                const appRes = await fetch(`http://localhost:3001/api/ojt/my-applications/${studentId}`);
                const appIds = await appRes.json();
                myOjtApplications = appIds;
            } catch (err) {
                console.warn("Could not fetch OJT applications", err);
            }
        }

        // Render
        searchAndFilterOJT();
        
        
    } catch (error) {
        console.error("Error loading OJT data:", error);
        const grid = document.getElementById('ojtGrid');
        if(grid) grid.innerHTML = '<p style="padding:20px; text-align:center;">Error loading listings. Is the server running?</p>';
    }
}

// --- 2. HELPER: GET OJT BY ID ---
function getOJTById(id) {
    return allOjtData.find(o => o._id === id);
}

// --- 3. RENDER & FILTER FUNCTION ---
/* ============================================
   ALGORITHM: CONTENT-BASED FILTERING
   ============================================ */
function searchAndFilterOJT() {
    const searchQuery = document.getElementById('ojtSearchInput').value.toLowerCase();
    const ojtGrid = document.getElementById('ojtGrid');
    ojtGrid.innerHTML = ''; 

    // 1. CALCULATE USER INTERESTS (For Recommendations)
    // Find jobs I applied to
    const appliedJobs = allOjtData.filter(job => myOjtApplications.includes(job._id));
    // Get their subcategories
    let myInterests = appliedJobs.map(j => j.subCategory);
    // Add related categories from the map
    myInterests.forEach(interest => {
        if (jobRelationships[interest]) {
            myInterests.push(...jobRelationships[interest]);
        }
    });

    // 2. FILTER LIST (Standard Logic)
    let visibleOJT = allOjtData.filter(ojt => {
        const matchesCategory = currentOJTCategory === 'All' || ojt.category === currentOJTCategory;
        const matchesSearch = !searchQuery || 
            ojt.position.toLowerCase().includes(searchQuery) || 
            ojt.company.toLowerCase().includes(searchQuery);
        
        // Mark if this specific job is recommended
        // Logic: Matches my interests AND I haven't applied yet
        ojt.isRecommended = myInterests.includes(ojt.subCategory) && !myOjtApplications.includes(ojt._id);

        return matchesCategory && matchesSearch;
    });

    // 3. SORT LIST (Prioritize Recommendations)
    visibleOJT.sort((a, b) => {
        // Rule A: Recommended items go to the TOP
        if (a.isRecommended && !b.isRecommended) return -1;
        if (!a.isRecommended && b.isRecommended) return 1;

        // Rule B: Then respect the user's chosen sort (Pay, Hours, etc)
        if (currentOJTSortBy === 'pay-high') return b.payPerHour - a.payPerHour;
        if (currentOJTSortBy === 'pay-low') return a.payPerHour - b.payPerHour;
        if (currentOJTSortBy === 'hours') return a.hoursPerWeek - b.hoursPerWeek;
        
        // Default: Newest first
        return new Date(b.postedAt) - new Date(a.postedAt);
    });

    // 4. RENDER HTML
    if (visibleOJT.length === 0) {
        ojtGrid.innerHTML = '<p style="grid-column: 1/-1; text-align:center; color:#666;">No training opportunities found.</p>';
        return;
    }

    visibleOJT.forEach(ojt => {
        const daysAgo = Math.floor((new Date() - new Date(ojt.postedAt)) / (1000 * 60 * 60 * 24));
        const postedText = daysAgo === 0 ? "Today" : `${daysAgo} days ago`;

        // Generate Badges
        const subCatHTML = ojt.subCategory ? `<span class="club-subcategory-badge">${ojt.subCategory}</span>` : '';
        
        // === NEW: Generate Recommended Badge ===
        const recommendedHTML = ojt.isRecommended 
            ? `<div class="recommended-badge">Recommended</div>` 
            : '';
        
        // Apply a subtle highlight style to the card container if recommended
        const highlightStyle = ojt.isRecommended ? 'border: 1px solid #8b5cf6; background-color: #fbfaff;' : '';

        const card = document.createElement('div');
        card.className = 'club-card';
        card.style.cssText = highlightStyle; // Apply highlight

        card.innerHTML = `
            ${recommendedHTML}

            <div class="club-header">
                <h2 class="club-name">${ojt.position}</h2>
                <div class="club-badges">
                    ${subCatHTML}
                    <span class="club-category-badge">${ojt.category}</span>
                </div>
            </div>
            
            <p class="club-description">${ojt.description}</p>

            <div class="club-info">
                <div class="club-info-item">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#2c3e7f" stroke-width="1.5"><path d="M3 8h14v8a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V8z"/></svg>
                    <span>${ojt.company}</span>
                </div>
                <div class="club-info-item">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#2c3e7f" stroke-width="1.5"><circle cx="10" cy="10" r="8"/><path d="M10 6v4l3 2"/></svg>
                    <span>Posted ${postedText}</span>
                </div>
            </div>

            <div class="club-stats">
                <div class="club-stat"><strong>₱</strong> ${ojt.payPerHour}/hour</div>
                <div class="club-stat">${ojt.workArrangement}</div>
                <div class="club-stat">${ojt.duration} weeks</div>
                <div class="club-stat">${ojt.hoursPerWeek} hrs/week</div>
            </div>

            <button class="view-club-btn">View Company Info</button>
        `;

        card.querySelector('.view-club-btn').addEventListener('click', () => openOJTCompanyModal(ojt._id));
        ojtGrid.appendChild(card);
    });

    // Update count
    document.getElementById('ojtCount').textContent = `${visibleOJT.length} training opportunities found`;
}

/* ============================================
   RECOMMENDATION ALGORITHM
   ============================================ */

// 1. THE RELATIONSHIP MAP
// This defines what is related to what.
// Key = The SubCategory the student applied to
// Value = Array of related SubCategories they might like
const jobRelationships = {
    // Technology Connections
    'Web Development': ['Design', 'Marketing', 'IT Operations'],
    'Software Engineering': ['Data Science', 'Project Management', 'Web Development'],
    'IT Operations': ['Telecommunications', 'Cyber Security', 'Web Development'],
    'Cyber Security': ['IT Operations', 'Telecommunications'],
    
    // Business Connections
    'Marketing': ['Design', 'Business Development', 'Web Development'],
    'Business Development': ['Marketing', 'Finance'],
    
    // Engineering Connections
    'Telecommunications': ['IT Operations', 'Electronics'],
    
    // Finance/Admin
    'Financial Analysis': ['Audit & Tax', 'Data Science'],
    'Audit & Tax': ['Financial Analysis']
};

// 2. THE ENGINE
function updateRecommendations() {
    const recSection = document.getElementById('recommendationSection');
    const recGrid = document.getElementById('recommendedGrid');
    
    // A. Get the jobs the student has ALREADY applied to
    // We look at 'allOjtData' and find items where the ID is in 'myOjtApplications'
    const appliedJobs = allOjtData.filter(job => myOjtApplications.includes(job._id));

    // If no applications, hide the section
    if (appliedJobs.length === 0) {
        recSection.style.display = 'none';
        return;
    }

    // B. Determine user interests
    // Extract all SubCategories from jobs they applied to
    const userInterests = appliedJobs.map(job => job.subCategory);
    
    // C. Find Related Categories
    let targetCategories = [];
    userInterests.forEach(interest => {
        // Add the interest itself (e.g., show more Web Dev)
        targetCategories.push(interest);
        
        // Add related interests from our map (e.g., show Design)
        if (jobRelationships[interest]) {
            targetCategories.push(...jobRelationships[interest]);
        }
    });

    // D. Filter the Database
    const recommendedJobs = allOjtData.filter(job => {
        // 1. Must match one of the target categories
        const isRelated = targetCategories.includes(job.subCategory);
        // 2. Must NOT be already applied to
        const notApplied = !myOjtApplications.includes(job._id);
        
        return isRelated && notApplied;
    }).slice(0, 3); // Limit to top 3 recommendations

    // E. Render or Hide
    if (recommendedJobs.length === 0) {
        recSection.style.display = 'none';
    } else {
        recSection.style.display = 'block';
        renderRecommendationCards(recommendedJobs, recGrid);
    }
}

// 3. RENDERER (Mini Cards)
function renderRecommendationCards(jobs, container) {
    container.innerHTML = '';
    
    jobs.forEach(ojt => {
        const card = document.createElement('div');
        card.className = 'club-card';
        card.style.marginBottom = '0'; // Reset margin for nested grid
        card.style.background = '#fff'; 
        
        card.innerHTML = `
            <div class="club-header">
                <h2 class="club-name" style="font-size:16px;">${ojt.position}</h2>
                <span class="club-subcategory-badge">${ojt.subCategory}</span>
            </div>
            <div class="club-info" style="margin-top:8px; margin-bottom:8px;">
                <div class="club-info-item">
                    <span style="font-size:12px; color:#64748b;">${ojt.company}</span>
                </div>
            </div>
            <button class="view-club-btn" style="padding:8px; font-size:12px;">View Details</button>
        `;
        
        card.querySelector('.view-club-btn').addEventListener('click', () => openOJTCompanyModal(ojt._id));
        container.appendChild(card);
    });
}



// --- 4. MODAL & APPLY LOGIC ---
function openOJTCompanyModal(ojtId) {
    const ojt = getOJTById(ojtId);
    if (!ojt) return;

    const container = document.getElementById('ojtCompanyContent');
    const isApplied = myOjtApplications.includes(ojt._id);

    // Button Logic
    let applyButton = '';
    if (isApplied) {
        applyButton = `<button disabled style="background:#ecfdf5; color:#047857; border:1px solid #10b981; padding:10px 18px; border-radius:6px; font-weight:600;">✓ Applied</button>`;
    } else {
        applyButton = `<button class="learn-more-btn" style="background:#2c3e7f;color:#fff;padding:10px 18px;border-radius:6px;border:0;cursor:pointer;" onclick="applyToOJT('${ojt._id}')">Apply Now</button>`;
    }

    // Skills logic
    const skillsHTML = (ojt.skills && ojt.skills.length > 0) 
        ? ojt.skills.map(s => `<span style="background:#e8f0ff;color:#2c3e7f;padding:6px 12px;border-radius:20px;font-size:12px;">${s}</span>`).join('')
        : '<span>No specific skills listed</span>';

    // ============================================================
    // 🧠 THE RECOMMENDER ALGORITHM
    // Logic: "Show me jobs with same SubCategory, excluding this one"
    // ============================================================
    
    // 1. Filter
    const relatedJobs = allOjtData.filter(item => 
        item.subCategory === ojt.subCategory && // Match Sub-Category (e.g., Web Dev)
        item._id !== ojt._id // Don't recommend the job I'm currently looking at
    ).slice(0, 3); // Show max 3 related jobs

    // 2. Build HTML for Related Jobs
    let relatedJobsHTML = '';
    if (relatedJobs.length > 0) {
        const relatedItems = relatedJobs.map(job => `
            <div class="related-job-card" onclick="openOJTCompanyModal('${job._id}')">
                <div>
                    <div class="related-job-title">${job.position}</div>
                    <div class="related-job-company">${job.company}</div>
                </div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2c3e7f" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg>
            </div>
        `).join('');

        relatedJobsHTML = `
            <div class="related-jobs-container">
                <h3 style="color:#2c3e7f;font-size:14px;margin-bottom:10px;">
                    More in ${ojt.subCategory}
                </h3>
                ${relatedItems}
            </div>
        `;
    }
    // ============================================================

    // Render Main Modal
    container.innerHTML = `
        <h2 id="ojtCompanyTitle" style="color:#2c3e7f;margin-bottom:8px;">${ojt.position}</h2>
        
        <div style="margin-bottom:12px;">
            <span style="background:#f1f5f9; color:#475569; padding:4px 8px; border-radius:4px; font-size:11px; font-weight:600; text-transform:uppercase;">
                ${ojt.subCategory || ojt.category}
            </span>
        </div>

        <div style="display:flex;align-items:center;gap:8px;margin-bottom:20px;color:#666;font-size:14px;">
            <span>${ojt.company}</span> <span>•</span> <span>${ojt.location}</span>
        </div>

        <h3 style="color:#2c3e7f;font-size:16px;margin-bottom:10px;">Overview</h3>
        <p style="color:#666;margin-bottom:20px;">${ojt.overview}</p>
        
        <h3 style="color:#2c3e7f;font-size:16px;margin-bottom:10px;">Details</h3>
        <div style="background:#f9f9f9;padding:16px;border-radius:8px;margin-bottom:20px;">
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
                <div><div style="font-weight:600;color:#2c3e7f;margin-bottom:4px;">💰 Pay</div><div style="color:#666;">₱${ojt.payPerHour}/hour</div></div>
                <div><div style="font-weight:600;color:#2c3e7f;margin-bottom:4px;">📍 Mode</div><div style="color:#666;">${ojt.workArrangement}</div></div>
                <div><div style="font-weight:600;color:#2c3e7f;margin-bottom:4px;">⏱️ Duration</div><div style="color:#666;">${ojt.duration} weeks</div></div>
                <div><div style="font-weight:600;color:#2c3e7f;margin-bottom:4px;">🕐 Schedule</div><div style="color:#666;">${ojt.hoursPerWeek} hrs/week</div></div>
            </div>
        </div>

        <h3 style="color:#2c3e7f;font-size:16px;margin-bottom:10px;">Skills</h3>
        <div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:20px;">
            ${skillsHTML}
        </div>

        <div style="display:flex;justify-content:flex-end;gap:10px;margin-top:20px;">
            <button type="button" class="learn-more-btn" style="background:#fff;color:#333;border:1px solid #e8e8e8;padding:10px 18px;border-radius:6px;" onclick="closeOJTCompanyModal()">Close</button>
            ${applyButton}
        </div>

        ${relatedJobsHTML}
    `;

    const modal = document.getElementById('ojtCompanyModal');
    modal.setAttribute('aria-hidden', 'false');
    modal.classList.add('open');
}

function closeOJTCompanyModal() {
    const modal = document.getElementById('ojtCompanyModal');
    if (modal) {
        modal.setAttribute('aria-hidden', 'true');
        modal.classList.remove('open');
    }
}

// --- 5. APPLICATION ACTION ---
async function applyToOJT(ojtId) {
    const studentId = localStorage.getItem('currentStudentId');
    if (!studentId) {
        alert("Please submit a counseling form first to set your Student ID (Simulation Mode).");
        return;
    }

    try {
        const res = await fetch('http://localhost:3001/api/ojt/apply', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ojtId, studentId })
        });

        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.message);
        }

        alert("Application submitted successfully!");
        myOjtApplications.push(ojtId); // Update local list
        openOJTCompanyModal(ojtId); // Re-render modal to show "Applied"

        updateRecommendations();

    } catch (error) {
        alert(error.message);
    }
}

// --- 6. DROPDOWN & SORT HELPERS ---
function toggleOJTCategoryDropdown() {
    const dropdown = document.getElementById('ojtCategoryDropdown');
    dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
}

function toggleOJTSortMenu() {
    const sortMenu = document.getElementById('ojtSortContainer');
    const sortBtn = document.getElementById('ojtSortDisplay'); // Make sure this ID exists in HTML
    
    // Fix position
    if (sortBtn) {
        sortMenu.style.left = 'auto';
        sortMenu.style.right = '0px';
        sortMenu.style.top = (sortBtn.offsetTop + sortBtn.offsetHeight + 8) + 'px';
    }
    
    sortMenu.style.display = sortMenu.style.display === 'none' ? 'block' : 'none';
}

function filterOJTByCategory(category) {
    currentOJTCategory = category;
    document.getElementById('ojtCategoryFilterBtn').innerText = category + ' '; // Update button text
    document.getElementById('ojtCategoryDropdown').style.display = 'none';
    searchAndFilterOJT();
}

function sortOJT(sortBy) {
    currentOJTSortBy = sortBy;
    const sortDisplay = document.getElementById('ojtSortDisplay');
    
    const sortLabels = {
        'newest': 'Newest',
        'pay-high': 'Pay: High to Low',
        'pay-low': 'Pay: Low to High',
        'hours': 'Hours per Week'
    };
    
    if(sortDisplay) sortDisplay.textContent = sortLabels[sortBy];
    document.getElementById('ojtSortContainer').style.display = 'none';
    searchAndFilterOJT();
}



/* ============================================
   MAIN INITIALIZATION (THE TRAFFIC CONTROLLER)
   ============================================ */
document.addEventListener('DOMContentLoaded', async () => {
    
    const currentPage = window.location.pathname.split('/').pop(); // Get "ojt.html"
    const navLinks = document.querySelectorAll('.sidebar-nav .nav-item');

    navLinks.forEach(link => {
        // Remove 'active' from everyone first
        link.classList.remove('active');
        
        // Check if this link matches the current page
        if (link.getAttribute('href') === currentPage) {
            link.classList.add('active');
        }
    });

    // --- 1. GLOBAL SETUP (Runs on every page) ---
    const studentId = localStorage.getItem('currentStudentId');
    if (!studentId) {
        console.log("No Student ID found. Simulation mode active.");
    }

    // --- 2. PAGE SPECIFIC LOGIC ---

    // === CASE A: OJT LISTING PAGE ===
    if (document.getElementById('ojtGrid')) {
        console.log("Page: OJT Listings");
        fetchAndInitializeOJT();
        
        const ojtSearch = document.getElementById('ojtSearchInput');
        if (ojtSearch) {
            ojtSearch.addEventListener('keyup', searchAndFilterOJT);
        }
    }

    // === CASE B: CLUB ORGANIZATION PAGE ===
    else if (document.getElementById('clubsGrid')) {
        console.log("Page: Club Organization");
        fetchAndInitializeClubs();
        
        const clubSearch = document.getElementById('clubsSearchInput');
        if (clubSearch) {
            clubSearch.addEventListener('keyup', searchAndFilterClubs);
        }
        
        const clubForm = document.getElementById('clubApplicationForm');
        if (clubForm) {
            clubForm.addEventListener('submit', handleApplicationSubmit);
        }
    }

    // === CASE C: EVENT SERVICES PAGE ===
    else if (document.getElementById('upcoming')) {
        console.log("Page: Event Services");
        fetchAndInitializeEvents(); // This handles events, calendar, and notifications
    }

    // === CASE D: COUNSELING PAGE ===
    else if (document.getElementById('requestForm')) {
        console.log("Page: Counseling Unit");
        
        // 1. Load Announcements
        fetchAndRenderAnnouncements();

        // 2. Form Submission Handler
        const requestForm = document.getElementById('requestForm');
        if (requestForm) {
            requestForm.addEventListener('submit', handleRequestFormSubmit);
        }

        // 3. Input Validation Listeners (Regex for cleaner inputs)
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

        // 4. My Sessions Search Listener
        const sessionsSearch = document.getElementById('sessionsSearch');
        if (sessionsSearch) {
            sessionsSearch.addEventListener('input', function() {
                const activeTabBtn = document.querySelector('#sessionsModal .tab-btn.active');
                const activeTabName = activeTabBtn ? activeTabBtn.getAttribute('onclick').match(/'([^']+)'/)[1] : 'pending';
                renderSessionsList(activeTabName);
            });
        }

        // 5. Silent Session Fetch (To update badges/counts)
        if (studentId) {
            try {
                const response = await fetch(`http://localhost:3001/api/counseling/my-appointments/${studentId}`);
                if (response.ok) {
                    allStudentSessions = await response.json();
                    if (typeof updateTabCounts === 'function') updateTabCounts();
                }
            } catch (error) {
                console.warn("Silent session fetch failed (Backend might be offline):", error);
            }
        }
    }

    // === CASE E: HOMEPAGE ===
    else if (document.querySelector('.welcome-card')) {
        console.log("Page: Homepage");
        // Add any homepage specific logic here
    }

    // === GLOBAL HELPERS ===
    // Initialize global FAQ or Announcement lists if they appear on random pages
    if (document.getElementById('faqsList')) {
        if (typeof renderFAQs === 'function') renderFAQs();
        // If you renamed it to fetchAndRenderFAQs, use that instead
        if (typeof fetchAndRenderFAQs === 'function') fetchAndRenderFAQs(); 
    }
});
