// ========== EVENTS PAGE FUNCTIONALITY ==========

let eventsData = [];
let currentEditingEventId = null;
let currentDeletingEventId = null;
let currentEventBanner = null; // Store uploaded banner

// Initialize events data from localStorage
function initializeEventsData() {
    const stored = localStorage.getItem('eventsData');
    if (stored) {
        eventsData = JSON.parse(stored);
    } else {
        eventsData = [
            {
                id: 1,
                title: 'Tech Talk: IT Summit',
                category: 'Academic',
                date: '2025-09-16',
                time: '14:00',
                location: 'QCU Auditorium',
                capacity: 200,
                registered: 156,
                organizer: 'QCU IT Department',
                about: 'Join us for an exciting tech summit featuring industry leaders and innovative discussions. This event will cover the latest trends in information technology, including artificial intelligence, cloud computing, cybersecurity, and digital transformation. Participants will gain valuable insights from expert speakers and have the chance to connect with fellow IT professionals and students.',
                requirements: 'Bring your laptop for hands-on workshops',
                status: 'Active',
                keywords: ['Technology', 'Networking', 'Professional Development'],
                expectations: ['Expert speakers from the industry', 'Hands-on workshops and activities', 'Networking opportunities', 'Certificate of participation'],
                agenda: [
                    { time: '02:00 PM', title: 'Registration and Networking' },
                    { time: '14:30', title: 'Keynote Speech: The Future of AI' },
                    { time: '16:45', title: 'Q&A and Closing Remarks' }
                ],
                banner: 'https://via.placeholder.com/800x300?text=Tech+Talk+IT+Summit'
            },
            {
                id: 2,
                title: 'Schedule Adjustment',
                category: 'Institutional',
                date: '2025-09-16',
                time: '14:00',
                location: 'QCU Gymnasium',
                capacity: 200,
                registered: 156,
                organizer: 'QCU Admin Office',
                about: 'Important schedule adjustment for this academic year.',
                requirements: '',
                status: 'Archived',
                keywords: ['Announcement', 'Schedule'],
                expectations: ['Updated schedule information', 'Q&A session'],
                agenda: [
                    { time: '14:00', title: 'Schedule Overview' },
                    { time: '14:30', title: 'Q&A' }
                ],
                banner: 'https://via.placeholder.com/800x300?text=Schedule+Adjustment'
            }
        ];
        saveEventsData();
    }
}

function saveEventsData() {
    localStorage.setItem('eventsData', JSON.stringify(eventsData));
}

// Render events
function renderEvents() {
    const activeEventsGrid = document.getElementById('active-events');
    const archivedEventsGrid = document.getElementById('archived-events');
    
    if (!activeEventsGrid || !archivedEventsGrid) return;

    const activeEvents = eventsData.filter(e => e.status === 'Active');
    const archivedEvents = eventsData.filter(e => e.status === 'Archived');

    // Update section titles with counts
    const activeSectionTitle = document.querySelector('.active-column .section-title');
    const archivedSectionTitle = document.querySelector('.archived-column .section-title');
    
    if (activeSectionTitle) {
        activeSectionTitle.textContent = `Active Events (${activeEvents.length})`;
    }
    if (archivedSectionTitle) {
        archivedSectionTitle.textContent = `Archived Events (${archivedEvents.length})`;
    }

    // Render active events
    activeEventsGrid.innerHTML = '';
    if (activeEvents.length === 0) {
        activeEventsGrid.innerHTML = '<p style="color: #999; text-align: center; padding: 20px;">No active events</p>';
    } else {
        activeEvents.forEach(event => {
            activeEventsGrid.appendChild(createEventCard(event));
        });
    }

    // Render archived events
    archivedEventsGrid.innerHTML = '';
    if (archivedEvents.length === 0) {
        archivedEventsGrid.innerHTML = '<p style="color: #999; text-align: center; padding: 20px;">No archived events</p>';
    } else {
        archivedEvents.forEach(event => {
            archivedEventsGrid.appendChild(createEventCard(event));
        });
    }

    attachEventCardListeners();
}

