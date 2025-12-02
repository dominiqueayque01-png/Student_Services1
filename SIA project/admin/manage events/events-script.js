// ========== EVENTS PAGE FUNCTIONALITY (DB INTEGRATED) ==========

// CONFIGURATION
const API_URL = 'http://localhost:3001/api/events';

// GLOBAL VARIABLES
let eventsData = [];        // Will hold Active and Archived
let eventRequestsData = []; // Will hold Pending
let currentEditingEventId = null;
let currentDeletingEventId = null;
let currentEventBanner = null; 

// --- 1. FETCH & INITIALIZE DATA ---
async function fetchEventsFromDB() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('Failed to fetch events');
        
        const rawData = await response.json();

        // Map MongoDB _id to id and sort data
        const allEvents = rawData.map(event => ({
            ...event,
            id: event._id,
            banner: event.imageUrl || 'https://placehold.co/'
        }));

        // SEPARATE DATA BASED ON STATUS
        // 1. Pending goes to "Requests"
        eventRequestsData = allEvents.filter(e => e.status === 'Pending');
        
        // 2. Active/Archived goes to "Manage Events" list
        eventsData = allEvents.filter(e => e.status === 'Active' || e.status === 'Archived');
        populateFilterDropdowns();
        renderEvents();

// --- POPULATE FILTERS DYNAMICALLY ---
function populateFilterDropdowns() {
    const statusSelect = document.getElementById('filter-status');
    const eventSelect = document.getElementById('filter-events');
    const orgSelect = document.getElementById('filter-organization');

    if (!eventSelect || !orgSelect) return;

    eventSelect.innerHTML = '<option value="">All Events</option>';
    orgSelect.innerHTML = '<option value="">All Organizations</option>';

    // 1. STATUSES (Hardcoded or Dynamic)
    // We usually want these specific options, so we ensure they exist
    if (statusSelect) {
        statusSelect.innerHTML = `
            <option value="">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Archived">Archived</option>
            <option value="Pending">Pending</option>
        `;
    }

    // 2. EVENTS (Extract Unique Titles)
    if (eventSelect) {
        // Get all titles from eventsData AND eventRequestsData
        const allEvents = [...eventsData, ...eventRequestsData];
        const uniqueTitles = [...new Set(allEvents.map(e => e.title))].sort();
        
        eventSelect.innerHTML = '<option value="">All Events</option>';
        uniqueTitles.forEach(title => {
            const option = document.createElement('option');
            option.value = title;
            option.textContent = title;
            eventSelect.appendChild(option);
        });
    }

    const uniqueOrgs = [...new Set(eventsData.map(e => e.organization))].sort();
    uniqueOrgs.forEach(org => {
        const option = document.createElement('option');
        option.value = org;
        option.textContent = org;
        orgSelect.appendChild(option);
    });

    // 3. ORGANIZATIONS (Extract Unique Organizers)
    if (orgSelect) {
        const allEvents = [...eventsData, ...eventRequestsData];
        const uniqueOrgs = [...new Set(allEvents.map(e => e.organization))].sort();

        orgSelect.innerHTML = '<option value="">All Organizations</option>';
        uniqueOrgs.forEach(org => {
            const option = document.createElement('option');
            option.value = org;
            option.textContent = org;
            orgSelect.appendChild(option);
        });
    }
}

        // Render both sections
        renderEvents();
        renderEventRequest();
        

    } catch (error) {
        console.error('Error loading events:', error);
        showSuccessNotification('Error connecting to database', 'error');
    }

    
}

