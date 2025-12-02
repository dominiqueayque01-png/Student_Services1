// ========== REGISTRATIONS PAGE (DYNAMIC) ==========

const API_URL = 'http://localhost:3001/api/registrations'; // Adjust port if needed
let registrationsData = []; // Now empty, populated by fetch

// --- 1. FETCH REAL DATA ---
document.addEventListener('DOMContentLoaded', () => {
    fetchRegistrations();
    setupEventListeners();
});

async function fetchRegistrations() {
    try {
        // This calls the "Super Route" we built to merge Student + Event data
        const response = await fetch(`${API_URL}/admin/all`);
        
        if (!response.ok) throw new Error('Failed to fetch data');
        
        const rawData = await response.json();

        // Map the data for easier use
        registrationsData = rawData.map(reg => ({
            id: reg._id, // Store MongoDB ID for editing/deleting
            studentName: reg.studentName || 'Unknown Student',
            studentId: reg.studentId || 'N/A',
            email: reg.email,
            phone: reg.phone,
            event: reg.event, // Event Title
            organization: reg.organization,
            category: reg.category,
            registrationDate: formatDate(reg.registrationDate),
            status: reg.status
        }));

        // Initialize UI
        updateStatsCards();
        updateFilterOptions();
        updateRegistrationsTable();

    } catch (error) {
        console.error('Error:', error);
        // Show empty state or error notification
        document.getElementById('registrations-tbody').innerHTML = 
            `<tr><td colspan="5" style="text-align:center; padding:20px;">Error loading registrations. Is the server running?</td></tr>`;
    }
}

// --- 2. RENDER TABLE ---
function updateRegistrationsTable() {
    const tbody = document.getElementById('registrations-tbody');
    tbody.innerHTML = '';
    
    // Get current filter values
    const statusFilter = document.getElementById('filter-status')?.value || '';
    const eventFilter = document.getElementById('filter-events')?.value || '';
    const orgFilter = document.getElementById('filter-organization')?.value || '';
    const searchTerm = document.getElementById('search-input')?.value.toLowerCase() || '';
    
    // Filter Logic
    const filteredRegs = registrationsData.filter(r => {
        // Dropdowns
        if (statusFilter && r.status !== statusFilter) return false;
        if (eventFilter && r.event !== eventFilter) return false;
        if (orgFilter && r.organization !== orgFilter) return false;
        
        // Search (Name, ID, or Event Title)
        if (searchTerm) {
            const searchStr = `${r.studentName} ${r.studentId} ${r.event}`.toLowerCase();
            if (!searchStr.includes(searchTerm)) return false;
        }
        return true;
    });
    
    if (filteredRegs.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding:20px; color:#999;">No registrations found</td></tr>`;
    } else {
        filteredRegs.forEach(reg => {
            const row = document.createElement('tr');
            
            // Get color badge class based on category
            const badgeClass = (reg.category || 'academic').toLowerCase();
            const statusClass = (reg.status || 'pending').toLowerCase();

            row.innerHTML = `
                <td>${reg.studentName}</td>
                <td>${reg.studentId}</td>
                <td><span class="event-badge ${badgeClass}">${reg.event}</span></td>
                <td>${reg.registrationDate}</td>
            `;
            tbody.appendChild(row);
        });
    }
    
    // Update Stats and Info
    updateStatsCards(filteredRegs);
    const info = document.getElementById('table-info');
    if(info) info.textContent = `Showing ${filteredRegs.length} registrations`;

    // Re-attach listeners to the new buttons
    attachActionListeners();
}

// --- 3. DYNAMIC DROPDOWNS ---
function updateFilterOptions() {
    const eventDropdown = document.getElementById('filter-events');
    const orgDropdown = document.getElementById('filter-organization');
    
    // Extract unique values
    const uniqueEvents = [...new Set(registrationsData.map(r => r.event))].sort();
    const uniqueOrgs = [...new Set(registrationsData.map(r => r.organization))].sort();

    if (eventDropdown) {
        eventDropdown.innerHTML = '<option value="">All Events</option>';
        uniqueEvents.forEach(evt => eventDropdown.innerHTML += `<option value="${evt}">${evt}</option>`);
    }
    
    if (orgDropdown) {
        orgDropdown.innerHTML = '<option value="">All Organizations</option>';
        uniqueOrgs.forEach(org => orgDropdown.innerHTML += `<option value="${org}">${org}</option>`);
    }
}

// --- 4. VIEW & CANCEL LOGIC ---
function attachActionListeners() {
    // VIEW BUTTON
    document.querySelectorAll('.btn-view').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.target.getAttribute('data-id');
            const reg = registrationsData.find(r => r.id === id);
            if (reg) openViewModal(reg);
        });
    });

    // CANCEL BUTTON (Quick Delete)
    document.querySelectorAll('.btn-cancel-reg').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const id = e.target.getAttribute('data-id');
            if (confirm('Are you sure you want to cancel this registration?')) {
                await deleteRegistration(id);
            }
        });
    });
}

