
// Events page logic: calendar, event lists, saved events, registrations, notifications

let allEventsData = [];
let mySavedEventIds = [];
let myRegistrations = [];
let currentEventId = null;
let calendarDate = new Date();

const categoryColors = {
    academic: '#f59e0b',
    community: '#9b59b6',
    institutional: '#64748b',
    recreation: '#3b82f6',
    culture: '#e91e63',
    default: '#2c3e7f'
};

function renderHistoryEvents() {
    const historyList = document.getElementById('history');
    if (!historyList) return;
    historyList.innerHTML = '';
    const now = new Date();
    const pastEvents = allEventsData.filter(event => {
        const eventDate = new Date(event.date);
        return myRegistrations.includes(event._id) && eventDate < now;
    });
    if (pastEvents.length === 0) {
        historyList.innerHTML = '<p style="text-align: center; color: #999; padding: 30px 20px;">No past events attended.</p>';
        return;
    }
    pastEvents.forEach(event => {
        const dateString = new Date(event.date).toLocaleDateString('en-US', {
             month: 'short', day: 'numeric', year: 'numeric' 
            });

        const card = document.createElement('div');
        card.className = `event-list-item ${event.category || 'academic'}`;
        card.style.opacity = '0.8';
        card.style.backgroundColor = '#f8fafc';
        card.style.cursor = 'pointer';
        card.innerHTML = `
             <div class="event-color-indicator ${event.category || 'academic'}" style="background-color:#94a3b8;"></div>
             <div class="event-item-content">
                <h4 class="event-item-title" style="color:#64748b; text-decoration: line-through;">${event.title}</h4>
                <p class="event-item-date">Completed • ${dateString}</p>
             </div>
             <div style="background:#e2e8f0; color:#475569; font-size:11px; font-weight:600; padding:4px 8px; border-radius:4px;">Done</div>
        `;
        card.addEventListener('click', 
            () => openEventDetail_DYNAMIC(event._id));
        historyList.appendChild(card);
    });
}