// --- 2. RENDER EVENT REQUESTS (TOP SECTION) ---
// --- 1. RENDER DASHBOARD WIDGET (Newest Request Only) ---
function renderEventRequest() {
    const container = document.getElementById('event-request-container');
    const seeAllBtn = document.getElementById('btn-see-all-requests');
    const countBadge = document.getElementById('requests-count');
    
    if (!container) return;
    
    // Update Dashboard Badge
    if(countBadge) countBadge.textContent = eventRequestsData.length;

    // Handle Empty State
    if (eventRequestsData.length === 0) {
        container.innerHTML = '<div class="empty-state" style="margin:auto; color:#999; padding:20px;">No pending requests</div>';
        if(seeAllBtn) seeAllBtn.style.display = 'none';
        return;
    }
    
    // Handle "See All" Button Visibility
    if(seeAllBtn) {
        seeAllBtn.style.display = 'block';
        // Ensure clean event listener
        const newBtn = seeAllBtn.cloneNode(true);
        seeAllBtn.parentNode.replaceChild(newBtn, seeAllBtn);
        
        newBtn.addEventListener('click', (e) => {
            e.preventDefault();
            openAllRequestsModal(); // <--- Calls the function below
        });
    }

    // Show ONLY the first (newest) request as a preview
    const request = eventRequestsData[0]; 
    const dateStr = request.createdAt ? new Date(request.createdAt).toLocaleDateString() : 'N/A';

    container.innerHTML = `
        <div class="request-content">
            <h4 class="request-title">${request.title}</h4>
                <p class="request-description">${request.description || request.about || 'No description provided.'}</p>            <div class="request-meta">
                <span>📋 ${request.organization}</span>
                <span>📅 ${dateStr}</span>
            </div>
            <span class="request-badge">${request.category}</span>
        </div>
        <div class="request-actions">
            <button class="btn-view-request" onclick="viewEventRequest('${request.id}')">View</button>
            <button class="btn-approve-request" onclick="approveEventRequest('${request.id}')">Approve</button>
            <button class="btn-reject-request" onclick="openRejectEventModal('${request.id}')">Reject</button>
        </div>
    `;
}

// --- 2. OPEN "SEE ALL" MODAL ---
// --- OPEN MODAL & POPULATE LIST ---
window.openAllRequestsModal = function() {
    const modal = document.getElementById('all-requests-modal');
    const listContainer = document.getElementById('requests-list-container');
    const modalBadge = document.getElementById('all-requests-count');
    
    if(!modal || !listContainer) return;

    // Update Badge inside modal
    if(modalBadge) modalBadge.textContent = eventRequestsData.length;

    // Clear previous list
    listContainer.innerHTML = ''; 

    // Render the list
    renderRequestListItems(eventRequestsData);

    // Show Modal
    modal.style.display = 'flex';
    
    // Populate the "Organizer" dropdown inside the modal
    populateRequestFilters();
}

// --- HELPER: RENDER LIST ITEMS ---
function renderRequestListItems(data) {
    const listContainer = document.getElementById('requests-list-container');
    listContainer.innerHTML = '';

    if (data.length === 0) {
        listContainer.innerHTML = '<p style="text-align:center; padding:20px; color:#999;">No requests found.</p>';
        return;
    }

    data.forEach(request => {
        const dateStr = request.createdAt ? new Date(request.createdAt).toLocaleDateString() : 'N/A';
        
        // Create the card using your 'request-item' style
        const item = document.createElement('div');
        item.className = 'request-item'; // Assumes you have CSS for this class
        item.style.cssText = "background: white; padding: 15px; border: 1px solid #e0e0e0; border-radius: 8px; margin-bottom: 10px; display: flex; gap: 15px; align-items: flex-start;";

        item.innerHTML = `
            <div class="request-item-content" style="flex: 1;">
                <h4 class="request-item-title" style="margin: 0 0 5px 0; font-size: 15px; font-weight:700;">${request.title}</h4>
                <div class="request-item-meta" style="font-size: 12px; color: #666; margin-bottom:5px;">
                    <span>📋 ${request.organization}</span>
                    <span style="margin-left:10px;">📅 ${dateStr}</span>
                </div>
                <span class="request-item-badge" style="background:#f0f0f0; padding:2px 8px; border-radius:4px; font-size:11px;">${request.category}</span>
            </div>
            
            <div class="request-item-actions" style="display: flex; gap: 5px; flex-direction:column;">
                <button class="btn-approve" style="padding: 6px 12px; font-size: 11px; background:#2d5aa8; color:white; border:none; border-radius:4px; cursor:pointer;" onclick="approveAndClose('${request.id}')">Approve</button>
                <button class="btn-reject" style="padding: 6px 12px; font-size: 11px; background:#d32f2f; color:white; border:none; border-radius:4px; cursor:pointer;" onclick="rejectAndClose('${request.id}')">Reject</button>
                <button class="btn-view" style="padding: 6px 12px; font-size: 11px; background:white; color:#333; border:1px solid #ddd; border-radius:4px; cursor:pointer;" onclick="viewEventRequest('${request.id}')">View</button>
            </div>
        `;
        listContainer.appendChild(item);
    });
}

