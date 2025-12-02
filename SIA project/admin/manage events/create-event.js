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
        addRequirementItem(''); 
    }

    // 2. REQUIREMENTS LOGIC
    const btnAddReq = document.getElementById('btn-add-req');
    if (btnAddReq) {
        btnAddReq.addEventListener('click', () => addRequirementItem(''));
    }

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
                if (file.size > 5 * 1024 * 1024) {
                    showToast('File is too large (Max 5MB)', 'error');
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
        // --- A. GATHER VARIABLES ---
        const title = document.getElementById('event-title').value.trim();
        const category = document.getElementById('event-category').value;
        const date = document.getElementById('event-date').value;
        const location = document.getElementById('event-location').value;
        const capacity = document.getElementById('event-capacity').value;
        
        // FIX: Organization Logic
        // Check for both IDs just in case
        const orgInput = document.getElementById('event-organization') || document.getElementById('event-organization');
        const organizationValue = orgInput ? orgInput.value : '';

        // FIX: Description Logic
        const aboutInput = document.getElementById('event-about');
        const descriptionValue = aboutInput ? aboutInput.value : '';

        // FIX: Time Logic (Start & End)
        // We do NOT use 'event-time' anymore because that ID was removed from HTML
        const startTimeVal = document.getElementById('event-start-time').value;
        const endTimeVal = document.getElementById('event-end-time').value;
        
        let finalTime = '';
        if (startTimeVal && endTimeVal) {
            finalTime = `${convertTo12Hour(startTimeVal)} - ${convertTo12Hour(endTimeVal)}`;
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
            if(t && act) agenda.push({ time: convertTo12Hour(t), title: act });
        });

        // --- B. VALIDATION ---
        // We check startTimeVal instead of 'time' variable
        if (!title || !date || !startTimeVal || !location || !organizationValue) {
            showToast('Please fill in all required fields (*)', 'error');
            return;
        }

        // --- C. PREPARE PAYLOAD ---
        const payload = {
            title, category, date, location, capacity, 
            time: finalTime,          // Send combined string
            description: descriptionValue, // Send as 'description' to match backend
            requirements: requirementsString, 
            agenda,
            imageUrl: currentEventBanner,
            organization: organizationValue, // Send as 'organizer' to match backend
            status: editingEventId ? undefined : 'Pending'
        };

        // --- D. SEND TO SERVER ---
        try {
            let response;
            const headers = { 'Content-Type': 'application/json' };
            const btn = document.getElementById('btn-publish');
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
            btn.disabled = false;
            btn.textContent = editingEventId ? 'Update Event' : 'Submit Request';

            if (response.ok) {
                const msg = editingEventId ? 'Event Updated Successfully' : 'Event Created Successfully';
                showToast(msg, 'success');
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1500);
            } else {
                console.error(result);
                showToast(result.message || 'Error saving event', 'error');
            }
        } catch (error) {
            console.error(error);
            showToast('Network Error', 'error');
            document.getElementById('btn-publish').disabled = false;
        }
    });
});

// --- HELPER FUNCTIONS ---

async function loadEventData(id) {
    try {
        const response = await fetch(`${API_URL}/${id}`);
        const event = await response.json();

        document.getElementById('event-title').value = event.title;
        document.getElementById('event-category').value = event.category;
        
        // Date Format
        if(event.date) {
            const d = new Date(event.date);
            document.getElementById('event-date').value = d.toISOString().split('T')[0];
        }

        document.getElementById('event-location').value = event.location;
        document.getElementById('event-capacity').value = event.capacity;
        
        // Organization
        const orgInput = document.getElementById('event-organization') || document.getElementById('event-organization');
        if(orgInput) orgInput.value = event.organization;

        document.getElementById('event-about').value = event.description || event.about || '';

        // FIX: TIME POPULATION WAS OUTSIDE FUNCTION PREVIOUSLY
        if (event.time && event.time.includes(' - ')) {
            const parts = event.time.split(' - ');
            document.getElementById('event-start-time').value = convertTo24Hour(parts[0]);
            document.getElementById('event-end-time').value = convertTo24Hour(parts[1]);
        } else {
            document.getElementById('event-start-time').value = convertTo24Hour(event.time);
        }

        // Requirements
        const reqList = document.getElementById('requirements-list');
        reqList.innerHTML = ''; 
        if (event.requirements) {
            const reqs = event.requirements.split('\n');
            reqs.forEach(r => addRequirementItem(r));
        } else {
            addRequirementItem('');
        }

        // Agenda
        const agendaList = document.getElementById('agenda-list');
        agendaList.innerHTML = '';
        if (event.agenda && event.agenda.length > 0) {
            event.agenda.forEach(a => addAgendaItem(convertTo24Hour(a.time), a.title));
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
        showToast('Error loading event data', 'error');
    }
}

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

function showToast(message, type = 'success') {
    const existingToast = document.querySelector('.toast-notification');
    if (existingToast) existingToast.remove();

    const toast = document.createElement('div');
    toast.className = `toast-notification ${type}`;
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

// --- TIME HELPERS ---
function convertTo12Hour(time24) {
    if (!time24) return '';
    const [hours, minutes] = time24.split(':');
    let h = parseInt(hours, 10);
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12; 
    return `${h}:${minutes} ${ampm}`;
}

function convertTo24Hour(time12) {
    if (!time12) return '';
    const [time, modifier] = time12.split(' ');
    let [hours, minutes] = time.split(':');
    if (hours === '12') hours = '00';
    if (modifier === 'PM') hours = parseInt(hours, 10) + 12;
    return `${String(hours).padStart(2, '0')}:${minutes}`;
}