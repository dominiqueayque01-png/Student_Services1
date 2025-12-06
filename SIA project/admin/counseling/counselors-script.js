const API_URL_COUNSELORS = 'http://localhost:3001/api/counselors';
let counselorsData = [];
let currentEditingCounselorId = null;

document.addEventListener('DOMContentLoaded', () => {
    fetchCounselors();
    setupEventListeners();
});

// --- 1. FETCH DATA ---
async function fetchCounselors() {
    const grid = document.getElementById('counselors-grid');
    if (!grid) return;

    try {
        const response = await fetch(API_URL_COUNSELORS);
        if (!response.ok) throw new Error('Failed to fetch');
        
        const data = await response.json();
        
        // Map Data
        counselorsData = data.map(c => ({
            id: c._id,
            name: c.name,
            title: c.title,
            email: c.email,
            phone: c.phone,
            // Ensure it's an array (handles old data gracefully)
            availability: Array.isArray(c.availability) ? c.availability : [], 
            googleMeetLink: c.googleMeetLink || '',
            activeCases: c.activeCases || 0,
            totalCases: c.totalCases || 0
        }));

        renderCounselors();

    } catch (error) {
        console.error(error);
        grid.innerHTML = '<p style="grid-column:1/-1; text-align:center; color:red; padding:20px;">Error loading counselors.</p>';
    }
}

// --- 2. RENDER GRID ---
function renderCounselors() {
    const grid = document.getElementById('counselors-grid');
    const searchBox = document.getElementById('counselor-search');
    const term = searchBox ? searchBox.value.toLowerCase().trim() : '';
    
    grid.innerHTML = '';

    const filtered = counselorsData.filter(c => 
        c.name.toLowerCase().includes(term) || c.email.toLowerCase().includes(term)
    );

    if (filtered.length === 0) {
        grid.innerHTML = '<p style="grid-column:1/-1; text-align:center; color:#999; padding:20px;">No counselors found.</p>';
        return;
    }

    filtered.forEach(c => {
        const card = document.createElement('div');
        card.className = 'counselor-card';
        
        // Format Availability Array into HTML
        let availHtml = '<span style="color:#999; font-style:italic;">No schedule set</span>';
        
        if (c.availability.length > 0) {
            availHtml = c.availability.map(a => 
                `<div style="margin-bottom:2px;">
                    <strong>${a.day.substring(0,3)}:</strong> 
                    ${formatTime(a.startTime)} - ${formatTime(a.endTime)}
                 </div>`
            ).join('');
        }

        card.innerHTML = `
            <div class="counselor-card-header">
                <p class="counselor-name">${c.name}</p>
                <p class="counselor-title">${c.title}</p>
            </div>

            <div class="counselor-card-section">
                <div class="card-stat"><span>Active Cases</span><span>${c.activeCases}</span></div>
                <div class="card-stat"><span>Total Cases</span><span>${c.totalCases}</span></div>
            </div>

            <div class="counselor-card-section">
                <p class="card-label">Contact</p>
                <p class="card-contact">✉ ${c.email}</p>
                <p class="card-contact">☎ ${c.phone}</p>
            </div>

            <div class="counselor-card-section">
                <p class="card-label">Availability</p>
                <div class="card-availability" style="font-size:11px; color:#555;">${availHtml}</div>
            </div>

            <div class="counselor-card-actions">
                <button class="btn-edit-counselor" onclick="openCounselorModal(true, '${c.id}')">Edit</button>
                <button class="btn-remove-counselor" onclick="deleteCounselorConfirm('${c.id}')">Remove</button>
            </div>
        `;
        grid.appendChild(card);
    });
}

// --- 3. MODAL LOGIC ---
window.openCounselorModal = function(isEdit, id = null) {
    const modal = document.getElementById('counselor-modal');
    const title = document.getElementById('counselor-modal-title');
    const btn = document.getElementById('counselor-submit-btn');
    const list = document.getElementById('availability-list');
    
    currentEditingCounselorId = id;
    list.innerHTML = ''; // Clear previous rows

    if (isEdit && id) {
        const c = counselorsData.find(x => x.id === id);
        title.textContent = 'Edit Counselor';
        btn.textContent = 'Update Counselor';
        
        document.getElementById('counselor-name').value = c.name;
        document.getElementById('counselor-title').value = c.title;
        document.getElementById('counselor-email').value = c.email;
        document.getElementById('counselor-phone').value = c.phone;
        document.getElementById('counselor-meet-link').value = c.googleMeetLink;

        // Load existing rows
        if (c.availability.length > 0) {
            c.availability.forEach(a => addAvailItem(a.day, a.startTime, a.endTime));
        } else {
            addAvailItem('Monday', '', '');
        }
    } else {
        title.textContent = 'Add Counselor';
        btn.textContent = 'Add Counselor';
        document.querySelectorAll('#counselor-modal input').forEach(i => i.value = '');
        addAvailItem('Monday', '', ''); // Default empty row
    }

    modal.style.display = 'flex';
};

window.closeCounselorModal = function() {
    document.getElementById('counselor-modal').style.display = 'none';
};