// --- CLOSE FUNCTION ---
window.closeAllRequestsModal = function() {
    const modal = document.getElementById('all-requests-modal');
    if (modal) modal.style.display = 'none';
}

// --- ACTION HANDLERS ---
window.approveAndClose = async function(id) {
    await approveEventRequest(id);
    // Re-open/Refresh the modal after approval so the list updates
    openAllRequestsModal(); 
}

window.rejectAndClose = function(id) {
    // Hide list modal, show reject reason modal
    closeAllRequestsModal();
    openRejectEventModal(id);
}

// Helpers to handle actions inside the modal
window.approveAndClose = async function(id) {
    await approveEventRequest(id);
    openAllRequestsModal(); // Refresh the list inside the modal
}

window.rejectAndClose = function(id) {
    // Hide "All Requests" modal temporarily so we can see the "Reject Reason" modal
    document.getElementById('all-requests-modal').style.display = 'none';
    openRejectEventModal(id);
}

// --- 3. APPROVE REQUEST (PATCH STATUS -> ACTIVE) ---
async function approveEventRequest(requestId) {
    try {
        const response = await fetch(`${API_URL}/${requestId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'Active' })
        });

        if (response.ok) {
            showSuccessNotification('Event Approved Successfully!');
            fetchEventsFromDB(); // Refresh all lists
            
            // Close modal if open
            const modal = document.getElementById('all-requests-modal');
            const viewModal = document.getElementById('event-view-modal');
            if (modal) modal.style.display = 'none';
            if (viewModal) viewModal.style.display = 'none';
        } else {
            showSuccessNotification('Failed to approve event', 'error');
        }
    } catch (error) {
        console.error(error);
        showSuccessNotification('Network Error', 'error');
    }
}

// --- 4. REJECT REQUEST (PATCH STATUS -> REJECTED) ---
async function confirmRejectEventRequest() {
    if (!window.currentRejectingRequestId) return;
    
    const reason = document.getElementById('rejection-reason')?.value.trim();
    if (!reason) {
        showSuccessNotification('Please provide a rejection reason', 'error');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/${window.currentRejectingRequestId}`, {
            method: 'PATCH', // We update status to Rejected instead of deleting, to keep records
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                status: 'Rejected',
                rejectionReason: reason
            })
        });

        if (response.ok) {
            showSuccessNotification('Event Rejected');
            document.getElementById('reject-event-modal').style.display = 'none';
            document.getElementById('event-view-modal').style.display = 'none';
            fetchEventsFromDB();
        } else {
            showSuccessNotification('Failed to reject event', 'error');
        }
    } catch (error) {
        console.error(error);
        showSuccessNotification('Network Error', 'error');
    }
}

