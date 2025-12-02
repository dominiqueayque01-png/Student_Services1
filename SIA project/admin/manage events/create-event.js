const API_URL = 'http://localhost:3001/api/events';
let currentEventBanner = null;
let editingEventId = null;

document.addEventListener('DOMContentLoaded', async () => {
    
    // 1. CHECK EDIT MODE
    const params = new URLSearchParams(window.location.search);
    editingEventId = params.get('id');

    if (editingEventId) {
        document.querySelector('.events-page-title').textContent = 'Edit Event';
        document.getElementById('btn-publish').textContent = 'Update Event';
        await loadEventData(editingEventId);
    } else {
        addRequirementItem(''); // Add one default requirement
    }

    // 2. REQUIREMENTS LOGIC
    document.getElementById('btn-add-req').addEventListener('click', () => {
        addRequirementItem('');
    });

    document.getElementById('requirements-list').addEventListener('click', (e) => {
        if(e.target.classList.contains('btn-remove-item')) {
            e.target.parentElement.remove();
        }
    });

    // 3. AGENDA LOGIC
    document.querySelector('.btn-add-agenda').addEventListener('click', () => {
        addAgendaItem('', '');
    });

    document.getElementById('agenda-list').addEventListener('click', (e) => {
        if(e.target.classList.contains('btn-remove-agenda')) {
            e.target.parentElement.remove();
        }
    });

    // 4. IMAGE UPLOAD
    const uploadArea = document.getElementById('upload-area');
    const fileInput = document.getElementById('event-banner');
    
    if(uploadArea && fileInput) {
        uploadArea.addEventListener('click', () => fileInput.click());
        fileInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                // Size Check (5MB)
                if (file.size > 5 * 1024 * 1024) {
                    showToast('File is too large (Max 5MB)', 'error'); // <--- TOAST REPLACED ALERT
                    return;
                }
                const reader = new FileReader();
                reader.onload = function(event) {
                    currentEventBanner = event.target.result;
                    uploadArea.innerHTML = `<img src="${currentEventBanner}" style="max-height: 150px; width: 100%; object-fit: contain;">`;
                    uploadArea.style.borderColor = '#4CAF50';
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // 5. SUBMIT FORM
    document.getElementById('btn-publish').addEventListener('click', async () => {
        const title = document.getElementById('event-title').value.trim();
        const category = document.getElementById('event-category').value;
        const date = document.getElementById('event-date').value;
        const time = document.getElementById('event-time').value;
        const location = document.getElementById('event-location').value;
        const capacity = document.getElementById('event-capacity').value;
        const organization = document.getElementById('event-organization').value; 
        const description = document.getElementById('event-about').value;

        // Validation
        if (!title || !date || !time || !location || !organization) {
            showToast('Please fill in all required fields (*)', 'error'); // <--- TOAST REPLACED ALERT
            return;
        }

        // Gather Requirements
        const reqArray = [];
        document.querySelectorAll('.req-input').forEach(input => {
            if(input.value.trim()) reqArray.push(input.value.trim());
        });
        const requirementsString = reqArray.join('\n');

        // Gather Agenda
        const agenda = [];
        document.querySelectorAll('.agenda-item').forEach(item => {
            const t = item.querySelector('.agenda-time').value;
            const act = item.querySelector('.agenda-title').value;
            if(t && act) agenda.push({ time: t, title: act });
        });

        const payload = {
            title, category, date, time, location, capacity, organizer: organization, 
            description, 
            requirements: requirementsString, 
            agenda,
            imageUrl: currentEventBanner,
            status: editingEventId ? undefined : 'Pending'
        };

        try {
            let response;
            const headers = { 'Content-Type': 'application/json' };

            // Change button to indicate loading
            const btn = document.getElementById('btn-publish');
            const originalText = btn.textContent;
            btn.textContent = 'Saving...';
            btn.disabled = true;

            if (editingEventId) {
                response = await fetch(`${API_URL}/${editingEventId}`, {
                    method: 'PATCH', headers, body: JSON.stringify(payload)
                });
            } else {
                response = await fetch(API_URL, {
                    method: 'POST', headers, body: JSON.stringify(payload)
                });
            }

            const result = await response.json();

            // Reset button
            btn.textContent = originalText;
            btn.disabled = false;

            if (response.ok) {
                const msg = editingEventId ? 'Event Updated Successfully' : 'Event Created Successfully';
                showToast(msg, 'success'); // <--- TOAST
                
                // DELAY REDIRECT so user can see the message
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1500); // 1.5 seconds delay
            } else {
                showToast(result.message || 'Error saving event', 'error'); // <--- TOAST
            }
        } catch (error) {
            console.error(error);
            showToast('Network Error. Is server running?', 'error'); // <--- TOAST
            document.getElementById('btn-publish').disabled = false;
        }
    });
});

// --- HELPER FUNCTIONS ---

function addRequirementItem(text) {
    const list = document.getElementById('requirements-list');
    const div = document.createElement('div');
    div.className = 'requirement-item'; 
    div.style.cssText = "display: grid; grid-template-columns: 1fr 30px; gap: 10px; margin-bottom: 10px; align-items: center;";
    
    div.innerHTML = `
        <input type="text" class="req-input" value="${text}" placeholder="e.g. Bring ID" style="width: 100%; padding: 8px 12px; border: 1px solid #ddd; border-radius: 4px;">
        <button class="btn-remove-item" style="background: white; border: 1px solid #ddd; color: #d32f2f; padding: 4px 8px; cursor: pointer; border-radius: 3px;">×</button>
    `;
    list.appendChild(div);
}

function addAgendaItem(time, title) {
    const list = document.getElementById('agenda-list');
    const div = document.createElement('div');
    div.className = 'agenda-item';
    div.style.cssText = "display: grid; grid-template-columns: 100px 1fr 30px; gap: 10px; margin-bottom: 10px; align-items: center;";
    
    div.innerHTML = `
        <input type="time" class="agenda-time" value="${time}" style="width: 100%; padding: 8px 12px; border: 1px solid #ddd; border-radius: 4px;">
        <input type="text" class="agenda-title" value="${title}" placeholder="Activity Name" style="width: 100%; padding: 8px 12px; border: 1px solid #ddd; border-radius: 4px;">
        <button class="btn-remove-agenda" style="background: white; border: 1px solid #ddd; color: #d32f2f; padding: 4px 8px; cursor: pointer; border-radius: 3px;">×</button>
    `;
    list.appendChild(div);
}

async function loadEventData(id) {
    try {
        const response = await fetch(`${API_URL}/${id}`);
        const event = await response.json();

        // Populate Fields
        document.getElementById('event-title').value = event.title;
        document.getElementById('event-category').value = event.category;
        document.getElementById('event-date').value = event.date ? new Date(event.date).toISOString().split('T')[0] : '';
        document.getElementById('event-time').value = event.time;
        document.getElementById('event-location').value = event.location;
        document.getElementById('event-capacity').value = event.capacity;
        document.getElementById('event-organization').value = event.organization;
        document.getElementById('event-about').value = event.description || event.about || '';

        // Populate Requirements
        const reqList = document.getElementById('requirements-list');
        reqList.innerHTML = ''; 
        if (event.requirements) {
            const reqs = event.requirements.split('\n');
            reqs.forEach(r => addRequirementItem(r));
        } else {
            addRequirementItem('');
        }

        // Populate Agenda
        const agendaList = document.getElementById('agenda-list');
        agendaList.innerHTML = '';
        if (event.agenda && event.agenda.length > 0) {
            event.agenda.forEach(a => addAgendaItem(a.time, a.title));
        } else {
            addAgendaItem('', '');
        }

        // Image
        if (event.imageUrl) {
            currentEventBanner = event.imageUrl;
            const uploadArea = document.getElementById('upload-area');
            uploadArea.innerHTML = `<img src="${currentEventBanner}" style="max-height: 150px; width: 100%; object-fit: contain;">`;
            uploadArea.style.borderColor = '#4CAF50';
        }

    } catch (error) {
        console.error(error);
        showToast('Error loading event data', 'error'); // <--- TOAST
    }
}

// --- TOAST NOTIFICATION FUNCTION ---
function showToast(message, type = 'success') {
    const existingToast = document.querySelector('.toast-notification');
    if (existingToast) existingToast.remove();

    const toast = document.createElement('div');
    toast.className = `toast-notification ${type}`;
    
    // Ensure CSS exists for this class (in events-styles.css)
    
    const iconSymbol = type === 'success' ? '✓' : '!';

    toast.innerHTML = `
        <div class="toast-icon">${iconSymbol}</div>
        <div class="toast-message">${message}</div>
    `;

    document.body.appendChild(toast);

    setTimeout(() => { toast.classList.add('show'); }, 10);
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => { toast.remove(); }, 300);
    }, 3000);
}