function openViewModal(reg) {
    document.getElementById('view-student-name').textContent = reg.studentName;
    document.getElementById('view-student-id').textContent = reg.studentId;
    document.getElementById('view-student-email').textContent = reg.email || 'N/A';
    document.getElementById('view-student-phone').textContent = reg.phone || 'N/A';
    document.getElementById('view-registration-event').textContent = reg.event;
    document.getElementById('view-registration-date').textContent = reg.registrationDate;
    
    const statusBadge = document.getElementById('view-registration-status');
    statusBadge.innerHTML = `<span class="status-badge ${reg.status.toLowerCase()}">${reg.status}</span>`;
    
    // Store ID for editing
    window.currentEditingRegId = reg.id; 
    
    document.getElementById('view-registration-modal').style.display = 'flex';
}

// --- 5. EDIT/UPDATE STATUS ---
// (Logic for the "Edit Registration" button inside the View Modal)
document.getElementById('btn-edit-registration')?.addEventListener('click', () => {
    const reg = registrationsData.find(r => r.id === window.currentEditingRegId);
    if(!reg) return;

    // Populate Edit Form
    document.getElementById('edit-student-name').value = reg.studentName;
    document.getElementById('edit-student-id').value = reg.studentId;
    document.getElementById('edit-student-email').value = reg.email;
    document.getElementById('edit-student-phone').value = reg.phone;
    document.getElementById('edit-registration-status').value = reg.status;
    
    // Note: Event dropdown might need manual population if we want to change events, 
    // but usually we just change status. For now, we lock event or populate simply.
    
    document.getElementById('view-registration-modal').style.display = 'none';
    document.getElementById('edit-registration-modal').style.display = 'flex';
});

document.getElementById('btn-save-registration')?.addEventListener('click', async () => {
    const newStatus = document.getElementById('edit-registration-status').value;
    
    try {
        const response = await fetch(`${API_URL}/${window.currentEditingRegId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus })
        });

        if (response.ok) {
            alert('Registration Updated');
            document.getElementById('edit-registration-modal').style.display = 'none';
            fetchRegistrations(); // Refresh table
        } else {
            alert('Update failed');
        }
    } catch (error) {
        console.error(error);
        alert('Network Error');
    }
});

// --- 6. DELETE API CALL ---
async function deleteRegistration(id) {
    try {
        const response = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
        if (response.ok) {
            alert('Registration Cancelled');
            fetchRegistrations();
        } else {
            alert('Failed to cancel');
        }
    } catch (error) {
        console.error(error);
    }
}

// --- UTILITIES ---
function formatDate(dateStr) {
    if(!dateStr) return 'TBD';
    return new Date(dateStr).toLocaleDateString('en-GB'); // 15/10/2025 format
}

function setupEventListeners() {
    // Search & Filters
    ['filter-status', 'filter-events', 'filter-organization'].forEach(id => {
        document.getElementById(id)?.addEventListener('change', updateRegistrationsTable);
    });
    document.getElementById('search-input')?.addEventListener('keyup', updateRegistrationsTable);

    // Modal Closing
    document.querySelectorAll('.modal-close, .btn-cancel').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.modal').forEach(m => m.style.display = 'none');
        });
    });
}

// --- UPDATE STATS CARDS ---
function updateStatsCards() {
    const statsContainer = document.getElementById('stats-container');
    if (!statsContainer) return;
    
    statsContainer.innerHTML = ''; // Clear existing static cards

    // 1. Calculate Counts
    // We create an object to store counts for each event:
    // { "Tech Talk": { total: 5, confirmed: 3 }, "Career Fair": { total: 10, confirmed: 8 } }
    const statsMap = {};

    registrationsData.forEach(reg => {
        const eventName = reg.event || "Unknown Event";
        
        // Initialize if not exists
        if (!statsMap[eventName]) {
            statsMap[eventName] = { total: 0, confirmed: 0 };
        }

        // Increment Total
        statsMap[eventName].total++;

        // Increment Confirmed only if status matches
        if (reg.status === 'Confirmed') {
            statsMap[eventName].confirmed++;
        }
    });

    // 2. Generate HTML Cards
    Object.keys(statsMap).forEach(eventName => {
        const data = statsMap[eventName];
        
        const card = document.createElement('div');
        card.className = 'stat-card'; // Uses your existing CSS
        
        card.innerHTML = `
            <h3>${eventName}</h3>
            <p class="number">${data.confirmed}</p>
            <p class="subtitle">/${data.total} total registrations</p>
        `;
        
        statsContainer.appendChild(card);
    });
}