// --- 5. RENDER MAIN EVENTS LIST (FIXED WITH FILTERS) ---
// --- RENDER EVENTS WITH FILTERS ---
function renderEvents() {
    const activeEventsGrid = document.getElementById('active-events');
    const archivedEventsGrid = document.getElementById('archived-events');
    
    if (!activeEventsGrid || !archivedEventsGrid) return;

    // 1. GET FILTER VALUES
    const searchTerm = document.getElementById('event-search')?.value.toLowerCase().trim() || '';
    const statusFilter = document.getElementById('filter-status')?.value || ''; // "Active" or "Archived"
    const eventFilter = document.getElementById('filter-events')?.value || '';
    const orgFilter = document.getElementById('filter-organization')?.value || '';

    // 2. FILTER DATA
    const filteredList = eventsData.filter(e => {
        // Search Term (Check Title, Location, Organizer)
        const matchesSearch = !searchTerm || 
            (e.title || '').toLowerCase().includes(searchTerm) || 
            (e.location || '').toLowerCase().includes(searchTerm) || 
            (e.organization || '').toLowerCase().includes(searchTerm);

        // Dropdown Filters
        // If statusFilter is empty, show both. If set, match exact status.
        const matchesStatus = !statusFilter || e.status === statusFilter;
        const matchesTitle = !eventFilter || e.title === eventFilter;
        const matchesOrg = !orgFilter || e.organization === orgFilter;

        return matchesSearch && matchesStatus && matchesTitle && matchesOrg;
    });

    // 3. SEPARATE INTO COLUMNS
    const activeEvents = filteredList.filter(e => e.status === 'Active');
    const archivedEvents = filteredList.filter(e => e.status === 'Archived');

    // 4. UPDATE SECTION TITLES
    document.querySelector('.active-column .section-title').textContent = `Active Events (${activeEvents.length})`;
    document.querySelector('.archived-column .section-title').textContent = `Archived Events (${archivedEvents.length})`;

    // 5. RENDER ACTIVE GRID
    activeEventsGrid.innerHTML = '';
    if (activeEvents.length === 0) {
        activeEventsGrid.innerHTML = '<p style="text-align:center; padding:20px; color:#999;">No active events match filters.</p>';
    } else {
        activeEvents.forEach(e => activeEventsGrid.appendChild(createEventCard(e)));
    }

    // 6. RENDER ARCHIVED GRID
    archivedEventsGrid.innerHTML = '';
    if (archivedEvents.length === 0) {
        archivedEventsGrid.innerHTML = '<p style="text-align:center; padding:20px; color:#999;">No archived events match filters.</p>';
    } else {
        archivedEvents.forEach(e => archivedEventsGrid.appendChild(createEventCard(e)));
    }

    // Re-attach button listeners for the new cards
    attachEventCardListeners();
}

// Helper: Create Card HTML
function createEventCard(event) {
    const card = document.createElement('div');
    card.className = 'event-card';
    
    const registered = event.registered || 0;
    const capacityPercent = (registered / event.capacity) * 100;
    const btnText = event.status === 'Active' ? 'Archive' : 'Unarchive';

    card.innerHTML = `
        <div class="event-banner">
            <img src="${event.banner}" onerror="this.src='https://placehold.co/800x300'">
        </div>
        <div class="event-container">
            <div class="event-title-section">
                <h3 class="event-title">${event.title}</h3>
                <span class="event-category ${event.category}">${event.category}</span>
            </div>
            <p class="event-organization">${event.organization}</p>
            <div class="event-meta">
                <div class="event-meta-item"><span>📅 ${formatDate(event.date)}</span></div>
                <div class="event-meta-item"><span>⏰ ${formatTime(event.time)}</span></div>
                <div class="event-meta-item"><span>📍 ${event.location}</span></div>
                <div class="event-meta-item"><span>👥 ${registered}/${event.capacity} registered</span></div>
            </div>
            <div class="event-capacity">
                <div class="capacity-bar"><div class="capacity-fill" style="width: ${capacityPercent}%"></div></div>
                <p style="font-size: 10px; color: #999; margin-top: 4px;">${event.capacity - registered} slots remaining</p>
            </div>
            <div class="event-actions">
                <button class="btn-edit" data-id="${event.id}">Edit</button>
                <button class="btn-archive" data-id="${event.id}">${btnText}</button>
                <button class="btn-delete" data-id="${event.id}">Delete</button>
            </div>
        </div>
    `;
    
    // Click card to view details (excluding buttons)
card.addEventListener('click', function(e) {
        // Do not redirect if clicking buttons (Edit/Archive/Delete)
        if (!e.target.classList.contains('btn-edit') && 
            !e.target.classList.contains('btn-archive') && 
            !e.target.classList.contains('btn-delete')) {
            
            // REDIRECT to the details page
            // We pass the ID in the URL: ?id=...
            window.location.href = `event-details.html?id=${event.id}`;
        }
    });

    return card;
}

