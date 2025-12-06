// Events page logic: calendar, event lists, saved events, registrations, notifications

let allEventsData = []; // This will hold ONLY 'Active' events
let mySavedEventIds = [];
let myRegistrations = [];
let currentEventId = null;
let calendarDate = new Date();

// Matches the categories from your Admin side
const categoryColors = {
    academic: '#f59e0b',      // Orange
    community: '#9b59b6',     // Purple
    institutional: '#64748b', // Grey
    recreation: '#3b82f6',    // Blue
    culture: '#e91e63',       // Pink
    default: '#2c3e7f'        // Dark Blue
};

// --- 1. INITIALIZE DATA (FETCH FROM DB) ---
async function fetchAndInitializeEvents() {
    try {
        const studentId = localStorage.getItem('currentStudentId');
        
        // 1. Fetch ALL events
        const eventsResponse = await fetch('http://localhost:3001/api/events');
        const rawData = await eventsResponse.json();

        // 2. Filter & Sort (Active + Archived)
        allEventsData = rawData
            .filter(e => e.status === 'Active' || e.status === 'Archived')
            .sort((a, b) => new Date(a.date) - new Date(b.date));

        // 3. Fetch User Specific Data
        if (studentId) {
            // Registrations
            try {
                const regResponse = await fetch(`http://localhost:3001/api/registrations/my-registrations/${studentId}`);
                const regData = await regResponse.json();
                myRegistrations = regData.map(r => r.eventId);
            } catch (err) { console.warn('Could not fetch registrations', err); myRegistrations = []; }
            
            // Saved Events
            try { 
                const saveResponse = await fetch(`http://localhost:3001/api/saved-events/${studentId}`);
                mySavedEventIds = await saveResponse.json(); 
            } catch (err) {
                 console.warn('Could not fetch saved events', err); mySavedEventIds = [];
            }

            // --- UNIFIED SIDEBAR UPDATES (New Logic) ---
            updateSidebarLatest(studentId);
        }

        // 4. RENDER CALENDAR & LISTS (This was likely missing!)
        renderCalendar(allEventsData); 
        
        // Filter for Upcoming List (Only Future Active Events)
        const now = new Date(); 
        now.setHours(0,0,0,0);
        const futureEvents = allEventsData.filter(event => new Date(event.date) >= now && event.status === 'Active');
        
        renderUpcomingEvents(futureEvents);
        renderSavedEvents();
        renderHistoryEvents();
        
        // Render Featured Banner
        if (futureEvents.length > 0) { 
            renderFeaturedEvent(futureEvents[0]); 
        }

        updateMySessionsBadge();

    } catch (error) { 
        console.error('Error initializing events:', error); 
    }
}