function createEventCard(event) {
    const card = document.createElement('div');
    card.className = 'event-card';
    
    const capacityPercent = (event.registered / event.capacity) * 100;
    const archiveButtonText = event.status === 'Active' ? 'Archive' : 'Unarchive';
    
    card.innerHTML = `
        <div class="event-banner">
            <img src="${event.banner}" alt="${event.title}" onerror="this.src='https://via.placeholder.com/800x300?text=Event+Banner'">
        </div>
        <div class="event-container">
            <div class="event-title-section">
                <h3 class="event-title">${event.title}</h3>
                <span class="event-category ${event.category}">${event.category}</span>
            </div>
            <p class="event-organizer">${event.organizer}</p>
            <div class="event-meta">
                <div class="event-meta-item">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 4px;">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                        <line x1="16" y1="2" x2="16" y2="6"></line>
                        <line x1="8" y1="2" x2="8" y2="6"></line>
                        <line x1="3" y1="10" x2="21" y2="10"></line>
                    </svg>
                    <span>${formatDate(event.date)}</span>
                </div>
                <div class="event-meta-item">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 4px;">
                        <circle cx="12" cy="12" r="10"></circle>
                        <polyline points="12 6 12 12 16 14"></polyline>
                    </svg>
                    <span>${formatTime(event.time)} - 5:00 PM</span>
                </div>
                <div class="event-meta-item">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 4px;">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                        <circle cx="12" cy="10" r="3"></circle>
                    </svg>
                    <span>${event.location}</span>
                </div>
                <div class="event-meta-item">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 4px;">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                        <circle cx="9" cy="7" r="4"></circle>
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                    </svg>
                    <span>${event.registered}/${event.capacity} registered</span>
                </div>
            </div>
            <div class="event-capacity">
                <div class="capacity-bar">
                    <div class="capacity-fill" style="width: ${capacityPercent}%; background-color: ${capacityPercent > 70 ? '#ffc107' : '#4CAF50'};"></div>
                </div>
                <p style="font-size: 10px; color: #999; margin-top: 4px;">${event.capacity - event.registered} slots remaining &nbsp;&nbsp; ${Math.round(capacityPercent)}% Full</p>
            </div>
            <div class="event-actions">
                <button class="btn-edit" data-id="${event.id}">Edit</button>
                <button class="btn-archive" data-id="${event.id}">${archiveButtonText}</button>
                <button class="btn-delete" data-id="${event.id}">Delete</button>
            </div>
        </div>
    `;

    card.addEventListener('click', function(e) {
        if (!e.target.classList.contains('btn-edit') && 
            !e.target.classList.contains('btn-archive') && 
            !e.target.classList.contains('btn-delete')) {
            viewEventDetails(event.id);
        }
    });

    return card;
}

function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
}