// --- 6. EVENT MODAL LOGIC (CREATE/EDIT) ---
async function saveEventToDB() {
    const title = document.getElementById('event-title').value.trim();
    // ... get all other fields ...
    const category = document.getElementById('event-category').value;
    const date = document.getElementById('event-date').value;
    const time = document.getElementById('event-time').value;
    const location = document.getElementById('event-location').value;
    const capacity = document.getElementById('event-capacity').value;
    const organization = document.getElementById('event-organization').value;
    const about = document.getElementById('event-about').value;
    const requirements = document.getElementById('event-requirements').value;

    if (!title || !date || !time) {
        showSuccessNotification('Please fill required fields', 'error');
        return;
    }

    // Gather Agenda
    const agenda = [];
    document.querySelectorAll('.agenda-item').forEach(item => {
        agenda.push({
            time: item.querySelector('.agenda-time').value,
            title: item.querySelector('.agenda-title').value
        });
    });

    const payload = {
        title, category, date, time, location, capacity, organization, about, requirements, agenda,
        imageUrl: currentEventBanner,
        status: currentEditingEventId ? undefined : 'Pending' // Updates keep status, New ones are Pending
    };

    try {
        let response;
        if (currentEditingEventId) {
            response = await fetch(`${API_URL}/${currentEditingEventId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
        } else {
            response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
        }

        const result = await response.json();
        
        if (response.ok) {
            showSuccessNotification(currentEditingEventId ? 'Event Updated' : 'Event Submitted for Approval');
            document.getElementById('event-modal').style.display = 'none';
            fetchEventsFromDB();
        } else {
            showSuccessNotification('Error saving event', 'error');
        }
    } catch (error) {
        console.error(error);
    }
}


// --- 7. UTILITY FUNCTIONS ---
function formatDate(dateStr) {
    if(!dateStr) return 'TBD';
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatTime(timeStr) { return timeStr || ''; }

function showSuccessNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    notification.style.backgroundColor = type === 'error' ? '#d32f2f' : '#4CAF50';
    notification.style.color = 'white';
    notification.style.padding = '15px';
    notification.style.position = 'fixed';
    notification.style.bottom = '20px';
    notification.style.right = '20px';
    notification.style.borderRadius = '5px';
    notification.style.zIndex = '1000';
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
}

function viewEventRequest(id) {
    // Find in requests data
    const request = eventRequestsData.find(r => r.id === id);
    if(request) {
        window.currentViewingRequestId = id;
        viewEventDetails(id, true); // Pass true to indicate it's a request view
    }
}

function viewEventDetails(id, isRequest = false) {
    // Search in both arrays
    const event = eventsData.find(e => e.id === id) || eventRequestsData.find(e => e.id === id);
    if (!event) return;

    const reqText = event.requirements || "No specific requirements provided.";

    const reqElement = document.getElementById('view-requirements');
        if (reqElement) {
            reqElement.textContent = reqText;
        }

    const modal = document.getElementById('event-view-modal');
    
    // Fill Data
    document.getElementById('view-title').textContent = event.title;
    document.getElementById('view-category').textContent = event.category;
    document.getElementById('view-category').className = `event-category-badge ${event.category}`;
    document.getElementById('view-banner').src = event.banner;
    document.getElementById('view-date').textContent = formatDate(event.date);
    document.getElementById('view-time').textContent = event.time;
    document.getElementById('view-location').textContent = event.location;
    document.getElementById('view-about').textContent = event.about;
    document.getElementById('view-attendance').textContent = `${event.registered || 0}/${event.capacity}`;
    document.getElementById('view-edit-btn').onclick = function() {
        // Redirect to the new form page with the ID
        window.location.href = `create-event.html?id=${id}`;
    };

    // Agenda
    const agendaList = document.getElementById('view-agenda');
    agendaList.innerHTML = '';
    if(event.agenda) {
        event.agenda.forEach(item => {
            agendaList.innerHTML += `<div class="agenda-item-view"><b>${item.time}</b> ${item.title}</div>`;
        });
    }

    // Modal Footer Logic (Swap buttons if it's a Request vs Active Event)
    const footer = modal.querySelector('.modal-footer');
    if (isRequest) {
        footer.innerHTML = `
            <button class="btn-delete-event" onclick="openRejectEventModal('${id}')">Reject</button>
            <button class="btn-edit-event" onclick="approveEventRequest('${id}')">Approve</button>
        `;
    } else {
        // Standard View
        footer.innerHTML = `
             <button class="btn-cancel-details" onclick="document.getElementById('event-view-modal').style.display='none'">Close</button>
        `;
    }

    modal.style.display = 'flex';
}

function openRejectEventModal(id) {
    window.currentRejectingRequestId = id;
    document.getElementById('reject-event-title').textContent = 'this event';
    document.getElementById('reject-event-modal').style.display = 'flex';
}

function attachEventCardListeners() {
    // 1. EDIT BUTTON (Redirects to form)
        document.querySelectorAll('.btn-edit').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation(); 
            const eventId = e.target.getAttribute('data-id');
            
            // Redirect to the page (Do NOT call editEvent())
            window.location.href = `create-event.html?id=${eventId}`;
        });
    });

    // 2. ARCHIVE BUTTON (Optimistic Update)
    document.querySelectorAll('.btn-archive').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.stopPropagation();
            
            const id = e.target.getAttribute('data-id');
            const isArchiving = e.target.textContent.trim() === 'Archive';
            const newStatus = isArchiving ? 'Archived' : 'Active';
            const originalStatus = isArchiving ? 'Active' : 'Archived'; // In case we need to revert

            // --- INSTANT UI UPDATE (Optimistic) ---
            // 1. Find the event in our local variable
            const eventIndex = eventsData.findIndex(evt => evt.id === id);
            
            if (eventIndex > -1) {
                // 2. Update the status locally
                eventsData[eventIndex].status = newStatus;
                
                // 3. Re-render the screen IMMEDIATELY
                renderEvents(); 
                
                // 4. Show success message immediately
                const msg = isArchiving ? 'Event Archived Successfully' : 'Event Unarchived Successfully';
                showToast(msg, 'success');
            }

            // --- BACKGROUND SERVER SYNC ---
            try {
                // Send data to server while user continues working
                const response = await fetch(`${API_URL}/${id}`, {
                    method: 'PATCH',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({ status: newStatus })
                });

                if (!response.ok) throw new Error('Failed to update');
                
                // We DON'T need to fetchEventsFromDB() here anymore because the UI is already correct!

            } catch (error) {
                console.error(error);
                // IF SERVER FAILS: Revert the change
                if (eventIndex > -1) {
                    eventsData[eventIndex].status = originalStatus;
                    renderEvents(); // Put it back
                    showToast('Network Error: Action undone', 'error');
                }
            }
        });
    });

    // 3. DELETE BUTTON (Optimistic Update)
    document.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.stopPropagation();
            
            if(confirm('Are you sure you want to delete this event?')) {
                const id = e.target.getAttribute('data-id');
                
                // --- INSTANT UI UPDATE ---
                // 1. Find and Remove from local array
                const eventIndex = eventsData.findIndex(evt => evt.id === id);
                let deletedEventItem = null;

                if (eventIndex > -1) {
                    deletedEventItem = eventsData[eventIndex]; // Save backup
                    eventsData.splice(eventIndex, 1); // Remove it
                    renderEvents(); // Update screen immediately
                    showToast('Event Deleted Successfully', 'success');
                }

                // --- BACKGROUND SERVER SYNC ---
                try {
                    const response = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
                    if (!response.ok) throw new Error('Delete failed');
                } catch (error) {
                    console.error(error);
                    // IF SERVER FAILS: Put it back
                    if (deletedEventItem) {
                        eventsData.splice(eventIndex, 0, deletedEventItem);
                        renderEvents();
                        showToast('Error deleting event', 'error');
                    }
                }
            }
        });
    });
}



// MAIN INITIALIZATION
document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('event-search');
    const filterStatus = document.getElementById('filter-status');
    const filterEvents = document.getElementById('filter-events');
    const filterOrg = document.getElementById('filter-organization');
    
    if (searchInput) searchInput.addEventListener('keyup', renderEvents);
    if (filterStatus) filterStatus.addEventListener('change', renderEvents);
    if (filterEvents) filterEvents.addEventListener('change', renderEvents);
    if (filterOrg) filterOrg.addEventListener('change', renderEvents);
    fetchEventsFromDB();

    document.getElementById('event-publish-btn')?.addEventListener('click', saveEventToDB);
    document.querySelector('.btn-create-event')?.addEventListener('click', () => openEventModal(false));
    
    // Listeners for closing modals
    document.querySelectorAll('.modal-close, .btn-cancel').forEach(el => {
        el.addEventListener('click', () => {
            document.querySelectorAll('.modal').forEach(m => m.style.display = 'none');
        });
    });

    const btnCreateEvent = document.querySelector('.btn-create-event');
if (btnCreateEvent) {
    btnCreateEvent.addEventListener('click', function(e) {
        e.preventDefault();
        // Just redirect. Do not call openEventModal()
        window.location.href = 'create-event.html'; 
    });
}
});

// --- TOAST HELPER FUNCTION ---
// --- TOAST HELPER FUNCTION ---
function showToast(message, type = 'success') {
    const existingToast = document.querySelector('.toast-notification');
    if (existingToast) existingToast.remove();

    const toast = document.createElement('div');
    toast.className = `toast-notification ${type}`;
    
    // Icon based on type
    const iconSymbol = type === 'success' ? '✓' : '!';

    toast.innerHTML = `
        <div class="toast-icon">${iconSymbol}</div>
        <div class="toast-message">${message}</div>
    `;

    document.body.appendChild(toast);

    // Animation
    setTimeout(() => { toast.classList.add('show'); }, 10);
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => { toast.remove(); }, 300);
    }, 3000);
}

// --- FILTER LOGIC FOR MODAL ---
function populateRequestFilters() {
    const orgSelect = document.getElementById('requests-filter-organization');
    const searchInput = document.getElementById('requests-search');
    const catSelect = document.getElementById('requests-filter-category');

    // Populate Organizers
    if (orgSelect) {
        const organization = [...new Set(eventRequestsData.map(r => r.organization))].sort();
        orgSelect.innerHTML = '<option value="">All Organizations </option>';
        organization.forEach(org => orgSelect.innerHTML += `<option value="${org}">${org}</option>`);
    }

    // Attach Listeners
    const filterList = () => {
        const term = searchInput.value.toLowerCase();
        const cat = catSelect.value;
        const org = orgSelect.value;

        const filtered = eventRequestsData.filter(r => {
            const matchesSearch = r.title.toLowerCase().includes(term);
            const matchesCat = cat ? r.category === cat : true;
            const matchesOrg = org ? r.organization === org : true;
            return matchesSearch && matchesCat && matchesOrg;
        });
        
        renderRequestListItems(filtered);
    };

    if(searchInput) searchInput.onkeyup = filterList;
    if(catSelect) catSelect.onchange = filterList;
    if(orgSelect) orgSelect.onchange = filterList;
}