function renderCalendar(events) {
    const calendarDays = document.querySelector('.calendar-days');
    const calendarTitle = document.querySelector('.calendar-title');
    if (!calendarDays || !calendarTitle) return;
    const year = calendarDate.getFullYear();
    const month = calendarDate.getMonth();
    const monthNames = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December"
    ];
    calendarTitle.textContent = `${monthNames[month]} ${year}`;
    const firstDayIndex = new Date(year, month, 1).getDay();
    const adjustedFirstDay = (firstDayIndex === 0 ? 6 : firstDayIndex - 1);
    const lastDay = new Date(year, month + 1, 0).getDate();
    calendarDays.innerHTML = '';
    const eventsInThisMonth = [];
    for (let i = 0; i < adjustedFirstDay; i++) calendarDays.innerHTML += `<div class="calendar-day empty"></div>`;
    for (let i = 1; i <= lastDay; i++) {
        const dayDiv = document.createElement('div');
        dayDiv.className = 'calendar-day';
        dayDiv.textContent = i;
        const daysEvents = events.filter(event => {
            const eDate = new Date(event.date);
            return eDate.getDate() === i && eDate.getMonth() === month && eDate.getFullYear() === year;
        });
        if (daysEvents.length > 0) {
            eventsInThisMonth.push(...daysEvents);
            dayDiv.style.cursor = 'pointer';
            dayDiv.classList.add('has-event');
            if (daysEvents.length === 1) {
                const cat = daysEvents[0].category || 'academic';
                dayDiv.classList.add(cat);
            } else {
                const colors = daysEvents.map(e => categoryColors[e.category] || categoryColors.default);
                const uniqueColors = [...new Set(colors)];
                if (uniqueColors.length === 1) dayDiv.style.backgroundColor = uniqueColors[0];
                else dayDiv.style.background = `linear-gradient(135deg, ${uniqueColors.join(', ')})`;
            }
            dayDiv.addEventListener('click', () => {
                if (daysEvents.length === 1) openEventDetail_DYNAMIC(daysEvents[0]._id);
                else {
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
        const today = new Date();
        if (i === today.getDate() && month === today.getMonth() && year === today.getFullYear()) {
            dayDiv.classList.add('today'); if (daysEvents.length === 0) dayDiv.style.border = "2px solid #2c3e7f";
        }
        calendarDays.appendChild(dayDiv);
    }
    updateFeaturedBannerForMonth(eventsInThisMonth);
}

function updateFeaturedBannerForMonth(monthEvents) {
    const bannerSection = document.querySelector('.featured-event-banner');
    const btn = document.querySelector('.view-details-btn');
    if (monthEvents.length === 0) {
        renderFeaturedEvent({ title: "No Featured Events", date: calendarDate, location: "Campus Wide", imageUrl: "", _id: null });
        if (btn) btn.style.display = 'none';
        return;
    }
    if (btn) btn.style.display = 'block';
    monthEvents.sort((a,b)=> new Date(a.date)-new Date(b.date));
    renderFeaturedEvent(monthEvents[0]);
}

function previousMonth() { calendarDate.setMonth(calendarDate.getMonth() - 1); renderCalendar(allEventsData); }
function nextMonth() { calendarDate.setMonth(calendarDate.getMonth() + 1); renderCalendar(allEventsData); }

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
    document.getElementById('upcoming').classList.add('active');
    document.getElementById('saved').classList.remove('active');
    document.getElementById('history').classList.remove('active');
    document.querySelectorAll('.events-tabs .tab-btn').forEach(btn => btn.classList.remove('active'));
    const firstBtn = document.querySelector('.events-tabs .tab-btn:first-child');
    firstBtn.classList.add('active');
    firstBtn.textContent = `Search Results (${filteredEvents.length})`;
    renderUpcomingEvents(filteredEvents);
}

function renderFeaturedEvent(event) {
    const featuredTitle = document.querySelector('.featured-title');
    const featuredDetails = document.querySelector('.featured-details');
    if (!featuredTitle || !featuredDetails) return;
    const eventDate = new Date(event.date);
    const dateString = eventDate.toLocaleDateString('en-US', { weekday:'long', month:'long', day:'numeric', year:'numeric' });
    featuredTitle.textContent = event.title;
    featuredDetails.textContent = `${dateString} · ${event.location}`;
    const viewDetailsBtn = document.querySelector('.view-details-btn');
    if (viewDetailsBtn) viewDetailsBtn.onclick = () => openEventDetail_DYNAMIC(event._id);
}

async function fetchAndInitializeEvents() {
    try {
        const studentId = localStorage.getItem('currentStudentId');
        const eventsResponse = await fetch('http://localhost:3001/api/events');
        allEventsData = await eventsResponse.json();
        if (studentId) {
            try {
                const regResponse = await fetch(`http://localhost:3001/api/registrations/my-registrations/${studentId}`);
                const regData = await regResponse.json();
                myRegistrations = regData.map(r => r.eventId);
            } catch (err) { console.warn('Could not fetch registrations', err); myRegistrations = []; }
            try { const saveResponse = await fetch(`http://localhost:3001/api/saved-events/${studentId}`);
            mySavedEventIds = await saveResponse.json(); 
        } catch (err) {
             console.warn('Could not fetch saved events', err); mySavedEventIds = [];
             }
            fetchNotifications(studentId);
        }
        renderUpcomingEvents(allEventsData);
        const now = new Date(); now.setHours(0,0,0,0);
        const futureEvents = allEventsData.filter(event => new Date(event.date) >= now);
        renderUpcomingEvents(futureEvents);
        renderSavedEvents();
        renderHistoryEvents();
        if (allEventsData.length > 0) { renderFeaturedEvent(allEventsData[0]); renderCalendar(allEventsData); }
    } catch (error) { console.error('Error initializing events:', error); }
}

function openEventDetail_DYNAMIC(eventId) {
    const event = allEventsData.find(e => e._id === eventId);
    if (!event) { 
        console.error('Event not found:', eventId); 
        return; 
    }
    currentEventId = eventId;
    const container = document.getElementById('eventDetailContent'); 
    if (!container) 
        return;
    const eventDate = new Date(event.date);
    const dateString = eventDate.toLocaleDateString('en-US', 
        { weekday:'long', month:'long', day:'numeric', year:'numeric' }
    );
    const isRegistered = myRegistrations.includes(eventId);
    let registerBtnHTML = '';
    if (isRegistered) registerBtnHTML = `<button type="button" disabled style="background:#ecfdf5; color:#10b981; border:1px solid #10b981; padding:12px 20px; border-radius:6px; cursor:default; font-weight:600;">✓ Already Registered</button>`;
    else registerBtnHTML = `<button type="button" class="learn-more-btn" style="background:#2c3e7f;color:#fff;padding:12px 20px;border-radius:6px;border:0;cursor:pointer;" onclick="openRegistrationModal('${event._id}','${event.title}')">Register Now</button>`;
    const agendaHTML = (event.agenda && event.agenda.length > 0) ? event.agenda.map((item, idx) => `
            <div style="display:flex;gap:12px;margin-bottom:12px; align-items: center;">
                <div style="background:#2c3e7f;color:#fff;border-radius:50%;width:32px;height:32px;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-weight:600;font-size:12px;">${idx+1}</div>
                <div>
                    <div style="font-weight:700;color:#2c3e7f;font-size:13px;">${item.time}</div>
                    <div style="color:#666;font-size:13px;">${item.title}</div>
                </div>
            </div>`).join('') : '<p style="color:#999;font-style:italic;">No detailed agenda provided.</p>';
    const expectationsHTML = (event.expectations && event.expectations.length > 0) ? event.expectations.map(exp => `<li style="display:flex;align-items:flex-start;gap:10px;margin-bottom:8px;"><span style="color:#2c3e7f;font-weight:bold;">✓</span><span style="color:#555;font-size:14px;">${exp}</span></li>`).join('') : '<li style="color:#999;font-style:italic;">No specific expectations listed.</li>';
    const requirementsHTML = event.requirements ? `<p style="color:#4b5563; font-size:13px; line-height:1.5; background:#eff6ff; padding:12px 16px; border-radius:6px; border-left:4px solid #3b82f6; margin-top:4px;"><strong style="color:#1e40af;">⚠️ Requirement:</strong> ${event.requirements}</p>` : '';
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
        <div style="background:#fff; border:1px solid #e2e8f0; border-radius:8px; padding:16px; margin-bottom:24px;">${agendaHTML}</div>
        <h3 style="color:#1e293b; font-size:16px; font-weight:700; margin-bottom:12px;">What to Expect?</h3>
        <ul style="list-style:none; padding:0; margin:0 0 24px 0;">${expectationsHTML}</ul>
        ${event.requirements ? `<h3 style="color:#1e293b; font-size:16px; font-weight:700; margin-bottom:12px;">Requirements</h3>` : ''}
        ${requirementsHTML}
        <div style="display:flex; justify-content:flex-end; gap:12px; margin-top:30px; border-top:1px solid #e2e8f0; padding-top:20px;">
            <button type="button" style="background:#fff; color:#64748b; border:1px solid #cbd5e1; padding:12px 20px; border-radius:6px; cursor:pointer; font-weight:500;" onclick="closeEventDetailModal()">Back to Calendar</button>
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

function renderUpcomingEvents(events) {
    const upcomingList = document.getElementById('upcoming'); 
    if (!upcomingList) 
        return; 

    upcomingList.innerHTML = '';
    if (events.length === 0) { 
        upcomingList.innerHTML = `<div style="text-align: center; padding: 40px 20px; color: #64748b;"> <p>No events found.</p> </div>`; 
        return; 
    }
    const now = new Date(); 
    now.setHours(0,0,0,0);
    events.forEach(event => {
        const eventDate = new Date(event.date);
        const dateString = eventDate.toLocaleDateString('en-US', 
            { weekday:'long', month:'short', day:'numeric' }
        );
        const category = event.category || 'academic';
        const isPast = eventDate < now;
        const eventCard = document.createElement('div');
        eventCard.className = `event-list-item ${category}`;
        eventCard.style.cursor = 'pointer'; eventCard.style.position = 'relative';
        if (isPast) {
            eventCard.style.opacity = '0.8'; eventCard.style.backgroundColor = '#f8fafc';
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
            const saveBtn = eventCard.querySelector('.save-event-btn');
            if (saveBtn) 
                saveBtn.addEventListener('click', 
            (e)=>{ e.stopPropagation(); toggleSaveEvent(e, event._id); 

            });
        }
        eventCard.addEventListener('click', () => openEventDetail_DYNAMIC(event._id));
        upcomingList.appendChild(eventCard);
    });
}

async function toggleSaveEvent(e, eventId) {
    if (e) e.stopPropagation();
    const studentId = localStorage.getItem('currentStudentId');
    if (!studentId) { alert('Please submit a counseling form first to set your Student ID.'); return; }
    const index = mySavedEventIds.indexOf(eventId);
    if (index > -1) mySavedEventIds.splice(index,1); else mySavedEventIds.push(eventId);
    const now = new Date(); now.setHours(0,0,0,0);
    const futureEvents = allEventsData.filter(event => new Date(event.date) >= now);
    renderUpcomingEvents(futureEvents); renderSavedEvents();
    try {
        await fetch('http://localhost:3001/api/saved-events/toggle', 
            { method:'POST', headers:{'Content-Type':'application/json'}, 
            body: JSON.stringify({ studentId, eventId }) });
    } catch (error) {
         console.error('Error toggling save:', error); 
        if (index > -1) mySavedEventIds.push(eventId); 
        else mySavedEventIds.splice(mySavedEventIds.indexOf(eventId),1); 
        renderUpcomingEvents(futureEvents); renderSavedEvents(); 
    }
}

function renderSavedEvents() {
    const savedList = document.getElementById('saved');
    if (!savedList) return;

    savedList.innerHTML = '';

    const now = new Date();
    now.setHours(0, 0, 0, 0);

    const savedEvents = allEventsData.filter(event =>
        mySavedEventIds.includes(event._id) && new Date(event.date) >= now
    );

    if (savedEvents.length === 0) {
        savedList.innerHTML =
            '<p style="text-align: center; color: #999; padding: 30px 20px;">No saved events.</p>';
        return;
    }

    savedEvents.forEach(event => {
        const dateString = new Date(event.date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
        });

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

        card.querySelector('.event-item-content').addEventListener('click', () =>
            openEventDetail_DYNAMIC(event._id)
        );

        const unsaveBtn = card.querySelector('.save-event-btn');
        unsaveBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (confirm('Are you sure you want to remove this event from your saved list?')) {
                toggleSaveEvent(e, event._id);
            }
        });

        savedList.appendChild(card);
    });
}