// --- 2. CALENDAR RENDERING ---
function renderCalendar(events) {
    const calendarDays = document.querySelector('.calendar-days');
    const calendarTitle = document.querySelector('.calendar-title');
    if (!calendarDays || !calendarTitle) return;

    const year = calendarDate.getFullYear();
    const month = calendarDate.getMonth();
    
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    
    calendarTitle.textContent = `${monthNames[month]} ${year}`;
    
    const firstDayIndex = new Date(year, month, 1).getDay();
    const adjustedFirstDay = (firstDayIndex === 0 ? 6 : firstDayIndex - 1); // Adjust for Monday start
    const lastDay = new Date(year, month + 1, 0).getDate();
    
    calendarDays.innerHTML = '';
    const eventsInThisMonth = [];

    // Empty slots for days before the 1st
    for (let i = 0; i < adjustedFirstDay; i++) {
        calendarDays.innerHTML += `<div class="calendar-day empty"></div>`;
    }

    // Days of the month
    for (let i = 1; i <= lastDay; i++) {
        const dayDiv = document.createElement('div');
        dayDiv.className = 'calendar-day';
        dayDiv.textContent = i;

        // Find events for this specific day
        const daysEvents = events.filter(event => {
            const eDate = new Date(event.date);
            return eDate.getDate() === i && eDate.getMonth() === month && eDate.getFullYear() === year;
        });

        if (daysEvents.length > 0) {
            eventsInThisMonth.push(...daysEvents);
            dayDiv.style.cursor = 'pointer';
            dayDiv.classList.add('has-event');

            // Handle Colors
            if (daysEvents.length === 1) {
                // Single event: Use specific category color
                const cat = (daysEvents[0].category || 'academic').toLowerCase();
                const color = categoryColors[cat] || categoryColors.default;
                
                // We set background directly to ensure it overrides CSS if needed
                dayDiv.style.backgroundColor = color; 
                dayDiv.style.color = '#fff';
            } else {
                // Multiple events: Gradient
                const colors = daysEvents.map(e => {
                    const cat = (e.category || 'academic').toLowerCase();
                    return categoryColors[cat] || categoryColors.default;
                });
                const uniqueColors = [...new Set(colors)];
                
                if (uniqueColors.length === 1) {
                    dayDiv.style.backgroundColor = uniqueColors[0];
                } else {
                    // Create a gradient if multiple types of events exist on one day
                    dayDiv.style.background = `linear-gradient(135deg, ${uniqueColors.join(', ')})`;
                }
                dayDiv.style.color = '#fff';
            }

            // Click listener
            // Inside renderCalendar loop...
            
            dayDiv.addEventListener('click', () => {
                if (daysEvents.length === 1) {
                    // Single Event: Open Modal directly
                    openEventDetail_DYNAMIC(daysEvents[0]._id);
                } else {
                    // Multiple Events: Show list on the right sidebar
                    
                    // 1. Highlight the selected day visually
                    document.querySelectorAll('.calendar-day').forEach(d => d.style.border = 'none');
                    dayDiv.style.border = '3px solid #333'; 
                    
                    // 2. Switch Tab BUT prevent it from resetting the list (pass true)
                    switchTab('upcoming', true); 

                    // 3. Render ONLY the events for this specific day
                    renderUpcomingEvents(daysEvents);
                    
                    // 4. Update the Tab Text to show context
                    const upcomingBtn = document.querySelector('.events-tabs .tab-btn:first-child');
                    if(upcomingBtn) {
                        upcomingBtn.textContent = `Events on ${monthNames[month]} ${i}`;
                        upcomingBtn.classList.add('active'); // Ensure it stays highlighted
                    }
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
    
    // Update banner to show random event from this month if available
    if(eventsInThisMonth.length > 0) {
       // Optional: updateFeaturedBannerForMonth(eventsInThisMonth);
    }
}

function previousMonth() { calendarDate.setMonth(calendarDate.getMonth() - 1); renderCalendar(allEventsData); }
function nextMonth() { calendarDate.setMonth(calendarDate.getMonth() + 1); renderCalendar(allEventsData); }


// --- 3. UPCOMING EVENTS LIST ---
function renderUpcomingEvents(events) {
    const upcomingList = document.getElementById('upcoming'); 
    if (!upcomingList) return; 

    const activeEventsOnly = events.filter(e => e.status === 'Active');

    upcomingList.innerHTML = '';
    if (events.length === 0) { 
        upcomingList.innerHTML = `<div style="text-align: center; padding: 40px 20px; color: #64748b;"> <p>No events found.</p> </div>`; 
        return; 
    }

    const now = new Date(); 
    now.setHours(0,0,0,0);

    events.forEach(event => {
        const eventDate = new Date(event.date);
        const dateString = eventDate.toLocaleDateString('en-US', { weekday:'long', month:'short', day:'numeric' });
        
        // Ensure category is lowercase for CSS matching
        const category = (event.category || 'academic').toLowerCase();
        
        const isPast = eventDate < now;
        const eventCard = document.createElement('div');
        eventCard.className = `event-list-item ${category}`;
        eventCard.style.cursor = 'pointer'; 
        eventCard.style.position = 'relative';

        // HTML for Card
        if (isPast) {
            eventCard.style.opacity = '0.8'; 
            eventCard.style.backgroundColor = '#f8fafc';
            eventCard.innerHTML = `
                <div class="event-color-indicator ${category}" style="background-color:#94a3b8;"></div>
                <div class="event-item-content">
                    <h4 class="event-item-title" style="color:#64748b; text-decoration: line-through;">${event.title}</h4>
                    <p class="event-item-date">Ended • ${dateString}</p>
                    <p class="event-item-time">${event.time}</p>
                </div>
                <div style="background:#e2e8f0; color:#475569; font-size:11px; font-weight:600; padding:4px 8px; border-radius:4px; height:fit-content;">Done</div>
            `;
        } else {
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
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 2v16l8-5 8 5V2H4z"/></svg>
                </button>
            `;
            
            // Save Button Logic
            const saveBtn = eventCard.querySelector('.save-event-btn');
            if (saveBtn) {
                saveBtn.addEventListener('click', (e)=> { 
                    e.stopPropagation(); 
                    toggleSaveEvent(e, event._id); 
                });
            }
        }
        
        eventCard.addEventListener('click', () => openEventDetail_DYNAMIC(event._id));
        upcomingList.appendChild(eventCard);
    });
}

// --- 4. SAVED EVENTS LIST ---
function renderSavedEvents() {
    const savedList = document.getElementById('saved');
    if (!savedList) return;

    savedList.innerHTML = '';
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    // Filter Active events that are also saved
    const savedEvents = allEventsData.filter(event =>
        mySavedEventIds.includes(event._id) && new Date(event.date) >= now
    );

    if (savedEvents.length === 0) {
        savedList.innerHTML = '<p style="text-align: center; color: #999; padding: 30px 20px;">No saved events.</p>';
        return;
    }

    savedEvents.forEach(event => {
        const dateString = new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        const category = (event.category || 'academic').toLowerCase();

        const card = document.createElement('div');
        card.className = `event-list-item ${category}`;

        card.innerHTML = `
            <div class="event-color-indicator ${category}"></div>
            <div class="event-item-content" style="cursor:pointer;">
                <h4 class="event-item-title">${event.title}</h4>
                <p class="event-item-date">Saved • ${dateString}</p>
            </div>
            <button class="save-event-btn active">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 2v16l8-5 8 5V2H4z"/></svg>
            </button>
        `;

        card.querySelector('.event-item-content').addEventListener('click', () => openEventDetail_DYNAMIC(event._id));

        const unsaveBtn = card.querySelector('.save-event-btn');
        unsaveBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (confirm('Remove from saved list?')) {
                toggleSaveEvent(e, event._id);
            }
        });

        savedList.appendChild(card);
    });
}

// --- 5. HISTORY LIST ---
function renderHistoryEvents() {
    const historyList = document.getElementById('history');
    if (!historyList) return;
    historyList.innerHTML = '';
    
    const now = new Date();
    // Show events I registered for that are in the past
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
        const category = (event.category || 'academic').toLowerCase();

        const card = document.createElement('div');
        card.className = `event-list-item ${category}`;
        card.style.opacity = '0.8';
        card.style.backgroundColor = '#f8fafc';
        card.style.cursor = 'pointer';
        card.innerHTML = `
             <div class="event-color-indicator ${category}" style="background-color:#94a3b8;"></div>
             <div class="event-item-content">
                <h4 class="event-item-title" style="color:#64748b; text-decoration: line-through;">${event.title}</h4>
                <p class="event-item-date">Completed • ${dateString}</p>
             </div>
             <div style="background:#e2e8f0; color:#475569; font-size:11px; font-weight:600; padding:4px 8px; border-radius:4px;">Done</div>
        `;
        card.addEventListener('click', () => openEventDetail_DYNAMIC(event._id));
        historyList.appendChild(card);
    });
}

// --- 6. UTILITY: SEARCH & TABS ---
function searchEvents(query) {
    const lowerQuery = query.toLowerCase().trim();
    if (!lowerQuery) {
        document.querySelector('.events-tabs .tab-btn:first-child').textContent = 'Upcoming Events';
        const now = new Date(); now.setHours(0,0,0,0);
        const futureEvents = allEventsData.filter(e => new Date(e.date) >= now);
        renderUpcomingEvents(futureEvents);
        return;
    }
    const filteredEvents = allEventsData.filter(event => {
        const matchesTitle = event.title.toLowerCase().includes(lowerQuery);
        const matchesLoc = event.location.toLowerCase().includes(lowerQuery);
        return matchesTitle || matchesLoc;
    });
    switchTab('upcoming');
    const firstBtn = document.querySelector('.events-tabs .tab-btn:first-child');
    firstBtn.textContent = `Results (${filteredEvents.length})`;
    renderUpcomingEvents(filteredEvents);
}

// Updated switchTab to allow manual list overrides
function switchTab(tabName, preventRender = false) {
    // 1. Update Buttons CSS
    document.querySelectorAll('.events-tabs .tab-btn').forEach(btn => {
        btn.classList.remove('active');
        // Reset the text of the first button unless we are preventing render (which means we are in a specific view)
        if (!preventRender && (btn.textContent.includes('Events on') || btn.textContent.includes('Results'))) {
            btn.textContent = 'Upcoming Events';
        }
    });

    // 2. Highlight the correct tab button
    // Find the button that calls this function (if triggered by click) or select manually
    const targetBtn = document.querySelector(`.events-tabs .tab-btn[onclick*="'${tabName}'"]`);
    if (targetBtn) targetBtn.classList.add('active');

    // 3. Update Tab Content Visibility
    document.getElementById('upcoming').classList.remove('active');
    document.getElementById('saved').classList.remove('active');
    document.getElementById('history').classList.remove('active');

    document.getElementById(tabName).classList.add('active');

    // 4. Render Logic (Only run if NOT prevented)
    if (tabName === 'upcoming' && !preventRender) {
        const upcomingBtn = document.querySelector('.events-tabs .tab-btn:first-child');
        if (upcomingBtn) upcomingBtn.textContent = 'Upcoming Events';
        
        if (document.getElementById('eventSearchInput')) {
            document.getElementById('eventSearchInput').value = '';
        }

        const now = new Date(); 
        now.setHours(0, 0, 0, 0);
        const futureEvents = allEventsData.filter(e => new Date(e.date) >= now);
        
        renderUpcomingEvents(futureEvents);
        
        // Remove selection border from calendar since we are showing ALL events
        document.querySelectorAll('.calendar-day').forEach(d => d.style.border = 'none');
    }
}

// --- 7. FEATURED EVENT ---
function renderFeaturedEvent(event) {
    const banner = document.querySelector('.featured-event-banner');
    const featuredTitle = document.querySelector('.featured-title');
    const featuredDetails = document.querySelector('.featured-details');
    const viewDetailsBtn = document.querySelector('.view-details-btn');

    if (!banner || !featuredTitle || !featuredDetails) return;
    
    if(!event || !event._id) {
        // Fallback state
        featuredTitle.textContent = "No Upcoming Events";
        featuredDetails.textContent = "Check back later!";
        banner.style.background = `linear-gradient(135deg, #64748b, #94a3b8)`;
        if (viewDetailsBtn) viewDetailsBtn.style.display = 'none';
        return;
    }

    // 1. Populate Text
    const eventDate = new Date(event.date);
    const dateString = eventDate.toLocaleDateString('en-US', { weekday:'long', month:'long', day:'numeric', year:'numeric' });
    featuredTitle.textContent = event.title;
    featuredDetails.textContent = `${dateString} · ${event.location}`;
    
    if (viewDetailsBtn) {
        viewDetailsBtn.style.display = 'block';
        viewDetailsBtn.onclick = () => openEventDetail_DYNAMIC(event._id);
    }

    // 2. Determine Gradient Color based on Category
    // We use RGBA to allow the image to show through
    const category = (event.category || 'academic').toLowerCase();
    let gradientColors;

    switch (category) {
        case 'academic': 
            // Orange Gradient
            gradientColors = 'rgba(245, 158, 11, 0.85), rgba(245, 158, 11, 0.4)'; 
            break;
        case 'community': 
            // Purple Gradient
            gradientColors = 'rgba(155, 89, 182, 0.85), rgba(155, 89, 182, 0.4)'; 
            break;
        case 'institutional': 
            // Grey Gradient
            gradientColors = 'rgba(100, 116, 139, 0.9), rgba(100, 116, 139, 0.5)'; 
            break;
        case 'recreation': 
            // Blue Gradient
            gradientColors = 'rgba(59, 130, 246, 0.85), rgba(59, 130, 246, 0.4)'; 
            break;
        case 'culture': 
            // Pink Gradient
            gradientColors = 'rgba(233, 30, 99, 0.85), rgba(233, 30, 99, 0.4)'; 
            break;
        default: 
            // Default Blue
            gradientColors = 'rgba(44, 62, 127, 0.9), rgba(44, 62, 127, 0.5)';
    }

    // 3. Get Image (Use Placehold.co if missing)
    const imgUrl = event.imageUrl || 'https://placehold.co/1200x600?text=QCU+Event';

    // 4. Apply Combined Background
    // This creates a gradient from Left (Strong Color) to Right (Transparent/Light Color) over the image
    banner.style.background = `
        linear-gradient(to right, ${gradientColors}),
        url('${imgUrl}')
    `;
}

// --- 8. SAVE TOGGLE LOGIC ---
async function toggleSaveEvent(e, eventId) {
    if (e) e.stopPropagation();
    const studentId = localStorage.getItem('currentStudentId');
    if (!studentId) { alert('Please submit a counseling form first to set your Student ID.'); return; }
    
    // Optimistic UI Update
    const index = mySavedEventIds.indexOf(eventId);
    if (index > -1) mySavedEventIds.splice(index,1); else mySavedEventIds.push(eventId);
    
    // Re-render immediately
    const now = new Date(); now.setHours(0,0,0,0);
    const futureEvents = allEventsData.filter(event => new Date(event.date) >= now);
    renderUpcomingEvents(futureEvents); 
    renderSavedEvents();

    try {
        await fetch('http://localhost:3001/api/saved-events/toggle', 
            { method:'POST', headers:{'Content-Type':'application/json'}, 
            body: JSON.stringify({ studentId, eventId }) });
    } catch (error) {
         console.error('Error toggling save:', error); 
         // Revert on error
        if (index > -1) mySavedEventIds.push(eventId); 
        else mySavedEventIds.splice(mySavedEventIds.indexOf(eventId),1); 
        renderUpcomingEvents(futureEvents); renderSavedEvents(); 
    }
}

// --- 9. EVENT DETAILS MODAL ---
function openEventDetail_DYNAMIC(eventId) {
    const event = allEventsData.find(e => e._id === eventId);
    if (!event) return;
    currentEventId = eventId;
    
    const container = document.getElementById('eventDetailContent'); 
    if (!container) return;

    const eventDate = new Date(event.date);
    const dateString = eventDate.toLocaleDateString('en-US', { weekday:'long', month:'long', day:'numeric', year:'numeric' });
    
    const isRegistered = myRegistrations.includes(eventId);
    let registerBtnHTML = ''
        
    if (event.status === 'Archived') {
        // Case 1: Event is Archived/Past -> Disable Button
        registerBtnHTML = `
            <button type="button" disabled style="background:#e2e8f0; color:#64748b; border:1px solid #cbd5e1; padding:12px 20px; border-radius:6px; cursor:not-allowed; font-weight:600;">
                🔒 Event Ended
            </button>`;
    } 
    else if (isRegistered) {
        // Case 2: Already Registered
        registerBtnHTML = `
            <button type="button" disabled style="background:#ecfdf5; color:#10b981; border:1px solid #10b981; padding:12px 20px; border-radius:6px; cursor:default; font-weight:600;">
                ✓ Already Registered
            </button>`;
    } 
    else {
        // Case 3: Open for Registration
        registerBtnHTML = `
            <button type="button" class="learn-more-btn" style="background:#2c3e7f;color:#fff;padding:12px 20px;border-radius:6px;border:0;cursor:pointer;" onclick="openRegistrationModal('${event._id}','${event.title}')">
                Register Now
            </button>`;
    }
    // Use placeholder if image is missing
    const bannerImg = event.imageUrl || 'https://placehold.co/800x300?text=Event';

    // Parse Agenda & Expectations safely
    const agendaHTML = (event.agenda && event.agenda.length > 0) 
        ? event.agenda.map((item, idx) => `
            <div style="display:flex;gap:12px;margin-bottom:12px; align-items: center;">
                <div style="background:#2c3e7f;color:#fff;border-radius:50%;width:32px;height:32px;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-weight:600;font-size:12px;">${idx+1}</div>
                <div>
                    <div style="font-weight:700;color:#2c3e7f;font-size:13px;">${item.time}</div>
                    <div style="color:#666;font-size:13px;">${item.title}</div>
                </div>
            </div>`).join('') 
        : '<p style="color:#999;font-style:italic;">No detailed agenda provided.</p>';

    const expectationsHTML = (event.expectations && event.expectations.length > 0) 
        ? event.expectations.map(exp => `<li style="display:flex;align-items:flex-start;gap:10px;margin-bottom:8px;"><span style="color:#2c3e7f;font-weight:bold;">✓</span><span style="color:#555;font-size:14px;">${exp}</span></li>`).join('') 
        : '<li style="color:#999;font-style:italic;">No specific expectations listed.</li>';

    container.innerHTML = `
        <div style="background: url('${bannerImg}') no-repeat center center; background-size: cover; height:200px; border-radius:8px; margin-bottom:20px;"></div>
        <p style="color:#666; font-size:13px; margin-bottom:16px;">Organized by ${event.organizer || 'QCU Student Services'}</p>
        <div style="display:grid; grid-template-columns: 1fr 1fr; gap: 20px 40px; background:#f8fafc; padding:20px; border-radius:8px; border:1px solid #e2e8f0; margin-bottom:24px;">
            <div><div style="color:#2c3e7f; font-weight:700; font-size:12px; text-transform:uppercase;">Date</div><div style="color:#334155; font-size:13px; font-weight:500;">${dateString}</div></div>
            <div><div style="color:#2c3e7f; font-weight:700; font-size:12px; text-transform:uppercase;">Time</div><div style="color:#334155; font-size:13px; font-weight:500;">${event.time}</div></div>
            <div><div style="color:#2c3e7f; font-weight:700; font-size:12px; text-transform:uppercase;">Location</div><div style="color:#334155; font-size:13px; font-weight:500;">${event.location}</div></div>
            <div><div style="color:#2c3e7f; font-weight:700; font-size:12px; text-transform:uppercase;">Capacity</div><div style="color:#334155; font-size:13px; font-weight:500;">${event.registered || 0}/${event.capacity}</div></div>
        </div>
        <h3 style="color:#1e293b; font-size:16px; font-weight:700; margin-bottom:10px;">About this Event</h3>
        <p style="color:#64748b; font-size:14px; line-height:1.6; margin-bottom:24px;">${event.description || event.about || 'No description available.'}</p>
        
        <h3 style="color:#1e293b; font-size:16px; font-weight:700; margin-bottom:12px;">Event Agenda</h3>
        <div style="background:#fff; border:1px solid #e2e8f0; border-radius:8px; padding:16px; margin-bottom:24px;">${agendaHTML}</div>
        
        <h3 style="color:#1e293b; font-size:16px; font-weight:700; margin-bottom:12px;">What to Expect?</h3>
        <ul style="list-style:none; padding:0; margin:0 0 24px 0;">${expectationsHTML}</ul>
        
        ${event.requirements ? `<div style="color:#4b5563; font-size:13px; background:#eff6ff; padding:12px 16px; border-radius:6px; border-left:4px solid #3b82f6;"><strong style="color:#1e40af;">⚠️ Requirement:</strong> ${event.requirements}</div>` : ''}
        
        <div style="display:flex; justify-content:flex-end; gap:12px; margin-top:30px; border-top:1px solid #e2e8f0; padding-top:20px;">
            <button type="button" style="background:#fff; color:#64748b; border:1px solid #cbd5e1; padding:12px 20px; border-radius:6px; cursor:pointer; font-weight:500;" onclick="closeEventDetailModal()">Back</button>
            ${registerBtnHTML}
        </div>
    `;
    const modal = document.getElementById('eventDetailModal');
    modal.setAttribute('aria-hidden','false'); modal.classList.add('open');
}

function closeEventDetailModal() {
    const modal = document.getElementById('eventDetailModal'); 
    if (!modal) return; modal.setAttribute('aria-hidden','true'); 
    modal.classList.remove('open');
}

// --- 10. NOTIFICATIONS & REGISTRATION MODAL (Unchanged Logic) ---




async function markAllEventsAsRead(e) {
    if (e) e.preventDefault();
    const studentId = localStorage.getItem('currentStudentId');
    if (!studentId) return;
    try {
        await fetch(`http://localhost:3001/api/notifications/mark-read/${studentId}`, { method: 'PATCH' });
        updateSidebarLatest(studentId);
    } catch (err) { console.error(err); }
}

function openRegistrationModal(id, title) {
    if (event) event.stopPropagation();
    const modal = document.getElementById('registrationModal');
    const messageEl = document.getElementById('registrationEventName');
    if (!modal || !messageEl) return;
    messageEl.innerHTML = `Are you sure you want to register for <strong>${title}</strong>?`;
    modal.dataset.eventId = id;
    modal.dataset.eventTitle = title;
    modal.setAttribute('aria-hidden', 'false');
    modal.classList.add('open');
}

async function confirmRegistration() {
    const modal = document.getElementById('registrationModal');
    const eventId = modal.dataset.eventId;
    const eventTitle = modal.dataset.eventTitle;
    const studentId = localStorage.getItem('currentStudentId');

    if (!studentId) { alert('Please complete the counseling form to set your Student ID.'); return; }

    try {
        const response = await fetch('http://localhost:3001/api/registrations', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ eventId, eventTitle, studentId })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Server error');

        alert('Registration successful!');
        closeRegistrationModal();
        const detailModal = document.getElementById('eventDetailModal');
        if (detailModal && detailModal.classList.contains('open')) closeEventDetailModal();
        
        fetchAndInitializeEvents(); // Reload
    } catch (error) { console.error('Error:', error); alert(error.message); }
}

function closeRegistrationModal() {
    const modal = document.getElementById('registrationModal');
    if (!modal) return;
    modal.setAttribute('aria-hidden', 'true');
    modal.classList.remove('open');
}

// INITIALIZE
document.addEventListener('DOMContentLoaded', fetchAndInitializeEvents);

// --- ANNOUNCEMENTS LOGIC ---

// ==========================================
//   UNIFIED SIDEBAR LOGIC (NOTIFICATIONS + ANNOUNCEMENTS)
// ==========================================

async function updateSidebarLatest(studentId) {
    const container = document.getElementById('latestItems');
    if (!container) return;

    container.innerHTML = '<p style="font-size:12px; color:#999; padding:10px;">Loading updates...</p>';

    try {
        // 1. Fetch BOTH in parallel
        const [notifications, announcements] = await Promise.all([
            fetchNotificationsData(studentId),
            fetchAnnouncementsData()
        ]);

        // 2. Combine arrays
        const combinedItems = [...notifications, ...announcements];

        // 3. Sort by Date (Newest First)
        combinedItems.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        // 4. Render
        container.innerHTML = '';

        if (combinedItems.length === 0) {
            container.innerHTML = '<p style="font-size:12px; color:#999; padding:10px;">No new updates.</p>';
            return;
        }

        combinedItems.forEach(item => {
            // Determine if it is an Announcement or a Notification
            // Announcements have a 'title' field, Notifications usually just have 'message'
            const isAnnouncement = item.title !== undefined; 
            
            const card = document.createElement('div');
            const readClass = (item.isRead === false) ? '' : 'read'; // Only notifications track 'read' status
            card.className = `latest-item ${readClass}`;
            
            const dateStr = new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

            if (isAnnouncement) {
                // --- RENDER ANNOUNCEMENT STYLE ---
                card.innerHTML = `
                    <div class="notif-icon" style="background-color: #e3f2fd; display: flex; align-items: center; justify-content: center; width: 30px; height: 30px; border-radius: 50%;">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2d5aa8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M11.6 3.4l-.8-.8a1.5 1.5 0 0 0-2.1 0l-.8.8a1.5 1.5 0 0 1-1 .4H3a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h4a1.5 1.5 0 0 1 1 .4l.8.8a1.5 1.5 0 0 0 2.1 0l.8-.8a1.5 1.5 0 0 1 1-.4h.4"></path>
                            <path d="M22 13.5c0 2.5-2 4.5-4.5 4.5h-2.1a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h2.1A4.5 4.5 0 0 1 22 10.5v3z"></path>
                        </svg>
                    </div>
                    <div class="notif-content" style="flex: 1;">
                        <span class="notif-message" style="font-weight:700; color:#333; display:block;">${item.title}</span>
                        <span class="notif-message" style="font-size:12px; color:#666; display:block; margin-top:2px;">${item.content}</span>
                        <span class="notif-time" style="font-size:10px; color:#999; margin-top:4px; display:block;">${dateStr}</span>
                    </div>
                `;
            } else {
                // --- RENDER NOTIFICATION STYLE ---
                card.innerHTML = `
                    <div class="notif-icon">
                        <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="#f59e0b" stroke-width="1.5">
                            <path d="M10 2l2.4 4.8h5.2l-4.2 3.2 1.6 4.8-4-3.2-4 3.2 1.6-4.8-4.2-3.2h5.2z"/>
                        </svg>
                    </div>
                    <div class="notif-content">
                        <span class="notif-message">${item.message}</span>
                        <span class="notif-time">${dateStr}</span>
                    </div>
                    ${!item.isRead ? `<div class="unread-dot"></div>` : ''}
                `;
            }

            container.appendChild(card);
        });

    } catch (error) {
        console.error("Error updating sidebar:", error);
    }
}

// --- HELPER FETCHERS (Just return data, don't render) ---

async function fetchNotificationsData(studentId) {
    if (!studentId) return [];
    try {
        const response = await fetch(`http://localhost:3001/api/notifications/${studentId}`);
        if (!response.ok) return [];
        return await response.json();
    } catch (e) {
        console.error("Notif fetch error", e);
        return [];
    }
}

async function fetchAnnouncementsData() {
    try {
        const response = await fetch('http://localhost:3001/api/event-announcements');
        if (!response.ok) return [];
        const data = await response.json();
        // Only show Published
        return data.filter(a => a.status === 'Published');
    } catch (e) {
        console.error("Announcement fetch error", e);
        return [];
    }
}

function renderAnnouncements(announcements) {
    const container = document.getElementById('latestItems');
    if (!container) return;

    // Remove "Loading..." text if it's there
    if (container.innerHTML.includes('Loading notifications')) {
        container.innerHTML = '';
    }

    if (announcements.length === 0) return;

    announcements.forEach(announcement => {
        const item = document.createElement('div');
        item.className = 'latest-item'; 
        
        const dateStr = new Date(announcement.createdAt).toLocaleDateString('en-US', {
            month: 'short', day: 'numeric'
        });

        // Megaphone Icon for Announcements
        item.innerHTML = `
            <div class="notif-icon" style="background-color: #e3f2fd; display: flex; align-items: center; justify-content: center; width: 30px; height: 30px; border-radius: 50%;">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2d5aa8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    <path d="M11.6 3.4l-.8-.8a1.5 1.5 0 0 0-2.1 0l-.8.8a1.5 1.5 0 0 1-1 .4H3a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h4a1.5 1.5 0 0 1 1 .4l.8.8a1.5 1.5 0 0 0 2.1 0l.8-.8a1.5 1.5 0 0 1 1-.4h.4"></path>
                    <path d="M22 13.5c0 2.5-2 4.5-4.5 4.5h-2.1a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h2.1A4.5 4.5 0 0 1 22 10.5v3z"></path>
                </svg>
            </div>
            <div class="notif-content" style="flex: 1;">
                <span class="notif-message" style="font-weight:700; color:#333; display:block;">${announcement.title}</span>
                <span class="notif-message" style="font-size:12px; color:#666; display:block; margin-top:2px;">${announcement.content}</span>
                <span class="notif-time" style="font-size:10px; color:#999; margin-top:4px; display:block;">${dateStr}</span>
            </div>
        `;

        // Prepend adds it to the TOP of the list
        container.prepend(item);
    });
}

// --- BADGE SYNC LOGIC ---

function getSeenScheduledIds() {
    const seen = localStorage.getItem('seenScheduledSessions');
    return seen ? JSON.parse(seen) : [];
}

async function updateMySessionsBadge() {
    const badge = document.getElementById('session-badge'); // Ensure HTML has this ID on the card
    if (!badge) return;

    const studentId = localStorage.getItem('currentStudentId');
    if (!studentId) return;

    try {
        // We need to fetch counseling data here to know the count
        const response = await fetch(`http://localhost:3001/api/counseling/my-appointments/${studentId}`);
        if (!response.ok) return;
        
        const sessions = await response.json();
        const seenIds = getSeenScheduledIds();

        // Count sessions that are 'Scheduled' AND NOT in 'seenIds'
        const unreadCount = sessions.filter(s => 
            s.status === 'Scheduled' && !seenIds.includes(s._id)
        ).length;

        if (unreadCount > 0) {
            badge.textContent = unreadCount;
            badge.style.display = 'block';
        } else {
            badge.style.display = 'none';
        }

    } catch (error) {
        console.error("Error updating badge:", error);
    }
}