// --- 4. ADD ROW HELPER ---
function addAvailItem(day, start, end) {
    const list = document.getElementById('availability-list');
    const div = document.createElement('div');
    div.className = 'avail-row'; // Used for gathering data later
    div.style.cssText = "display: flex; gap: 8px; margin-bottom: 8px; align-items: center;";
    
    div.innerHTML = `
        <select class="avail-day" style="padding: 8px; border: 1px solid #ddd; border-radius: 4px; flex: 1;">
            <option value="Monday" ${day === 'Monday' ? 'selected' : ''}>Mon</option>
            <option value="Tuesday" ${day === 'Tuesday' ? 'selected' : ''}>Tue</option>
            <option value="Wednesday" ${day === 'Wednesday' ? 'selected' : ''}>Wed</option>
            <option value="Thursday" ${day === 'Thursday' ? 'selected' : ''}>Thu</option>
            <option value="Friday" ${day === 'Friday' ? 'selected' : ''}>Fri</option>
            <option value="Saturday" ${day === 'Saturday' ? 'selected' : ''}>Sat</option>
        </select>
        <input type="time" class="avail-start" value="${start}" style="padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
        <span style="font-size:12px; color:#666;">to</span>
        <input type="time" class="avail-end" value="${end}" style="padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
        <button type="button" class="btn-remove-avail" style="color:#d32f2f; border:none; background:none; font-size:18px; cursor:pointer;">&times;</button>
    `;
    
    // Delete row logic
    div.querySelector('.btn-remove-avail').addEventListener('click', () => div.remove());
    
    list.appendChild(div);
}

// --- 5. SAVE LOGIC ---
document.getElementById('counselor-submit-btn')?.addEventListener('click', async (e) => {
    e.preventDefault();

    const name = document.getElementById('counselor-name').value.trim();
    const title = document.getElementById('counselor-title').value.trim();
    const email = document.getElementById('counselor-email').value.trim();
    const phone = document.getElementById('counselor-phone').value.trim();
    const link = document.getElementById('counselor-meet-link').value.trim();

    // Gather Availability Array
    const availability = [];
    document.querySelectorAll('.avail-row').forEach(row => {
        const day = row.querySelector('.avail-day').value;
        const start = row.querySelector('.avail-start').value;
        const end = row.querySelector('.avail-end').value;
        
        if (start && end) { // Only add if times are selected
            availability.push({ day, startTime: start, endTime: end });
        }
    });

    if (!name || !email) {
        alert("Name and Email are required.");
        return;
    }

    const payload = { name, title, email, phone, googleMeetLink: link, availability };

    try {
        const url = currentEditingCounselorId 
            ? `${API_URL_COUNSELORS}/${currentEditingCounselorId}` 
            : API_URL_COUNSELORS;
        const method = currentEditingCounselorId ? 'PATCH' : 'POST';

        const res = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (res.ok) {
            showCounselorToast(currentEditingCounselorId ? 'Counselor Updated!' : 'Counselor Added!', 'success');
            closeCounselorModal();
            fetchCounselors();
            const msg = currentEditingCounselorId 
                ? 'The counselor details have been updated successfully.' 
                : 'New counselor has been added to the system successfully.';
            
            openSuccessModal('Awesome!', msg);
        } else {
            alert('Error saving counselor');
        }
    } catch (err) { console.error(err); alert('Network Error'); }
});

// --- 6. DELETE & UTILS ---
let deleteId = null;
window.deleteCounselorConfirm = function(id) {
    deleteId = id;
    document.getElementById('delete-modal').style.display = 'flex';
};

document.querySelector('.btn-delete')?.addEventListener('click', async () => {
    if (!deleteId) return;
    try {
        const res = await fetch(`${API_URL_COUNSELORS}/${deleteId}`, { method: 'DELETE' });
        if (res.ok) {
            document.getElementById('delete-modal').style.display = 'none';
            fetchCounselors();
            showCounselorToast('Counselor removed', 'success');
            openSuccessModal('Deleted!', 'The counselor has been removed from the system.');
        }
    } catch (e) { console.error(e); }
});

function setupEventListeners() {
    document.getElementById('counselor-search')?.addEventListener('keyup', renderCounselors);
    
    // Add Schedule Button Listener
    document.getElementById('btn-add-avail')?.addEventListener('click', () => addAvailItem('Monday', '', ''));

    // Add Counselor Button
    const addBtn = document.querySelector('.btn-add-counselor');
    if(addBtn) addBtn.addEventListener('click', () => openCounselorModal(false));

    // Close Modals
    document.querySelectorAll('.modal-close, .btn-cancel').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.modal').forEach(m => m.style.display = 'none');
        });
    });
}

document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', function() {
            const page = this.getAttribute('data-page');
            if (page === 'index') window.location.href = 'index.html';
            else if (page === 'counselors') window.location.href = 'counselors.html';
            else if (page === 'announcements') window.location.href = 'announcements.html';
        });
    });

function formatTime(time) {
    if (!time) return '';
    const [h, m] = time.split(':');
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    return `${h12}:${m} ${ampm}`;
}

function showCounselorToast(message, type = 'success') {
    const div = document.createElement('div');
    div.className = `toast-notification ${type}`;
    div.innerHTML = `<div class="toast-message">${message}</div>`;
    document.body.appendChild(div);
    setTimeout(() => div.classList.add('show'), 10);
    setTimeout(() => { div.classList.remove('show'); setTimeout(() => div.remove(), 300); }, 3000);
}


// --- 7. SUCCESS MODAL FUNCTIONS ---
function openSuccessModal(title, message) {
    const modal = document.getElementById('success-modal');
    document.getElementById('success-modal-title').textContent = title;
    document.getElementById('success-modal-message').textContent = message;
    modal.style.display = 'flex';
}

function closeSuccessModal() {
    document.getElementById('success-modal').style.display = 'none';
}