function switchTab(tabName) {
    document.querySelectorAll('.events-tabs .tab-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.textContent.includes('Events on')) {
            btn.textContent = 'Upcoming Events';
        }
    });

    if (event && event.target) event.target.classList.add('active');

    document.getElementById('upcoming').classList.remove('active');
    document.getElementById('saved').classList.remove('active');
    document.getElementById('history').classList.remove('active');

    document.getElementById(tabName).classList.add('active');

    if (tabName === 'upcoming') {
        const upcomingBtn = document.querySelector('.events-tabs .tab-btn:first-child');
        if (upcomingBtn) upcomingBtn.textContent = 'Upcoming Events';

        const searchInput = document.getElementById('eventSearchInput');
        if (searchInput) searchInput.value = '';

        const now = new Date();
        now.setHours(0, 0, 0, 0);
        const futureEvents = allEventsData.filter(e => new Date(e.date) >= now);

        renderUpcomingEvents(futureEvents);

        document.querySelectorAll('.calendar-day').forEach(d => d.style.border = 'none');
    }
}

// Notifications & helpers
async function fetchNotifications(studentId) {
    try {
        const response = await fetch(`http://localhost:3001/api/notifications/${studentId}`);
        const notifications = await response.json();
        renderNotifications(notifications);
    } catch (error) {
        console.error('Error loading notifications:', error);
    }
}