function formatTime(timeStr) {
    const [hours, minutes] = timeStr.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${String(displayHour).padStart(2, '0')}:${minutes} ${ampm}`;
}

function attachEventCardListeners() {
    document.querySelectorAll('.btn-edit').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const id = parseInt(this.getAttribute('data-id'));
            editEvent(id);
        });
    });

    document.querySelectorAll('.btn-archive').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const id = parseInt(this.getAttribute('data-id'));
            toggleArchive(id);
        });
    });

    document.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const id = parseInt(this.getAttribute('data-id'));
            deleteEventConfirm(id);
        });
    });
}

function toggleArchive(id) {
    const event = eventsData.find(e => e.id === id);
    if (event) {
        event.status = event.status === 'Active' ? 'Archived' : 'Active';
        saveEventsData();
        renderEvents();
        showSuccessNotification(event.status === 'Active' ? 'Event unarchived' : 'Event archived');
    }
}

function deleteEventConfirm(id) {
    console.log('deleteEventConfirm called with ID:', id);
    if (!id) {
        console.error('ERROR: No ID provided to deleteEventConfirm');
        showSuccessNotification('Error: Invalid event ID', 'error');
        return;
    }
    
    currentDeletingEventId = id;
    console.log('currentDeletingEventId set to:', currentDeletingEventId);
    
    const deleteEventModal = document.getElementById('delete-event-modal');
    if (deleteEventModal) {
        deleteEventModal.style.display = 'flex';
        console.log('Delete modal opened');
    } else {
        console.error('ERROR: Delete modal not found');
    }
}

function deleteEventNow() {
    console.log('deleteEventNow called, currentDeletingEventId:', currentDeletingEventId);
    
    // Verify we have a valid ID
    if (!currentDeletingEventId || currentDeletingEventId === null || currentDeletingEventId === undefined) {
        console.error('ERROR: No event ID to delete, currentDeletingEventId:', currentDeletingEventId);
        showSuccessNotification('Error: No event selected', 'error');
        return;
    }

    // Find the event index
    const eventIndex = eventsData.findIndex(event => {
        console.log('Checking event ID:', event.id, 'against:', currentDeletingEventId);
        return event.id === currentDeletingEventId;
    });
    
    console.log('Event index found:', eventIndex);
    
    if (eventIndex === -1) {
        console.error('ERROR: Event not found with ID:', currentDeletingEventId);
        console.log('Available event IDs:', eventsData.map(e => e.id));
        showSuccessNotification('Error: Event not found', 'error');
        currentDeletingEventId = null;
        return;
    }

    // Remove the event from array
    const deletedEvent = eventsData.splice(eventIndex, 1);
    console.log('Event deleted:', deletedEvent[0].title);

    // Save to localStorage
    saveEventsData();
    console.log('Data saved to localStorage');

    // Re-render the events display
    renderEvents();
    console.log('Events re-rendered');

    // Close the delete modal
    const deleteEventModal = document.getElementById('delete-event-modal');
    if (deleteEventModal) {
        deleteEventModal.style.display = 'none';
        console.log('Delete modal closed');
    }

    // Close the event view modal if open
    const eventViewModal = document.getElementById('event-view-modal');
    if (eventViewModal) {
        eventViewModal.style.display = 'none';
        console.log('Event view modal closed');
    }

    // Show success message
    showSuccessNotification('Event deleted successfully');

    // Clear the ID
    currentDeletingEventId = null;
    console.log('currentDeletingEventId cleared');
}

function viewEventDetails(id) {
    const event = eventsData.find(e => e.id === id);
    if (!event) return;

    const eventViewModal = document.getElementById('event-view-modal');
    
    // Populate event details
    document.getElementById('view-category').textContent = event.category;
    document.getElementById('view-category').className = `event-category-badge ${event.category}`;
    document.getElementById('view-title').textContent = event.title;
    document.getElementById('view-banner').src = event.banner;
    document.getElementById('view-date').textContent = formatDate(event.date);
    document.getElementById('view-time').textContent = formatTime(event.time) + ' - 5:00 PM';
    document.getElementById('view-location').textContent = event.location;
    document.getElementById('view-attendance').textContent = event.registered + '/' + event.capacity;
    document.getElementById('view-about').textContent = event.about;
    
    // Capacity
    const capacityPercent = (event.registered / event.capacity) * 100;
    document.getElementById('view-capacity-info').textContent = event.registered + ' is participating';
    document.getElementById('view-capacity-fill').style.width = capacityPercent + '%';
    document.getElementById('view-capacity-fill').style.backgroundColor = capacityPercent > 70 ? '#ffc107' : '#4CAF50';
    document.getElementById('view-capacity-text').textContent = (event.capacity - event.registered) + ' slots remaining · ' + Math.round(capacityPercent) + '% Full';
    
    // Expectations
    const expectationsList = document.getElementById('view-expectations');
    expectationsList.innerHTML = '';
    event.expectations.forEach(exp => {
        const li = document.createElement('li');
        li.textContent = exp;
        expectationsList.appendChild(li);
    });
    
    // Agenda
    const agendaSection = document.getElementById('view-agenda');
    agendaSection.innerHTML = '';
    event.agenda.forEach((item, index) => {
        const agendaDiv = document.createElement('div');
        agendaDiv.style.cssText = 'display: flex; align-items: center; padding: 12px; background-color: #f9f9f9; border-radius: 8px; gap: 12px;';
        agendaDiv.innerHTML = `
            <div style="width: 36px; height: 36px; background-color: #e3f2fd; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 600; color: #2d5aa8; flex-shrink: 0;">${index + 1}</div>
            <div>
                <p style="margin: 0; font-size: 12px; color: #999;">${item.time}</p>
                <p style="margin: 0; font-size: 14px; font-weight: 500;">${item.title}</p>
            </div>
        `;
        agendaSection.appendChild(agendaDiv);
    });
    
    // Keywords
    const keywordsList = document.getElementById('view-keywords');
    keywordsList.innerHTML = '';
    event.keywords.forEach(keyword => {
        const span = document.createElement('span');
        span.style.cssText = 'padding: 6px 12px; background-color: #e0e0e0; border-radius: 20px; font-size: 13px;';
        span.textContent = keyword;
        keywordsList.appendChild(span);
    });
    
    // Requirements
    if (event.requirements) {
        document.getElementById('view-requirements').textContent = event.requirements;
    }
    
    // Edit and Delete buttons
    document.getElementById('view-edit-btn').onclick = function() {
        eventViewModal.style.display = 'none';
        editEvent(id);
    };
    
    document.getElementById('view-delete-btn').onclick = function() {
        eventViewModal.style.display = 'none';
        deleteEventConfirm(id);
    };
    
    eventViewModal.style.display = 'flex';
}

function openEventModal(isEdit, eventId = null) {
    const eventModal = document.getElementById('event-modal');
    const eventPublishBtn = document.getElementById('event-publish-btn');
    
    currentEditingEventId = eventId;
    currentEventBanner = null;
    const modalTitle = document.getElementById('event-modal-title');
    const modalSubtitle = document.getElementById('event-modal-subtitle');
    const uploadArea = document.getElementById('upload-area');

    if (isEdit && eventId) {
        modalTitle.textContent = 'Edit Event';
        modalSubtitle.textContent = 'Update the event details below';
        eventPublishBtn.textContent = 'Save Changes';

        const event = eventsData.find(e => e.id === eventId);
        if (event) {
            document.getElementById('event-title').value = event.title;
            document.getElementById('event-category').value = event.category;
            document.getElementById('event-date').value = event.date;
            document.getElementById('event-time').value = event.time;
            document.getElementById('event-location').value = event.location;
            document.getElementById('event-capacity').value = event.capacity;
            document.getElementById('event-organizer').value = event.organizer;
            document.getElementById('event-about').value = event.about;
            document.getElementById('event-requirements').value = event.requirements;

            if (event.banner) {
                currentEventBanner = event.banner;
                uploadArea.innerHTML = `
                    <img src="${event.banner}" style="max-width: 100%; max-height: 150px; border-radius: 4px;">
                    <p>✓ Banner loaded</p>
                `;
                uploadArea.style.borderColor = '#4CAF50';
            }

            const agendaList = document.getElementById('agenda-list');
            agendaList.innerHTML = '';
            event.agenda.forEach((item) => {
                const agendaItem = document.createElement('div');
                agendaItem.className = 'agenda-item';
                agendaItem.innerHTML = `
                    <input type="time" class="agenda-time" value="${item.time}" placeholder="Time">
                    <input type="text" class="agenda-title" value="${item.title}" placeholder="Title">
                    <button class="btn-remove-agenda" type="button">×</button>
                `;
                agendaList.appendChild(agendaItem);
            });
        }
    } else {
        modalTitle.textContent = 'Create New Event';
        modalSubtitle.textContent = 'Fill in the details to create a new campus event.';
        eventPublishBtn.textContent = 'Publish Event';

        uploadArea.style.borderColor = '#ddd';
        uploadArea.style.backgroundColor = 'transparent';
        uploadArea.innerHTML = `
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <rect x="3" y="3" width="18" height="18" rx="2"></rect>
                <circle cx="8.5" cy="8.5" r="1.5"></circle>
                <path d="M21 15l-5-5L5 21"></path>
            </svg>
            <p>Click to upload or drag and drop</p>
            <small>PNG, JPG up to 10MB</small>
        `;

        document.getElementById('event-title').value = '';
        document.getElementById('event-category').value = '';
        document.getElementById('event-date').value = '';
        document.getElementById('event-time').value = '';
        document.getElementById('event-location').value = '';
        document.getElementById('event-capacity').value = '';
        document.getElementById('event-organizer').value = '';
        document.getElementById('event-about').value = '';
        document.getElementById('event-requirements').value = '';

        const agendaList = document.getElementById('agenda-list');
        agendaList.innerHTML = `
            <div class="agenda-item">
                <input type="time" class="agenda-time" placeholder="Time">
                <input type="text" class="agenda-title" placeholder="e.g., Registration">
                <button class="btn-remove-agenda" type="button">×</button>
            </div>
        `;
    }

    if (eventModal) {
        eventModal.style.display = 'flex';
    }
}

function editEvent(eventId) {
    openEventModal(true, eventId);
}

function showSuccessNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = 'notification';
    if (type === 'error') {
        notification.style.borderLeftColor = '#d32f2f';
        notification.style.borderColor = '#d32f2f';
        notification.style.color = '#d32f2f';
    }
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(function() {
        notification.style.animation = 'slideOutDown 0.3s ease-out';
        setTimeout(function() {
            notification.remove();
        }, 300);
    }, 3000);
}

// Main initialization when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    const btnCreateEvent = document.querySelector('.btn-create-event');
    const eventModal = document.getElementById('event-modal');
    const deleteEventModal = document.getElementById('delete-event-modal');
    const eventSearch = document.getElementById('event-search');
    const eventPublishBtn = document.getElementById('event-publish-btn');
    const activeEventsGrid = document.getElementById('active-events');
    const archivedEventsGrid = document.getElementById('archived-events');
    const btnDeleteEvent = document.querySelector('#delete-event-modal .btn-delete');

    console.log('Events page loaded');

    // Initialize events data
    if (activeEventsGrid && archivedEventsGrid) {
        initializeEventsData();
        renderEvents();

        // Create Event Button - CLICKABLE
        if (btnCreateEvent) {
            btnCreateEvent.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                console.log('✓ Create Event button clicked');
                openEventModal(false);
            });
        }

        // Image Upload Handler
        const uploadArea = document.getElementById('upload-area');
        const eventBannerInput = document.getElementById('event-banner');

        if (uploadArea && eventBannerInput) {
            uploadArea.addEventListener('click', function() {
                eventBannerInput.click();
            });

            eventBannerInput.addEventListener('change', function(e) {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = function(event) {
                        currentEventBanner = event.target.result;
                        uploadArea.style.borderColor = '#4CAF50';
                        uploadArea.innerHTML = `
                            <img src="${currentEventBanner}" style="max-width: 100%; max-height: 150px; border-radius: 4px;">
                            <p>✓ Image uploaded (${file.name})</p>
                        `;
                    };
                    reader.readAsDataURL(file);
                }
            });

            uploadArea.addEventListener('dragover', function(e) {
                e.preventDefault();
                uploadArea.style.borderColor = '#2196F3';
                uploadArea.style.backgroundColor = '#f0f8ff';
            });

            uploadArea.addEventListener('dragleave', function() {
                uploadArea.style.borderColor = '#ddd';
                uploadArea.style.backgroundColor = 'transparent';
            });

            uploadArea.addEventListener('drop', function(e) {
                e.preventDefault();
                uploadArea.style.borderColor = '#ddd';
                uploadArea.style.backgroundColor = 'transparent';
                
                const files = e.dataTransfer.files;
                if (files.length > 0) {
                    eventBannerInput.files = files;
                    const event = new Event('change', { bubbles: true });
                    eventBannerInput.dispatchEvent(event);
                }
            });
        }

        // Add/remove agenda items
        document.addEventListener('click', function(e) {
            if (e.target.classList.contains('btn-add-agenda')) {
                e.preventDefault();
                const agendaList = document.getElementById('agenda-list');
                const agendaItem = document.createElement('div');
                agendaItem.className = 'agenda-item';
                agendaItem.innerHTML = `
                    <input type="time" class="agenda-time" placeholder="Time">
                    <input type="text" class="agenda-title" placeholder="e.g., Registration">
                    <button class="btn-remove-agenda" type="button">×</button>
                `;
                agendaList.appendChild(agendaItem);
            }

            if (e.target.classList.contains('btn-remove-agenda')) {
                e.preventDefault();
                e.target.parentElement.remove();
            }
        });

        // Publish Event Button
        if (eventPublishBtn) {
            eventPublishBtn.addEventListener('click', function() {
                const title = document.getElementById('event-title').value.trim();
                const category = document.getElementById('event-category').value;
                const date = document.getElementById('event-date').value;
                const time = document.getElementById('event-time').value;
                const location = document.getElementById('event-location').value.trim();
                const capacity = parseInt(document.getElementById('event-capacity').value);
                const organizer = document.getElementById('event-organizer').value.trim();
                const about = document.getElementById('event-about').value.trim();

                if (!title || !category || !date || !time || !location || !capacity || !organizer || !about) {
                    showSuccessNotification('Please fill in all required fields', 'error');
                    return;
                }

                if (!currentEventBanner) {
                    showSuccessNotification('Please upload an event banner image', 'error');
                    return;
                }

                const agenda = [];
                document.querySelectorAll('.agenda-item').forEach(item => {
                    const agendaTime = item.querySelector('.agenda-time').value;
                    const agendaTitle = item.querySelector('.agenda-title').value;
                    if (agendaTime && agendaTitle) {
                        agenda.push({ time: agendaTime, title: agendaTitle });
                    }
                });

                if (agenda.length === 0) {
                    showSuccessNotification('Please add at least one agenda item', 'error');
                    return;
                }

                if (currentEditingEventId) {
                    const event = eventsData.find(e => e.id === currentEditingEventId);
                    if (event) {
                        event.title = title;
                        event.category = category;
                        event.date = date;
                        event.time = time;
                        event.location = location;
                        event.capacity = capacity;
                        event.organizer = organizer;
                        event.about = about;
                        event.requirements = document.getElementById('event-requirements').value;
                        event.agenda = agenda;
                        event.banner = currentEventBanner;
                    }
                    saveEventsData();
                    renderEvents();
                    eventModal.style.display = 'none';
                    currentEditingEventId = null;
                    currentEventBanner = null;
                    showSuccessNotification('Event updated successfully');
                } else {
                    const newEvent = {
                        id: eventsData.length > 0 ? Math.max(...eventsData.map(e => e.id)) + 1 : 1,
                        title,
                        category,
                        date,
                        time,
                        location,
                        capacity,
                        registered: 0,
                        organizer,
                        about,
                        requirements: document.getElementById('event-requirements').value,
                        status: 'Active',
                        keywords: ['Event'],
                        expectations: ['Great experience'],
                        agenda,
                        banner: currentEventBanner
                    };
                    eventsData.push(newEvent);
                    saveEventsData();
                    renderEvents();
                    eventModal.style.display = 'none';
                    currentEditingEventId = null;
                    currentEventBanner = null;
                    showSuccessNotification('Event published successfully');
                }
            });
        }

        // Delete Event Button - Robust listener that works every time
        function setupDeleteButtonListener() {
            const deleteEventButton = document.querySelector('#delete-event-modal .btn-delete');
            if (deleteEventButton) {
                // Remove old listener if exists
                deleteEventButton.onclick = null;
                
                // Add new listener
                deleteEventButton.addEventListener('click', function(e) {
                    console.log('Delete button clicked');
                    e.preventDefault();
                    e.stopPropagation();
                    deleteEventNow();
                });
                
                console.log('Delete button listener attached');
            } else {
                console.error('Delete button not found');
            }
        }
        
        // Setup listener when page loads
        setupDeleteButtonListener();

        // Modal close buttons
        document.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', function() {
                eventModal.style.display = 'none';
                deleteEventModal.style.display = 'none';
                const eventViewModal = document.getElementById('event-view-modal');
                if (eventViewModal) {
                    eventViewModal.style.display = 'none';
                }
                currentEditingEventId = null;
                currentDeletingEventId = null;
            });
        });

        document.querySelectorAll('.btn-cancel').forEach(btn => {
            btn.addEventListener('click', function() {
                eventModal.style.display = 'none';
                deleteEventModal.style.display = 'none';
                const eventViewModal = document.getElementById('event-view-modal');
                if (eventViewModal) {
                    eventViewModal.style.display = 'none';
                }
                currentEditingEventId = null;
                currentDeletingEventId = null;
            });
        });

        window.addEventListener('click', function(event) {
            if (event.target === eventModal || event.target === deleteEventModal) {
                eventModal.style.display = 'none';
                deleteEventModal.style.display = 'none';
                currentEditingEventId = null;
                currentDeletingEventId = null;
            }
        });

        // View modal close
        const eventViewModal = document.getElementById('event-view-modal');
        if (eventViewModal) {
            window.addEventListener('click', function(event) {
                if (event.target === eventViewModal) {
                    eventViewModal.style.display = 'none';
                }
            });
        }

        // Search functionality
        if (eventSearch) {
            eventSearch.addEventListener('keyup', function() {
                const searchTerm = this.value.toLowerCase().trim();
                const filterDropdown = document.querySelector('.filter-dropdown');
                const dateFilter = filterDropdown ? filterDropdown.value : '';
                applyFilters(searchTerm, dateFilter);
            });
        }

        // Filter dropdown functionality
        const filterDropdown = document.querySelector('.filter-dropdown');
        if (filterDropdown) {
            filterDropdown.addEventListener('change', function() {
                const dateFilter = this.value;
                const searchTerm = eventSearch ? eventSearch.value.toLowerCase().trim() : '';
                applyFilters(searchTerm, dateFilter);
            });
        }

        // Combined filter function
        function applyFilters(searchTerm = '', dateFilter = '') {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            // Filter active events
            const activeEventsGrid = document.getElementById('active-events');
            const activeCards = activeEventsGrid ? activeEventsGrid.querySelectorAll('.event-card') : [];
            
            activeCards.forEach(card => {
                const matches = checkEventMatch(card, searchTerm, dateFilter, today);
                card.style.display = matches ? 'block' : 'none';
            });

            // Filter archived events
            const archivedEventsGrid = document.getElementById('archived-events');
            const archivedCards = archivedEventsGrid ? archivedEventsGrid.querySelectorAll('.event-card') : [];
            
            archivedCards.forEach(card => {
                const matches = checkEventMatch(card, searchTerm, dateFilter, today);
                card.style.display = matches ? 'block' : 'none';
            });
        }

        function checkEventMatch(card, searchTerm, dateFilter, today) {
            const title = card.querySelector('.event-title').textContent.toLowerCase();
            const locationItem = Array.from(card.querySelectorAll('.event-meta-item'))[2];
            const location = locationItem ? locationItem.textContent.toLowerCase() : '';
            const organizer = card.querySelector('.event-organizer').textContent.toLowerCase();
            
            // Get event date for date filtering
            const dateItem = Array.from(card.querySelectorAll('.event-meta-item'))[0];
            let eventDate = null;
            if (dateItem) {
                const dateStr = dateItem.textContent.trim();
                eventDate = new Date(dateStr);
                eventDate.setHours(0, 0, 0, 0);
            }
            
            // Check search term match
            const matchesSearch = !searchTerm || title.includes(searchTerm) || location.includes(searchTerm) || organizer.includes(searchTerm);
            
            // Check date filter match
            let matchesDateFilter = true;
            if (dateFilter === 'upcoming') {
                matchesDateFilter = eventDate && eventDate >= today;
            } else if (dateFilter === 'past') {
                matchesDateFilter = eventDate && eventDate < today;
            }
            // If dateFilter is empty, show all events
            
            return matchesSearch && matchesDateFilter;
        }
    }

    // Navigation
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', function() {
            const page = this.getAttribute('data-page');
            navItems.forEach(nav => nav.classList.remove('active'));
            this.classList.add('active');

            if (page === 'events') {
                window.location.href = 'events.html';
            }
        });
    });

    // Logout
    const logoutBtn = document.querySelector('.logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            if (confirm('Are you sure you want to logout?')) {
                window.location.href = '../../login admin/index.html';
            }
        });
    }
});
