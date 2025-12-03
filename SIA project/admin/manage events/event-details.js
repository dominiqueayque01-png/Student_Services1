// File: event-details.js
const API_URL = 'http://localhost:3001/api/events';

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Get the ID from the URL
    const params = new URLSearchParams(window.location.search);
    const eventId = params.get('id');

    if (!eventId) {
        alert('No event specified. Returning to list.');
        window.location.href = 'index.html'; // Redirect back if no ID
        return;
    }

    // 2. Fetch the specific event
    try {
        const response = await fetch(`${API_URL}/${eventId}`);
        if (!response.ok) throw new Error('Event not found');
        
        const event = await response.json();
        
        // 3. Populate the HTML elements
        populateDetails(event);

    } catch (error) {
        console.error('Error:', error);
        alert('Error loading event details.');
    }
    
    // 4. Handle "Cancel" button to go back
    const backBtn = document.querySelector('.btn-cancel-details');
    if(backBtn) {
        backBtn.addEventListener('click', () => window.history.back());
    }
});



function populateDetails(event) {
    // Use MongoDB _id or id
    const id = event._id || event.id;

    // Basic Text Fields
    setText('detail-title', event.title);
    setText('detail-date', formatDate(event.date));
    setText('detail-time', event.time);
    setText('detail-location', event.location);
    setText('detail-about', event.about || event.description||"No description provided") ; // Handle both namings
    setText('detail-requirements', event.requirements || 'None');
    
    // Attendance Math
    const registered = event.registered || 0;
    const capacity = event.capacity || 0;
    setText('detail-attendance', `${registered}/${capacity}`);
    setText('detail-capacity-info', `${registered} participating`);
    setText('detail-capacity-text', `${Math.max(0, capacity - registered)} slots remaining`);

    if (event.requirements && event.requirements.includes('\n')) {
        const reqs = event.requirements.split('\n');
        // Create an HTML list
        const html = `<ul>${reqs.map(r => `<li>${r}</li>`).join('')}</ul>`;
        document.getElementById('detail-requirements').innerHTML = html;
    } else {
        setText('detail-requirements', event.requirements || 'No specific requirements.');
    }

    // Category Badge
    const catBadge = document.getElementById('detail-category');
    if (catBadge) {
        catBadge.textContent = event.category;
        catBadge.className = `event-category-badge ${event.category}`;
    }

    // Banner Image
    const banner = document.getElementById('detail-banner');
    if (banner) {
        banner.src = event.imageUrl || 'https://placehold.co/800x300';
    }

    // Expectations List
    const expList = document.getElementById('detail-expectations');
    if (expList && event.expectations) {
        expList.innerHTML = event.expectations.map(ex => `<li>${ex}</li>`).join('');
    }

    // Agenda Section
    const agendaDiv = document.getElementById('detail-agenda');
    if (agendaDiv && event.agenda) {
        agendaDiv.innerHTML = event.agenda.map((item, index) => `
            <div class="agenda-item-detail">
                <div class="agenda-number">${index + 1}</div>
                <div class="agenda-content">
                    <p class="agenda-time-detail">${item.time}</p>
                    <p class="agenda-title-detail">${item.title}</p>
                </div>
            </div>
        `).join('');
    }
}

// Helpers
function setText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
}

function formatDate(dateStr) {
    if (!dateStr) return 'TBD';
    return new Date(dateStr).toLocaleDateString('en-US', { 
        weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' 
    });
}