function renderNotifications(notifications) {
    const container = document.getElementById('latestItems');
    if (!container) return;

    container.innerHTML = '';

    if (!notifications || notifications.length === 0) {
        container.innerHTML =
            '<p style="font-size:12px; color:#999; padding:10px;">No new notifications.</p>';
        return;
    }

    notifications.forEach(notif => {
        const item = document.createElement('div');
        const readClass = notif.isRead ? 'read' : '';
        item.className = `latest-item ${readClass}`;

        const icon = `
            <div class="notif-icon">
                <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="#f59e0b" stroke-width="1.5">
                    <path d="M10 2l2.4 4.8h5.2l-4.2 3.2 1.6 4.8-4-3.2-4 3.2 1.6-4.8-4.2-3.2h5.2z"/>
                </svg>
            </div>`;

        const dotHTML = !notif.isRead ? `<div class="unread-dot"></div>` : '';

        const timeString = timeAgo(notif.createdAt);
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
    if (e) e.preventDefault();
    const studentId = localStorage.getItem('currentStudentId');
    if (!studentId) return;

    try {
        await fetch(`http://localhost:3001/api/notifications/mark-read/${studentId}`, {
            method: 'PATCH'
        });
        fetchNotifications(studentId);
    } catch (err) {
        console.error(err);
    }
}

// Registration modal logic
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
    if (!modal) return;

    const eventId = modal.dataset.eventId;
    const eventTitle = modal.dataset.eventTitle;
    const studentId = localStorage.getItem('currentStudentId');

    if (!studentId) {
        alert('Please complete the counseling form to set your Student ID.');
        return;
    }

    try {
        const response = await fetch('http://localhost:3001/api/registrations', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ eventId, eventTitle, studentId })
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Server error');

        alert('Registration successful. Your registration has been recorded.');
        closeRegistrationModal();

        const detailModal = document.getElementById('eventDetailModal');
        if (detailModal && detailModal.classList.contains('open')) {
            closeEventDetailModal();
        }

        fetchAndInitializeEvents();
    } catch (error) {
        console.error('Error submitting registration:', error);
        alert(error.message);
    }
}

function closeRegistrationModal() {
    const modal = document.getElementById('registrationModal');
    if (!modal) return;

    modal.setAttribute('aria-hidden', 'true');
    modal.classList.remove('open');
}